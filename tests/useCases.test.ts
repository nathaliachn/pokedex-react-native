import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Pokemon } from '../src/domain/models/Pokemon';
import { PokemonDetail } from '../src/domain/models/PokemonDetail';
import {
  PokemonListPage,
  PokemonListParams,
  PokemonRepository,
} from '../src/domain/repositories/PokemonRepository';
import { GetPokemonDetail } from '../src/domain/useCases/GetPokemonDetail';
import { GetPokemonList } from '../src/domain/useCases/GetPokemonList';

class RecordingPokemonRepository implements PokemonRepository {
  public listCalls: PokemonListParams[] = [];
  public detailCalls: number[] = [];

  async getList(params: PokemonListParams): Promise<PokemonListPage> {
    this.listCalls.push(params);
    const items: Pokemon[] = [];
    return { items, totalCount: 0, nextOffset: null };
  }

  async getById(id: number): Promise<PokemonDetail> {
    this.detailCalls.push(id);
    return {
      id,
      name: 'bulbasaur',
      imageUrl: 'https://example.com/1.png',
      types: [],
      abilities: [],
      stats: [],
      height: 0.7,
      weight: 6.9,
    };
  }
}

describe('GetPokemonList', () => {
  it('forwards the provided pagination params to the repository', async () => {
    const repository = new RecordingPokemonRepository();
    const getPokemonList = new GetPokemonList(repository);

    await getPokemonList.execute({ limit: 10, offset: 40 });

    assert.deepEqual(repository.listCalls, [{ limit: 10, offset: 40 }]);
  });

  it('forwards the default first-page params when none are provided', async () => {
    const repository = new RecordingPokemonRepository();
    const getPokemonList = new GetPokemonList(repository);

    await getPokemonList.execute();

    assert.deepEqual(repository.listCalls, [{ limit: 20, offset: 0 }]);
  });
});

describe('GetPokemonDetail', () => {
  it('forwards the Pokémon id to the repository', async () => {
    const repository = new RecordingPokemonRepository();
    const getPokemonDetail = new GetPokemonDetail(repository);

    await getPokemonDetail.execute(25);

    assert.deepEqual(repository.detailCalls, [25]);
  });
});
