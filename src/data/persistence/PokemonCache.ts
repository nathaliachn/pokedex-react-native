import { Pokemon } from '../../domain/models/Pokemon';
import { PokemonDetail } from '../../domain/models/PokemonDetail';
import { PokemonListPage, PokemonListParams } from '../../domain/repositories/PokemonRepository';
import { TextStorage } from './TextStorage';

export class PokemonCache {
  constructor(private readonly storage: TextStorage) {}

  readList(params: PokemonListParams): Promise<PokemonListPage | null> {
    return this.read(this.listKey(params), (value): value is PokemonListPage =>
      isRecord(value) && Array.isArray(value.items) && value.items.every(isPokemon) &&
      (value.nextOffset === null ||
        (isInteger(value.nextOffset) && value.nextOffset > params.offset)),
    );
  }

  writeList(params: PokemonListParams, page: PokemonListPage): Promise<void> {
    return this.storage.write(this.listKey(params), JSON.stringify(page));
  }

  readDetail(id: number): Promise<PokemonDetail | null> {
    return this.read(`detail-${id}`, (value): value is PokemonDetail =>
      isDetail(value) && value.id === id,
    );
  }

  writeDetail(id: number, detail: PokemonDetail): Promise<void> {
    return this.storage.write(`detail-${id}`, JSON.stringify(detail));
  }

  private listKey({ limit, offset }: PokemonListParams): string {
    return `list-${limit}-${offset}`;
  }

  private async read<T>(key: string, valid: (value: unknown) => value is T): Promise<T | null> {
    const text = await this.storage.read(key);
    if (text === null) return null;
    const value: unknown = JSON.parse(text);
    return valid(value) ? value : null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function isPokemon(value: unknown): value is Pokemon & Record<string, unknown> {
  return isRecord(value) && isInteger(value.id) && value.id > 0 &&
    typeof value.name === 'string' && typeof value.imageUrl === 'string';
}

function isStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');
}

function isDetail(value: unknown): value is PokemonDetail {
  return isRecord(value) && isPokemon(value) &&
    isStrings(value.types) && isStrings(value.abilities) &&
    typeof value.height === 'number' && Number.isFinite(value.height) &&
    typeof value.weight === 'number' && Number.isFinite(value.weight) &&
    Array.isArray(value.stats) && value.stats.every((stat: unknown) =>
      isRecord(stat) && typeof stat.name === 'string' &&
      typeof stat.value === 'number' && Number.isFinite(stat.value),
    );
}
