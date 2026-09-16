import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapPokemonListResponse } from '../src/data/pokeApi/mapPokemonListResponse';
import { PokemonListResponseDto } from '../src/data/pokeApi/pokemonListDto';

const SPRITE_BASE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

describe('mapPokemonListResponse', () => {
  it('extracts IDs from the PokéAPI url and builds sprite image URLs', () => {
    const response: PokemonListResponseDto = {
      count: 2,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
      previous: null,
      results: [
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon/1/',
        },
        {
          name: 'ivysaur',
          url: 'https://pokeapi.co/api/v2/pokemon/2/',
        },
      ],
    };

    const page = mapPokemonListResponse(response, 0);

    assert.deepEqual(page.items, [
      {
        id: 1,
        name: 'bulbasaur',
        imageUrl: `${SPRITE_BASE_URL}/1.png`,
      },
      {
        id: 2,
        name: 'ivysaur',
        imageUrl: `${SPRITE_BASE_URL}/2.png`,
      },
    ]);
    assert.equal(page.totalCount, 2);
  });

  it('computes nextOffset from the request offset when another page exists', () => {
    const response: PokemonListResponseDto = {
      count: 40,
      next: 'https://pokeapi.co/api/v2/pokemon?offset=40&limit=20',
      previous: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=20',
      results: [
        {
          name: 'spearow',
          url: 'https://pokeapi.co/api/v2/pokemon/21/',
        },
        {
          name: 'fearow',
          url: 'https://pokeapi.co/api/v2/pokemon/22/',
        },
      ],
    };

    const page = mapPokemonListResponse(response, 20);

    assert.equal(page.nextOffset, 22);
  });

  it('sets nextOffset to null when PokéAPI reports no following page', () => {
    const response: PokemonListResponseDto = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          name: 'bulbasaur',
          url: 'https://pokeapi.co/api/v2/pokemon/1/',
        },
      ],
    };

    const page = mapPokemonListResponse(response, 0);

    assert.equal(page.nextOffset, null);
  });

  it('maps an empty result list without a next page', () => {
    const response: PokemonListResponseDto = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };

    const page = mapPokemonListResponse(response, 0);

    assert.deepEqual(page, {
      items: [],
      totalCount: 0,
      nextOffset: null,
    });
  });
});
