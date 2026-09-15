export type PokemonNamedResourceDto = {
  name: string;
  url: string;
};

export type PokemonTypeSlotDto = {
  slot: number;
  type: PokemonNamedResourceDto;
};

export type PokemonAbilitySlotDto = {
  ability: PokemonNamedResourceDto;
  is_hidden: boolean;
  slot: number;
};

export type PokemonStatDto = {
  base_stat: number;
  effort: number;
  stat: PokemonNamedResourceDto;
};

export type PokemonDetailResponseDto = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeSlotDto[];
  abilities: PokemonAbilitySlotDto[];
  stats: PokemonStatDto[];
};
