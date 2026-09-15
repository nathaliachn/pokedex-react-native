export type PokemonStat = {
  name: string;
  value: number;
};

export type PokemonDetail = {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  abilities: string[];
  stats: PokemonStat[];
  height: number;
  weight: number;
};
