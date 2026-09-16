import { PokemonListParams } from '../../domain/repositories/PokemonRepository';
import { PokemonDetailResponseDto } from './pokemonDetailDto';
import { PokemonListResponseDto } from './pokemonListDto';
import { NetworkRequestError } from './NetworkRequestError';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export class PokeApiPokemonDataSource {
  async getPokemonList(params: PokemonListParams): Promise<PokemonListResponseDto> {
    const url = `${POKE_API_BASE_URL}?limit=${params.limit}&offset=${params.offset}`;
    return this.getJson<PokemonListResponseDto>(url);
  }

  async getPokemonById(identifier: number | string): Promise<PokemonDetailResponseDto> {
    const url = `${POKE_API_BASE_URL}/${encodeURIComponent(String(identifier))}`;
    return this.getJson<PokemonDetailResponseDto>(url);
  }

  private async getJson<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url);
    } catch (cause: unknown) {
      throw new NetworkRequestError(cause);
    }

    if (!response.ok) {
      throw new Error(`PokéAPI request failed with status ${response.status}`);
    }

    try {
      return (await response.json()) as T;
    } catch (cause: unknown) {
      // A response body can fail to download after headers have arrived.
      if (cause instanceof TypeError) {
        throw new NetworkRequestError(cause);
      }
      throw cause;
    }
  }
}
