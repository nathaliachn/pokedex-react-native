import { Image, Pressable, StyleSheet, Text } from 'react-native';
import { Pokemon } from '../../domain/models/Pokemon';

type PokemonListItemProps = {
  pokemon: Pokemon;
  onPress: (pokemonId: number) => void;
};

export function PokemonListItem({ pokemon, onPress }: PokemonListItemProps) {
  const displayName = formatPokemonName(pokemon.name);

  return (
    <Pressable
      onPress={() => {
        onPress(pokemon.id);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.12)' }}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, Pokémon number ${pokemon.id}`}
      accessibilityHint="Shows this Pokémon’s details"
    >
      <Image
        source={{ uri: pokemon.imageUrl }}
        style={styles.image}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <Text style={styles.name}>{displayName}</Text>
    </Pressable>
  );
}

function formatPokemonName(name: string): string {
  if (name.length === 0) {
    return name;
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    minHeight: 48,
  },
  pressed: {
    backgroundColor: 'rgba(42, 117, 187, 0.12)',
  },
  image: {
    width: 72,
    height: 72,
  },
  name: {
    flex: 1,
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
