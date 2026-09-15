import { PokemonDetail } from '../../domain/models/PokemonDetail';
import { PokemonDetailResponseDto } from './pokemonDetailDto';

const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const DECIMETRES_PER_METRE = 10;
const HECTOGRAMS_PER_KILOGRAM = 10;

export function mapPokemonDetailResponse(
  response: PokemonDetailResponseDto,
): PokemonDetail {
  const types = [...response.types]
    .sort((left, right) => left.slot - right.slot)
    .map((slot) => slot.type.name);

  const abilities = [...response.abilities]
    .sort((left, right) => left.slot - right.slot)
    .map((slot) => slot.ability.name);

  const stats = response.stats.map((stat) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  }));

  return {
    id: response.id,
    name: response.name,
    imageUrl: `${SPRITE_BASE_URL}/${response.id}.png`,
    types,
    abilities,
    stats,
    height: response.height / DECIMETRES_PER_METRE,
    weight: response.weight / HECTOGRAMS_PER_KILOGRAM,
  };
}
