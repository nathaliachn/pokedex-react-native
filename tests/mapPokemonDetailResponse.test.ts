import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapPokemonDetailResponse } from '../src/data/pokeApi/mapPokemonDetailResponse';
import { PokemonDetailResponseDto } from '../src/data/pokeApi/pokemonDetailDto';

function namedResource(
  name: string,
): PokemonDetailResponseDto['types'][number]['type'] {
  return {
    name,
    url: `https://pokeapi.co/api/v2/${name}/`,
  };
}

describe('mapPokemonDetailResponse', () => {
  it('converts height and weight, and maps types, abilities and stats', () => {
    const response: PokemonDetailResponseDto = {
      id: 1,
      name: 'bulbasaur',
      height: 7,
      weight: 69,
      types: [
        { slot: 2, type: namedResource('poison') },
        { slot: 1, type: namedResource('grass') },
      ],
      abilities: [
        { slot: 2, is_hidden: true, ability: namedResource('chlorophyll') },
        { slot: 1, is_hidden: false, ability: namedResource('overgrow') },
      ],
      stats: [
        {
          base_stat: 45,
          effort: 0,
          stat: namedResource('hp'),
        },
        {
          base_stat: 49,
          effort: 0,
          stat: namedResource('attack'),
        },
      ],
    };

    const detail = mapPokemonDetailResponse(response);

    assert.equal(detail.height, 0.7);
    assert.equal(detail.weight, 6.9);
    assert.deepEqual(detail.types, ['grass', 'poison']);
    assert.deepEqual(detail.abilities, ['overgrow', 'chlorophyll']);
    assert.deepEqual(detail.stats, [
      { name: 'hp', value: 45 },
      { name: 'attack', value: 49 },
    ]);
    assert.equal(
      detail.imageUrl,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    );
    assert.equal(detail.id, 1);
    assert.equal(detail.name, 'bulbasaur');
  });

  it('prefers official artwork and falls back to the sprite when unavailable', () => {
    const base: PokemonDetailResponseDto = {
      id: 25, name: 'pikachu', height: 4, weight: 60, types: [], abilities: [], stats: [],
      sprites: { front_default: 'https://example.com/sprite.png', other: {
        'official-artwork': { front_default: 'https://example.com/artwork.png' },
      } },
    };
    assert.equal(mapPokemonDetailResponse(base).imageUrl, 'https://example.com/artwork.png');
    assert.equal(mapPokemonDetailResponse({ ...base, sprites: { front_default: 'https://example.com/sprite.png' } }).imageUrl, 'https://example.com/sprite.png');
  });
});
