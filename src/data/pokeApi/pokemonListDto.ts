export type PokemonListItemDto = {
  name: string;
  url: string;
};

export type PokemonListResponseDto = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItemDto[];
};
