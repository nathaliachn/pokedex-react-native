import { Pokemon } from '../../domain/models/Pokemon';
import { PokemonListPage } from '../../domain/repositories/PokemonRepository';
import {
  PokemonListItemDto,
  PokemonListResponseDto,
} from './pokemonListDto';

const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export function mapPokemonListResponse(
  response: PokemonListResponseDto,
  offset: number,
): PokemonListPage {
  return {
    items: response.results.map(mapPokemonListItem),
    nextOffset: response.next === null ? null : offset + response.results.length,
  };
}

function mapPokemonListItem(item: PokemonListItemDto): Pokemon {
  const id = extractPokemonIdFromUrl(item.url);

  return {
    id,
    name: item.name,
    imageUrl: `${SPRITE_BASE_URL}/${id}.png`,
  };
}

function extractPokemonIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);

  if (match === null) {
    throw new Error(`Unable to extract Pokémon ID from url: ${url}`);
  }

  return Number(match[1]);
}
