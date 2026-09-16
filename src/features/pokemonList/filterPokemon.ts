import { Pokemon } from '../../domain/models/Pokemon';

export function filterPokemon(pokemon: Pokemon[], query: string): Pokemon[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return pokemon;

  if (/^\d+$/.test(normalizedQuery)) {
    // Match the same three-digit representation rendered by each card.
    if (/^0+$/.test(normalizedQuery)) {
      return pokemon.filter((item) => formatPokemonId(item.id).startsWith(normalizedQuery));
    }

    const numericId = Number(normalizedQuery);
    return Number.isSafeInteger(numericId) ? pokemon.filter((item) => item.id === numericId) : [];
  }

  return pokemon.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedQuery) ||
      String(item.id).includes(normalizedQuery),
  );
}

function formatPokemonId(id: number): string {
  return String(id).padStart(3, '0');
}
