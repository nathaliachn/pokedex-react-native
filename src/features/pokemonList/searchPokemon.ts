import { Pokemon } from '../../domain/models/Pokemon';
import { filterPokemon } from './filterPokemon';

export function getExactSearchIdentifier(
  query: string,
  loadedPokemon: Pokemon[],
): number | string | null {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length === 0) return null;
  if (filterPokemon(loadedPokemon, normalizedQuery).length > 0) return null;
  if (/^\d+$/.test(normalizedQuery)) {
    if (/^0+$/.test(normalizedQuery)) return null;
    const id = Number(normalizedQuery);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }
  return /^[a-z-]+$/.test(normalizedQuery) ? normalizedQuery : null;
}
