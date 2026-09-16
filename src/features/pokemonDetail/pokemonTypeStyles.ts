export type PokemonType =
  | 'bug' | 'dark' | 'dragon' | 'electric' | 'fairy' | 'fighting' | 'fire'
  | 'flying' | 'ghost' | 'grass' | 'ground' | 'ice' | 'normal' | 'poison'
  | 'psychic' | 'rock' | 'steel' | 'water';

type TypeStyle = { backgroundColor: string; textColor: string };

const DEFAULT_TYPE_STYLE: TypeStyle = {
  backgroundColor: '#536578',
  textColor: '#ffffff',
};

export const POKEMON_TYPE_STYLES: Readonly<Record<PokemonType, TypeStyle>> = {
  bug: { backgroundColor: '#4d7c2a', textColor: '#ffffff' },
  dark: { backgroundColor: '#374151', textColor: '#ffffff' },
  dragon: { backgroundColor: '#5144a5', textColor: '#ffffff' },
  electric: { backgroundColor: '#8a6500', textColor: '#ffffff' },
  fairy: { backgroundColor: '#a43c70', textColor: '#ffffff' },
  fighting: { backgroundColor: '#9a351e', textColor: '#ffffff' },
  fire: { backgroundColor: '#b43f22', textColor: '#ffffff' },
  flying: { backgroundColor: '#426a9a', textColor: '#ffffff' },
  ghost: { backgroundColor: '#5b4b82', textColor: '#ffffff' },
  grass: { backgroundColor: '#347a46', textColor: '#ffffff' },
  ground: { backgroundColor: '#80602d', textColor: '#ffffff' },
  ice: { backgroundColor: '#26758a', textColor: '#ffffff' },
  normal: { backgroundColor: '#5b6570', textColor: '#ffffff' },
  poison: { backgroundColor: '#7a3f89', textColor: '#ffffff' },
  psychic: { backgroundColor: '#a4315b', textColor: '#ffffff' },
  rock: { backgroundColor: '#6e5b2b', textColor: '#ffffff' },
  steel: { backgroundColor: '#4f6172', textColor: '#ffffff' },
  water: { backgroundColor: '#245f9e', textColor: '#ffffff' },
};

export function getPokemonTypeStyle(type: string): TypeStyle {
  return POKEMON_TYPE_STYLES[type as PokemonType] ?? DEFAULT_TYPE_STYLE;
}
