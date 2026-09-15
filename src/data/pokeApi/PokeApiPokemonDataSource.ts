import { PokemonListParams } from '../../domain/repositories/PokemonRepository';
import { PokemonListResponseDto } from './pokemonListDto';

const POKE_API_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

export class PokeApiPokemonDataSource {
  async getPokemonList(
    params: PokemonListParams,
  ): Promise<PokemonListResponseDto> {
    const url = `${POKE_API_BASE_URL}?limit=${params.limit}&offset=${params.offset}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `PokéAPI request failed with status ${response.status}`,
      );
    }

    const data: PokemonListResponseDto =
      (await response.json()) as PokemonListResponseDto;

    return data;
  }
}
