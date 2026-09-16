import { memo, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Pokemon } from '../../domain/models/Pokemon';
import { PokemonArtwork, officialArtworkUri } from '../../shared/ui/PokemonArtwork';

type PokemonListItemProps = {
  pokemon: Pokemon;
  onPress: (pokemonId: number) => void;
};

export const PokemonListItem = memo(function PokemonListItem({ pokemon, onPress }: PokemonListItemProps) {
  const displayName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const scale = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  const animateTo = (value: number) => {
    if (reduceMotion) {
      scale.setValue(value);
      return;
    }
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 30, bounciness: 0 }).start();
  };

  return (
    <Pressable
      onPress={() => onPress(pokemon.id)}
      onPressIn={() => animateTo(0.98)}
      onPressOut={() => animateTo(1)}
      android_ripple={{ color: '#195e961a' }}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, Pokémon number ${pokemon.id}`}
      accessibilityHint="Shows this Pokémon’s details"
    >
      <Animated.View style={[styles.row, { transform: [{ scale }] }]}>
      <PokemonArtwork primaryUri={officialArtworkUri(pokemon.id)} fallbackUri={pokemon.imageUrl} style={styles.image} resizeMode="contain"
        accessibilityIgnoresInvertColors accessible={false} importantForAccessibility="no" />
      <View style={styles.copy}>
        <Text style={styles.number}>#{String(pokemon.id).padStart(3, '0')}</Text>
        <Text style={styles.name}>{displayName}</Text>
      </View>
      <Text style={styles.chevron} accessible={false} importantForAccessibility="no">›</Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12, minHeight: 92,
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#dce3eb',
  },
  image: { width: 76, height: 76, backgroundColor: '#eef3f8', borderRadius: 14 },
  copy: { flex: 1, gap: 2 },
  number: { fontSize: 13, fontWeight: '600', color: '#536578', fontVariant: ['tabular-nums'] },
  name: { fontSize: 20, fontWeight: '700', color: '#172b42' },
  chevron: { fontSize: 28, color: '#195e96' },
});
