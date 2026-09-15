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
  const {
    pokemon,
    isLoading,
    isLoadingMore,
    errorMessage,
    paginationErrorMessage,
    canLoadMore,
    retry,
    loadMore,
  } = usePokemonList(getPokemonList);

  const renderItem: ListRenderItem<Pokemon> = ({ item }) => (
    <PokemonListItem pokemon={item} onPress={onSelectPokemon} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title} accessibilityRole="header">
          Pokédex
        </Text>
        {renderContent({
          pokemon,
          isLoading,
          isLoadingMore,
          errorMessage,
          paginationErrorMessage,
          canLoadMore,
          retry,
          loadMore,
          renderItem,
        })}
      </View>
    </SafeAreaView>
  );
}

type RenderContentParams = {
  pokemon: Pokemon[];
  isLoading: boolean;
  isLoadingMore: boolean;
  errorMessage: string | null;
  paginationErrorMessage: string | null;
  canLoadMore: boolean;
  retry: () => void;
  loadMore: () => void;
  renderItem: ListRenderItem<Pokemon>;
};

function renderContent({
  pokemon,
  isLoading,
  isLoadingMore,
  errorMessage,
  paginationErrorMessage,
  canLoadMore,
  retry,
  loadMore,
  renderItem,
}: RenderContentParams) {
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
      ListFooterComponent={
        <ListFooter
          hasItems={pokemon.length > 0}
          isLoadingMore={isLoadingMore}
          paginationErrorMessage={paginationErrorMessage}
          canLoadMore={canLoadMore}
          onRetry={loadMore}
        />
      }
      contentContainerStyle={
        pokemon.length === 0 ? styles.emptyListContent : styles.listContent
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.6}
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

type ListFooterProps = {
  hasItems: boolean;
  isLoadingMore: boolean;
  paginationErrorMessage: string | null;
  canLoadMore: boolean;
  onRetry: () => void;
};

function ListFooter({
  hasItems,
  isLoadingMore,
  paginationErrorMessage,
  canLoadMore,
  onRetry,
}: ListFooterProps) {
  if (!hasItems) {
    return null;
  }

  if (isLoadingMore) {
    return (
      <View
        style={styles.footer}
        accessibilityRole="progressbar"
        accessibilityLabel="Loading more Pokemon"
      >
        <ActivityIndicator color="#2a75bb" accessibilityLabel="Loading more Pokemon" />
        <Text style={styles.footerText}>Loading more Pokemon...</Text>
      </View>
    );
  }

  if (paginationErrorMessage !== null) {
    return (
      <View style={styles.footer} accessibilityLabel={paginationErrorMessage}>
        <Text style={styles.footerText}>{paginationErrorMessage}</Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.24)' }}
          accessibilityRole="button"
          accessibilityLabel="Retry loading more Pokemon"
          accessibilityHint="Loads the next Pokemon page again"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!canLoadMore) {
    return (
      <View style={styles.footer} accessibilityLabel="All Pokemon loaded">
        <Text style={styles.footerText}>All Pokemon loaded.</Text>
      </View>
    );
  }

  return null;
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
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 72,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#4a5560',
    textAlign: 'center',
    flexShrink: 1,
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
