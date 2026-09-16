import { PokemonDetail } from '../../domain/models/PokemonDetail';
import {
  PokemonListPage,
  PokemonListParams,
  PokemonIdentifier,
  PokemonRepository,
} from '../../domain/repositories/PokemonRepository';
import { mapPokemonDetailResponse } from '../pokeApi/mapPokemonDetailResponse';
import { mapPokemonListResponse } from '../pokeApi/mapPokemonListResponse';
import { PokeApiPokemonDataSource } from '../pokeApi/PokeApiPokemonDataSource';

export class PokeApiPokemonRepository implements PokemonRepository {
  constructor(private readonly dataSource: PokeApiPokemonDataSource) {}

  async getList(params: PokemonListParams): Promise<PokemonListPage> {
    const response = await this.dataSource.getPokemonList(params);
    return mapPokemonListResponse(response, params.offset);
  }

  async getById(identifier: PokemonIdentifier): Promise<PokemonDetail> {
    const response = await this.dataSource.getPokemonById(identifier);
    return mapPokemonDetailResponse(response);
  }
}
