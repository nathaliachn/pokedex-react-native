import { Pokemon } from '../models/Pokemon';

export type PokemonListParams = {
  limit: number;
  offset: number;
};

export type PokemonListPage = {
  items: Pokemon[];
  nextOffset: number | null;
};

export interface PokemonRepository {
  getList(params: PokemonListParams): Promise<PokemonListPage>;
}
