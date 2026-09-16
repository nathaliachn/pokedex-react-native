import { ReactElement, useCallback, useEffect, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { getPokemonDetail, getPokemonList } from '../composition';
import { PokemonDetailScreen } from '../features/pokemonDetail/PokemonDetailScreen';
import { PokemonListScreen } from '../features/pokemonList/PokemonListScreen';
import { AppRoute } from './AppRoute';

export function AppNavigator(): ReactElement {
  const [route, setRoute] = useState<AppRoute>({ name: 'list' });
  const isListVisible = route.name === 'list';
  const selectPokemon = useCallback((pokemonId: number) => {
    setRoute({ name: 'detail', pokemonId });
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name !== 'detail') {
        return false;
      }

      setRoute({ name: 'list' });
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [route.name]);

  return (
    <View style={styles.root}>
      <View
        style={styles.listLayer}
        collapsable={false}
        pointerEvents={isListVisible ? 'auto' : 'none'}
        accessibilityElementsHidden={!isListVisible}
        importantForAccessibility={isListVisible ? 'auto' : 'no-hide-descendants'}
      >
        <PokemonListScreen
          getPokemonList={getPokemonList}
          getPokemonDetail={getPokemonDetail}
          onSelectPokemon={selectPokemon}
        />
      </View>
      {route.name === 'detail' ? (
        <View style={styles.detailLayer} accessibilityViewIsModal>
          <PokemonDetailScreen
            key={route.pokemonId}
            pokemonId={route.pokemonId}
            getPokemonDetail={getPokemonDetail}
            onBack={() => {
              setRoute({ name: 'list' });
            }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  listLayer: {
    flex: 1,
  },
  detailLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#f4f6f8',
  },
});
