import { PokeApiPokemonDataSource } from './data/pokeApi/PokeApiPokemonDataSource';
import { PokeApiPokemonRepository } from './data/repositories/PokeApiPokemonRepository';
import { GetPokemonDetail } from './domain/useCases/GetPokemonDetail';
import { GetPokemonList } from './domain/useCases/GetPokemonList';

export function createPokemonUseCases(): {
  getPokemonList: GetPokemonList;
  getPokemonDetail: GetPokemonDetail;
} {
  const dataSource = new PokeApiPokemonDataSource();
  const repository = new PokeApiPokemonRepository(dataSource);

  return {
    getPokemonList: new GetPokemonList(repository),
    getPokemonDetail: new GetPokemonDetail(repository),
  };
}

const pokemonUseCases = createPokemonUseCases();

export const getPokemonList: GetPokemonList = pokemonUseCases.getPokemonList;
export const getPokemonDetail: GetPokemonDetail =
  pokemonUseCases.getPokemonDetail;
