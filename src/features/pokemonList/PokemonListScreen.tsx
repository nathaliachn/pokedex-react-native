import { useCallback, useMemo, useState } from 'react';
import { FlatList, ListRenderItem, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pokemon } from '../../domain/models/Pokemon';
import { GetPokemonList } from '../../domain/useCases/GetPokemonList';
import { APP_ERROR_MESSAGES } from '../../shared/appErrors';
import { Feedback } from '../../shared/ui/Feedback';
import { ScreenFrame } from '../../shared/ui/ScreenFrame';
import { PokemonListItem } from './PokemonListItem';
import { usePokemonList } from './usePokemonList';
import { filterPokemon } from './filterPokemon';

type PokemonListScreenProps = {
  getPokemonList: GetPokemonList;
  onSelectPokemon: (pokemonId: number) => void;
};

export function PokemonListScreen({ getPokemonList, onSelectPokemon }: PokemonListScreenProps) {
  const {
    pokemon, totalCount, isLoading, isRefreshing, isLoadingMore, errorMessage, paginationErrorMessage,
    canLoadMore, retry, refresh, loadMore,
  } = usePokemonList(getPokemonList);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();
  const filteredPokemon = useMemo(() => filterPokemon(pokemon, query), [pokemon, query]);

  const renderItem: ListRenderItem<Pokemon> = useCallback(({ item }) => (
    <PokemonListItem pokemon={item} onPress={onSelectPokemon} />
  ), [onSelectPokemon]);

  // Once a page fails, keep the error and Retry control stable while scrolling.
  const handleEndReached = useCallback(() => {
    if (paginationErrorMessage === null) loadMore();
  }, [loadMore, paginationErrorMessage]);

  return (
    <ScreenFrame>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">Pokédex</Text>
        {totalCount !== null ? <Text style={styles.total}>{formatTotal(totalCount)}</Text> : null}
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search by name or number"
        placeholderTextColor="#6b7c8f"
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Search loaded Pokémon"
        style={styles.search}
      />
      {isLoading || errorMessage !== null ? (
        <ScrollView contentContainerStyle={[styles.stateContent, { paddingBottom: insets.bottom }]}>
          <Feedback
            loading={isLoading}
            message={isLoading ? 'Loading Pokémon…' : errorMessage ?? APP_ERROR_MESSAGES.pokemonList}
            onRetry={isLoading ? undefined : retry}
            retryLabel="Retry loading Pokémon list"
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredPokemon}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={filteredPokemon.length === 0 && query.trim().length > 0 ? NoResults : EmptyState}
          ListFooterComponent={filteredPokemon.length > 0 && query.trim().length === 0 ? (
            <View style={styles.footer}>
              {isLoadingMore ? <Feedback loading message="Loading more Pokémon…" /> :
                paginationErrorMessage !== null ? (
                  <Feedback message={paginationErrorMessage} onRetry={loadMore}
                    retryLabel="Retry loading more Pokémon" />
                ) : !canLoadMore ? <Feedback message="You’ve reached the end of the Pokédex." /> : null}
            </View>
          ) : null}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom }, filteredPokemon.length === 0 && styles.emptyContent]}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor="#195e96" colors={["#195e96"]} accessibilityLabel="Refresh Pokémon list" />}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          accessibilityLabel="Pokémon list"
        />
      )}
    </ScreenFrame>
  );
}

function keyExtractor(item: Pokemon): string { return String(item.id); }
function ItemSeparator() { return <View style={styles.separator} />; }
function EmptyState() { return <Feedback message="No Pokémon to display yet." />; }
function NoResults() { return <Feedback message="No loaded Pokémon match your search." />; }
function formatTotal(total: number): string {
  return `${String(total).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Pokémones`;
}

const styles = StyleSheet.create({
  header: { flexShrink: 0, overflow: 'visible', paddingTop: 20 },
  title: { fontSize: 32, lineHeight: 44, includeFontPadding: true, fontWeight: '800', color: '#172b42', paddingHorizontal: 20 },
  total: { fontSize: 17, fontWeight: '600', lineHeight: 24, color: '#536578', paddingHorizontal: 20, marginTop: 14, marginBottom: 18 },
  search: { marginHorizontal: 16, marginBottom: 16, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: '#c9d5e1', backgroundColor: '#fff', paddingHorizontal: 16, fontSize: 17, color: '#172b42' },
  listContent: { paddingHorizontal: 16 },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
  stateContent: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: 12 },
  footer: { paddingTop: 12 },
});
