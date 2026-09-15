import { PokemonListParams } from '../../domain/repositories/PokemonRepository';
import { PokemonDetailResponseDto } from './pokemonDetailDto';
import { PokemonListResponseDto } from './pokemonListDto';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export class PokeApiPokemonDataSource {
  async getPokemonList(
    params: PokemonListParams,
  ): Promise<PokemonListResponseDto> {
    const url = `${POKE_API_BASE_URL}?limit=${params.limit}&offset=${params.offset}`;
    return this.getJson<PokemonListResponseDto>(url);
  }

  async getPokemonById(id: number): Promise<PokemonDetailResponseDto> {
    const url = `${POKE_API_BASE_URL}/${id}`;
    return this.getJson<PokemonDetailResponseDto>(url);
  }

  private async getJson<T>(url: string): Promise<T> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `PokéAPI request failed with status ${response.status}`,
      );
    }

    return (await response.json()) as T;
  }
}
