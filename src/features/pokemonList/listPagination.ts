import { Pokemon } from '../../domain/models/Pokemon';

export const POKEMON_LIST_PAGE_SIZE = 20;

export function appendUniquePokemon(
  currentPokemon: Pokemon[],
  incomingPokemon: Pokemon[],
): Pokemon[] {
  const knownIds = new Set(currentPokemon.map((pokemon) => pokemon.id));
  const uniqueIncomingPokemon = incomingPokemon.filter((pokemon) => {
    if (knownIds.has(pokemon.id)) {
      return false;
    }

    knownIds.add(pokemon.id);
    return true;
  });

  return [...currentPokemon, ...uniqueIncomingPokemon];
}
