import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { PokeApiPokemonDataSource } from '../src/data/pokeApi/PokeApiPokemonDataSource';
import { PokemonDetailResponseDto } from '../src/data/pokeApi/pokemonDetailDto';
import { PokemonListResponseDto } from '../src/data/pokeApi/pokemonListDto';
import { NetworkRequestError } from '../src/data/pokeApi/NetworkRequestError';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe('PokeApiPokemonDataSource', () => {
  it('requests the paginated list and returns the JSON body on success', async () => {
    const payload: PokemonListResponseDto = {
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
    let requestedUrl = '';

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      requestedUrl = String(input);
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const dataSource = new PokeApiPokemonDataSource();
    const result = await dataSource.getPokemonList({ limit: 20, offset: 0 });

    assert.equal(
      requestedUrl,
      'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
    );
    assert.deepEqual(result, payload);
  });

  it('requests a Pokémon by id and returns the JSON body on success', async () => {
    const payload: PokemonDetailResponseDto = {
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      types: [],
      abilities: [],
      stats: [],
    };
    let requestedUrl = '';

    globalThis.fetch = async (input: RequestInfo | URL): Promise<Response> => {
      requestedUrl = String(input);
      return new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const dataSource = new PokeApiPokemonDataSource();
    const result = await dataSource.getPokemonById(25);

    assert.equal(requestedUrl, 'https://pokeapi.co/api/v2/pokemon/25');
    assert.deepEqual(result, payload);
  });

  it('throws when the HTTP response is not successful', async () => {
    globalThis.fetch = async (): Promise<Response> => {
      return new Response('Not Found', { status: 404 });
    };

    const dataSource = new PokeApiPokemonDataSource();

    await assert.rejects(
      () => dataSource.getPokemonById(99999),
      /PokéAPI request failed with status 404/,
    );
  });

  it('classifies network failures and retains their cause', async () => {
    const cause = new TypeError('Network request failed');
    globalThis.fetch = async (): Promise<Response> => {
      throw cause;
    };

    const dataSource = new PokeApiPokemonDataSource();

    await assert.rejects(
      () => dataSource.getPokemonList({ limit: 20, offset: 0 }),
      (error: unknown) =>
        error instanceof NetworkRequestError && error.cause === cause,
    );
  });

  it('does not classify invalid JSON as a network failure', async () => {
    globalThis.fetch = async () => new Response('invalid json');
    await assert.rejects(
      () => new PokeApiPokemonDataSource().getPokemonById(1),
      (error: unknown) => error instanceof SyntaxError,
    );
  });

  it('classifies a response body download failure as a network failure', async () => {
    globalThis.fetch = async () => {
      const response = new Response();
      response.json = async () => { throw new TypeError('Connection lost'); };
      return response;
    };
    await assert.rejects(
      () => new PokeApiPokemonDataSource().getPokemonById(1),
      (error: unknown) => error instanceof NetworkRequestError,
    );
  });
});
