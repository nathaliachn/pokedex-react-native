import { Image, StyleSheet, Text, View } from 'react-native';
import { Pokemon } from '../../domain/models/Pokemon';

type PokemonListItemProps = {
  pokemon: Pokemon;
};

export function PokemonListItem({ pokemon }: PokemonListItemProps) {
  const displayName = formatPokemonName(pokemon.name);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${displayName}, Pokémon number ${pokemon.id}`}
    >
      <Image
        source={{ uri: pokemon.imageUrl }}
        style={styles.image}
        accessibilityIgnoresInvertColors
        accessible={false}
      />
      <Text style={styles.name}>{displayName}</Text>
    </View>
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
  },
  image: {
    width: 72,
    height: 72,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});
