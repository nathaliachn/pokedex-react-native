import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PokemonCache } from '../src/data/persistence/PokemonCache';
import { TextStorage } from '../src/data/persistence/TextStorage';
import { CachedPokemonRepository } from '../src/data/repositories/CachedPokemonRepository';
import { NetworkRequestError } from '../src/data/pokeApi/NetworkRequestError';
import { PokemonDetail } from '../src/domain/models/PokemonDetail';
import { PokemonListPage, PokemonRepository } from '../src/domain/repositories/PokemonRepository';
import { appendUniquePokemon } from '../src/features/pokemonList/listPagination';

// Test double only: the application uses ExpoFileTextStorage, never this map.
class RecordingStorage implements TextStorage {
  readonly files = new Map<string, string>();
  failRead = false;
  failWrite = false;
  async read(key: string): Promise<string | null> {
    if (this.failRead) throw new Error('Read failed');
    return this.files.get(key) ?? null;
  }
  async write(key: string, value: string): Promise<void> {
    if (this.failWrite) throw new Error('Disk full');
    this.files.set(key, value);
  }
}

const params = { limit: 20, offset: 0 };
const detail: PokemonDetail = {
  id: 1, name: 'bulbasaur', imageUrl: 'https://example.com/1.png',
  types: ['grass'], abilities: ['overgrow'], stats: [{ name: 'hp', value: 45 }],
  height: 0.7, weight: 6.9,
};
const page: PokemonListPage = {
  items: [{ id: detail.id, name: detail.name, imageUrl: detail.imageUrl }],
  totalCount: 1350,
  nextOffset: 20,
};
const networkError = new NetworkRequestError(new TypeError('Offline'));

class RemoteStub implements PokemonRepository {
  error: Error | null = null;
  page = page;
  detail = detail;
  async getList(): Promise<PokemonListPage> {
    if (this.error) throw this.error;
    return this.page;
  }
  async getById(): Promise<PokemonDetail> {
    if (this.error) throw this.error;
    return this.detail;
  }
}

function setup() {
  const storage = new RecordingStorage();
  const remote = new RemoteStub();
  const cache = new PokemonCache(storage);
  return { storage, remote, cache, repository: new CachedPokemonRepository(remote, cache) };
}

describe('Persistent Pokemon repository', () => {
  it('persists successful remote list and detail results as JSON', async () => {
    const { repository, storage, cache } = setup();
    assert.deepEqual(await repository.getList(params), page);
    assert.deepEqual(await repository.getById(1), detail);
    assert.equal(storage.files.size, 2);
    assert.deepEqual(await cache.readList(params), page);
    assert.deepEqual(await cache.readDetail(1), detail);
  });

  it('reads persisted list data through recreated repository/cache instances', async () => {
    const { repository, storage, remote } = setup();
    await repository.getList(params);
    remote.error = networkError;
    const recreated = new CachedPokemonRepository(remote, new PokemonCache(storage));
    assert.deepEqual(await recreated.getList(params), page);
  });

  it('reads persisted detail data through recreated repository/cache instances', async () => {
    const { repository, storage, remote } = setup();
    await repository.getById(1);
    remote.error = networkError;
    const recreated = new CachedPokemonRepository(remote, new PokemonCache(storage));
    assert.deepEqual(await recreated.getById(1), detail);
  });

  it('preserves the original network error for uncached lists and details', async () => {
    const { repository, remote } = setup();
    remote.error = networkError;
    await assert.rejects(() => repository.getList(params), (e) => e === networkError);
    await assert.rejects(() => repository.getById(1), (e) => e === networkError);
  });

  it('returns fresh list/detail data even when writes fail and stale data exists', async () => {
    const { repository, storage, remote } = setup();
    await repository.getList(params);
    await repository.getById(1);
    remote.page = { items: [], totalCount: 1350, nextOffset: null };
    remote.detail = { ...detail, name: 'updated' };
    storage.failWrite = true;
    assert.deepEqual(await repository.getList(params), remote.page);
    assert.deepEqual(await repository.getById(1), remote.detail);
  });

  it('refreshes persisted data after a successful subsequent response', async () => {
    const { repository, remote, cache } = setup();
    await repository.getList(params);
    remote.page = { items: [], totalCount: 1350, nextOffset: null };
    await repository.getList(params);
    assert.deepEqual(await cache.readList(params), remote.page);
  });

  it('preserves network errors if storage reads fail', async () => {
    const { repository, storage, remote } = setup();
    remote.error = networkError;
    storage.failRead = true;
    await assert.rejects(() => repository.getList(params), (e) => e === networkError);
    await assert.rejects(() => repository.getById(1), (e) => e === networkError);
  });

  it('does not hide HTTP or mapping errors behind cached data', async () => {
    const { repository, remote } = setup();
    await repository.getList(params);
    await repository.getById(1);
    for (const error of [new Error('HTTP 404'), new SyntaxError('Invalid response')]) {
      remote.error = error;
      await assert.rejects(() => repository.getList(params), (e) => e === error);
      await assert.rejects(() => repository.getById(1), (e) => e === error);
    }
  });

  it('keeps page keys separate and merges cached overlapping pages without duplicates', async () => {
    const { repository, remote } = setup();
    await repository.getList(params);
    remote.page = {
      items: [...page.items, { id: 2, name: 'ivysaur', imageUrl: 'https://example.com/2.png' }],
      totalCount: 1350,
      nextOffset: null,
    };
    await repository.getList({ limit: 20, offset: 20 });
    remote.error = networkError;
    const first = await repository.getList(params);
    const second = await repository.getList({ limit: 20, offset: 20 });
    assert.equal(first.nextOffset, 20);
    assert.equal(second.nextOffset, null);
    assert.deepEqual(appendUniquePokemon(first.items, second.items).map((p) => p.id), [1, 2]);
    await assert.rejects(() => repository.getList({ limit: 10, offset: 0 }), (e) => e === networkError);
    await assert.rejects(() => repository.getList({ limit: 20, offset: 40 }), (e) => e === networkError);
    await assert.rejects(() => repository.getById(2), (e) => e === networkError);
  });

  it('treats invalid JSON, invalid shapes and non-advancing offsets as cache misses', async () => {
    const { repository, storage, remote } = setup();
    remote.error = networkError;
    for (const invalid of ['{', 'null', '{}', JSON.stringify({ ...page, nextOffset: 0 }),
      JSON.stringify({ items: [{ id: 1 }], nextOffset: null })]) {
      storage.files.set('list-20-0', invalid);
      await assert.rejects(() => repository.getList(params), (e) => e === networkError);
    }
    for (const invalid of ['{', '{}', JSON.stringify({ ...detail, id: 2 }),
      JSON.stringify({ ...detail, stats: [null] })]) {
      storage.files.set('detail-1', invalid);
      await assert.rejects(() => repository.getById(1), (e) => e === networkError);
    }
  });
});
