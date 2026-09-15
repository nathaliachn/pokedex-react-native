import {
  PokemonListPage,
  PokemonListParams,
  PokemonRepository,
} from '../../domain/repositories/PokemonRepository';
import { mapPokemonListResponse } from '../pokeApi/mapPokemonListResponse';
import { PokeApiPokemonDataSource } from '../pokeApi/PokeApiPokemonDataSource';

export class PokeApiPokemonRepository implements PokemonRepository {
  constructor(private readonly dataSource: PokeApiPokemonDataSource) {}

  async getList(params: PokemonListParams): Promise<PokemonListPage> {
    const response = await this.dataSource.getPokemonList(params);
    return mapPokemonListResponse(response, params.offset);
  }
}
