import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterPokemon } from '../src/features/pokemonList/filterPokemon';

const pokemon = [
  { id: 1, name: 'bulbasaur', imageUrl: 'one' },
  { id: 25, name: 'pikachu', imageUrl: 'twenty-five' },
  { id: 150, name: 'mewtwo', imageUrl: 'one-fifty' },
];

describe('filterPokemon', () => {
  it('filters loaded Pokémon by name or number without changing order', () => {
    assert.deepEqual(filterPokemon(pokemon, 'PIKA').map((item) => item.id), [25]);
    assert.deepEqual(filterPokemon(pokemon, '005').map((item) => item.id), []);
    assert.deepEqual(filterPokemon([{ id: 5, name: 'charmeleon', imageUrl: 'five' }, ...pokemon], '005').map((item) => item.id), [5]);
    assert.deepEqual(filterPokemon([{ id: 5, name: 'charmeleon', imageUrl: 'five' }, ...pokemon], '05').map((item) => item.id), [5]);
    assert.deepEqual(filterPokemon([{ id: 5, name: 'charmeleon', imageUrl: 'five' }, ...pokemon], '5').map((item) => item.id), [5]);
    assert.deepEqual(filterPokemon([{ id: 1, name: 'bulbasaur', imageUrl: 'one' }, { id: 100, name: 'voltorb', imageUrl: 'one-hundred' }], '00').map((item) => item.id), [1]);
    assert.deepEqual(filterPokemon(pokemon, '150').map((item) => item.id), [150]);
  });

  it('returns all loaded Pokémon for an empty or whitespace query', () => {
    assert.deepEqual(filterPokemon(pokemon, '  '), pokemon);
  });

  it('returns an empty result when no loaded Pokémon match', () => {
    assert.deepEqual(filterPokemon(pokemon, 'charizard'), []);
  });
});
