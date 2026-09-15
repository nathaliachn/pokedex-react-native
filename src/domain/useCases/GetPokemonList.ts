import {
  PokemonListPage,
  PokemonListParams,
  PokemonRepository,
} from '../repositories/PokemonRepository';

export class GetPokemonList {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  execute(
    params: PokemonListParams = { limit: 20, offset: 0 },
  ): Promise<PokemonListPage> {
    return this.pokemonRepository.getList(params);
  }
}
