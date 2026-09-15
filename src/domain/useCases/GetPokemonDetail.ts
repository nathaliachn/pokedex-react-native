import { PokemonDetail } from '../models/PokemonDetail';
import { PokemonRepository } from '../repositories/PokemonRepository';

export class GetPokemonDetail {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  execute(id: number): Promise<PokemonDetail> {
    return this.pokemonRepository.getById(id);
  }
}
