export const POKEMON_STAT_LABELS: Readonly<Record<string, string>> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'Ataque especial',
  'special-defense': 'Defensa especial',
  speed: 'Velocidad',
};

export function getPokemonStatLabel(stat: string): string {
  return POKEMON_STAT_LABELS[stat] ?? stat;
}
