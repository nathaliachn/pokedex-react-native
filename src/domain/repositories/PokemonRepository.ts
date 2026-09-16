import { Pokemon } from '../models/Pokemon';
import { PokemonDetail } from '../models/PokemonDetail';

export type PokemonListParams = {
  limit: number;
  offset: number;
};

export type PokemonListPage = {
  items: Pokemon[];
  totalCount: number;
  nextOffset: number | null;
};

export interface PokemonRepository {
  getList(params: PokemonListParams): Promise<PokemonListPage>;
  getById(id: number): Promise<PokemonDetail>;
}
