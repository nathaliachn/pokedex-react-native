import { PokemonDetail } from '../models/PokemonDetail';
import { PokemonIdentifier, PokemonRepository } from '../repositories/PokemonRepository';

export class GetPokemonDetail {
  constructor(private readonly pokemonRepository: PokemonRepository) {}

  execute(identifier: PokemonIdentifier): Promise<PokemonDetail> {
    return this.pokemonRepository.getById(identifier);
  }
}
