import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { appendUniquePokemon } from '../src/features/pokemonList/listPagination';

describe('appendUniquePokemon', () => {
  it('appends new Pokemon while preserving the existing order', () => {
    const pokemon = appendUniquePokemon(
      [
        {
          id: 1,
          name: 'bulbasaur',
          imageUrl: 'https://example.com/1.png',
        },
      ],
      [
        {
          id: 2,
          name: 'ivysaur',
          imageUrl: 'https://example.com/2.png',
        },
      ],
    );

    assert.deepEqual(
      pokemon.map((item) => item.id),
      [1, 2],
    );
  });

  it('skips duplicate Pokemon from repeated page requests', () => {
    const pokemon = appendUniquePokemon(
      [
        {
          id: 1,
          name: 'bulbasaur',
          imageUrl: 'https://example.com/1.png',
        },
        {
          id: 2,
          name: 'ivysaur',
          imageUrl: 'https://example.com/2.png',
        },
      ],
      [
        {
          id: 2,
          name: 'ivysaur',
          imageUrl: 'https://example.com/2.png',
        },
        {
          id: 3,
          name: 'venusaur',
          imageUrl: 'https://example.com/3.png',
        },
      ],
    );

    assert.deepEqual(
      pokemon.map((item) => item.id),
      [1, 2, 3],
    );
  });
});
