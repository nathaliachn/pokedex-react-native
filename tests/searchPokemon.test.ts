import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getExactSearchIdentifier } from '../src/features/pokemonList/searchPokemon';

const loaded = [
  { id: 1, name: 'bulbasaur', imageUrl: 'one' },
  { id: 25, name: 'pikachu', imageUrl: 'twenty-five' },
];

describe('getExactSearchIdentifier', () => {
  it('returns no remote identifier for loaded or partial searches', () => {
    assert.equal(getExactSearchIdentifier('pika', loaded), null);
    assert.equal(getExactSearchIdentifier('005', loaded), 5);
    assert.equal(getExactSearchIdentifier('00', loaded), null);
    assert.equal(getExactSearchIdentifier('bulbasaur', loaded), null);
  });

  it('normalizes an unloaded numeric identifier', () => {
    assert.equal(getExactSearchIdentifier('0700', loaded), 700);
    assert.equal(getExactSearchIdentifier('700', loaded), 700);
  });

  it('returns an unloaded exact name for one direct request', () => {
    assert.equal(getExactSearchIdentifier(' sylveon ', loaded), 'sylveon');
  });
});
