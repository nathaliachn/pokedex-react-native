import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pokemon } from '../../domain/models/Pokemon';
import { GetPokemonList } from '../../domain/useCases/GetPokemonList';
import { PokemonListItem } from './PokemonListItem';
import { usePokemonList } from './usePokemonList';

type PokemonListScreenProps = {
  getPokemonList: GetPokemonList;
  onSelectPokemon: (pokemonId: number) => void;
};

export function PokemonListScreen({
  getPokemonList,
  onSelectPokemon,
}: PokemonListScreenProps) {
  const { pokemon, isLoading, errorMessage, retry } =
    usePokemonList(getPokemonList);

  const renderItem: ListRenderItem<Pokemon> = ({ item }) => (
    <PokemonListItem pokemon={item} onPress={onSelectPokemon} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          Pokédex
        </Text>
        {renderContent(pokemon, isLoading, errorMessage, retry, renderItem)}
      </View>
    </SafeAreaView>
  );
}

function renderContent(
  pokemon: Pokemon[],
  isLoading: boolean,
  errorMessage: string | null,
  retry: () => void,
  renderItem: ListRenderItem<Pokemon>,
) {
  if (isLoading) {
    return (
      <View style={styles.centered} accessibilityLabel="Loading Pokémon">
        <ActivityIndicator
          size="large"
          color="#2a75bb"
          accessibilityLabel="Loading Pokémon"
        />
        <Text style={styles.statusText}>Loading Pokémon…</Text>
      </View>
    );
  }

  if (errorMessage !== null) {
    return (
      <View style={styles.centered} accessibilityLabel={errorMessage}>
        <Text style={styles.statusText}>{errorMessage}</Text>
        <Pressable
          onPress={retry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.24)' }}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityHint="Loads the Pokémon list again"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      data={pokemon}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={
        pokemon.length === 0 ? styles.emptyListContent : styles.listContent
      }
      accessibilityLabel="Pokémon list"
    />
  );
}

function keyExtractor(item: Pokemon): string {
  return String(item.id);
}

function ItemSeparator() {
  return <View style={styles.separator} />;
}

function EmptyState() {
  return (
    <View style={styles.centered} accessibilityLabel="No Pokémon to display">
      <Text style={styles.statusText}>No Pokémon to display yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexShrink: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#d5dbe3',
    marginLeft: 104,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    color: '#4a5560',
    textAlign: 'center',
    flexShrink: 1,
  },
  retryButton: {
    backgroundColor: '#2a75bb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonPressed: {
    opacity: 0.72,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
