import { PokeApiPokemonDataSource } from '../../data/pokeApi/PokeApiPokemonDataSource';
import { PokeApiPokemonRepository } from '../../data/repositories/PokeApiPokemonRepository';
import { GetPokemonList } from '../../domain/useCases/GetPokemonList';

export function createGetPokemonList(): GetPokemonList {
  const dataSource = new PokeApiPokemonDataSource();
  const repository = new PokeApiPokemonRepository(dataSource);
  return new GetPokemonList(repository);
}

export const getPokemonList: GetPokemonList = createGetPokemonList();
