import { PokemonDetail } from '../../domain/models/PokemonDetail';
import { PokemonListPage, PokemonListParams, PokemonRepository } from '../../domain/repositories/PokemonRepository';
import { PokemonCache } from '../persistence/PokemonCache';
import { NetworkRequestError } from '../pokeApi/NetworkRequestError';

/** Network-first decorator; persistence is best effort and never replaces fresh data. */
export class CachedPokemonRepository implements PokemonRepository {
  constructor(
    private readonly remote: PokemonRepository,
    private readonly cache: PokemonCache,
  ) {}

  getList(params: PokemonListParams): Promise<PokemonListPage> {
    return this.request(
      () => this.remote.getList(params),
      () => this.cache.readList(params),
      (page) => this.cache.writeList(params, page),
    );
  }

  getById(id: number): Promise<PokemonDetail> {
    return this.request(
      () => this.remote.getById(id),
      () => this.cache.readDetail(id),
      (detail) => this.cache.writeDetail(id, detail),
    );
  }

  private async request<T>(
    remote: () => Promise<T>,
    read: () => Promise<T | null>,
    write: (value: T) => Promise<void>,
  ): Promise<T> {
    let fresh: T;
    try {
      fresh = await remote();
    } catch (error: unknown) {
      if (error instanceof NetworkRequestError) {
        try {
          const cached = await read();
          if (cached !== null) return cached;
        } catch {
          // Unreadable or corrupt cache: preserve the original network error.
        }
      }
      throw error;
    }

    try {
      await write(fresh);
    } catch {
      // Storage is optional; a successful remote response remains usable.
    }
    return fresh;
  }
}
