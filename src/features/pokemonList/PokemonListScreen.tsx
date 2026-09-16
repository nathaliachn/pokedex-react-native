import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pokemon } from '../../domain/models/Pokemon';
import { PokemonDetail } from '../../domain/models/PokemonDetail';
import { GetPokemonList } from '../../domain/useCases/GetPokemonList';
import { GetPokemonDetail } from '../../domain/useCases/GetPokemonDetail';
import { APP_ERROR_MESSAGES } from '../../shared/appErrors';
import { Feedback } from '../../shared/ui/Feedback';
import { ScreenFrame } from '../../shared/ui/ScreenFrame';
import { PokemonListItem } from './PokemonListItem';
import { usePokemonList } from './usePokemonList';
import { filterPokemon } from './filterPokemon';
import { getExactSearchIdentifier } from './searchPokemon';

type PokemonListScreenProps = {
  getPokemonList: GetPokemonList;
  getPokemonDetail: GetPokemonDetail;
  onSelectPokemon: (pokemonId: number) => void;
};

export function PokemonListScreen({
  getPokemonList,
  getPokemonDetail,
  onSelectPokemon,
}: PokemonListScreenProps) {
  const {
    pokemon,
    totalCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    errorMessage,
    paginationErrorMessage,
    canLoadMore,
    retry,
    refresh,
    loadMore,
  } = usePokemonList(getPokemonList);
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<Pokemon | null>(null);
  const [searchState, setSearchState] = useState<'idle' | 'searching' | 'notFound' | 'error'>(
    'idle',
  );
  const searchRequestActive = useRef(false);
  const insets = useSafeAreaInsets();
  const filteredPokemon = useMemo(() => filterPokemon(pokemon, query), [pokemon, query]);
  const displayedPokemon = searchResult ? [searchResult] : filteredPokemon;

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setSearchResult(null);
    setSearchState('idle');
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const identifier = getExactSearchIdentifier(query, pokemon);
    if (identifier === null || searchRequestActive.current) return;
    searchRequestActive.current = true;
    setSearchState('searching');
    void getPokemonDetail
      .execute(identifier)
      .then((detail) => {
        const result = detailToPokemon(detail);
        setSearchResult(result);
        setSearchState('idle');
      })
      .catch((error: unknown) => {
        setSearchState(
          error instanceof Error && error.message.includes('404') ? 'notFound' : 'error',
        );
      })
      .finally(() => {
        searchRequestActive.current = false;
      });
  }, [getPokemonDetail, pokemon, query]);

  const renderItem: ListRenderItem<Pokemon> = useCallback(
    ({ item }) => <PokemonListItem pokemon={item} onPress={onSelectPokemon} />,
    [onSelectPokemon],
  );

  // Once a page fails, keep the error and Retry control stable while scrolling.
  const handleEndReached = useCallback(() => {
    if (paginationErrorMessage === null) loadMore();
  }, [loadMore, paginationErrorMessage]);

  return (
    <ScreenFrame>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Pokédex
        </Text>
        {totalCount !== null ? <Text style={styles.total}>{formatTotal(totalCount)}</Text> : null}
      </View>
      <TextInput
        value={query}
        onChangeText={handleQueryChange}
        onSubmitEditing={handleSearchSubmit}
        placeholder="Buscar por nombre o número"
        placeholderTextColor="#6b7c8f"
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel="Buscar Pokémon por nombre o número"
        style={styles.search}
      />
      {isLoading || errorMessage !== null ? (
        <ScrollView contentContainerStyle={[styles.stateContent, { paddingBottom: insets.bottom }]}>
          <Feedback
            loading={isLoading}
            message={
              isLoading ? 'Cargando Pokémon…' : (errorMessage ?? APP_ERROR_MESSAGES.pokemonList)
            }
            onRetry={isLoading ? undefined : retry}
            retryLabel="Reintentar cargar la lista de Pokémon"
          />
        </ScrollView>
      ) : searchState === 'searching' ? (
        <ScrollView contentContainerStyle={[styles.stateContent, { paddingBottom: insets.bottom }]}>
          <Feedback loading message="Buscando Pokémon…" />
        </ScrollView>
      ) : (
        <FlatList
          data={displayedPokemon}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          ListEmptyComponent={
            displayedPokemon.length === 0 && query.trim().length > 0
              ? () => <SearchEmptyState state={searchState} onRetry={handleSearchSubmit} />
              : EmptyState
          }
          ListFooterComponent={
            displayedPokemon.length > 0 && query.trim().length === 0 ? (
              <View style={styles.footer}>
                {isLoadingMore ? (
                  <Feedback loading message="Cargando más Pokémon…" />
                ) : paginationErrorMessage !== null ? (
                  <Feedback
                    message={paginationErrorMessage}
                    onRetry={loadMore}
                    retryLabel="Reintentar cargar más Pokémon"
                  />
                ) : !canLoadMore ? (
                  <Feedback message="Has llegado al final de la Pokédex." />
                ) : null}
              </View>
            ) : null
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom },
            displayedPokemon.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={refresh}
              tintColor="#195e96"
              colors={['#195e96']}
              accessibilityLabel="Actualizar lista de Pokémon"
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          accessibilityLabel="Lista de Pokémon"
        />
      )}
    </ScreenFrame>
  );
}

function keyExtractor(item: Pokemon): string {
  return String(item.id);
}
function ItemSeparator() {
  return <View style={styles.separator} />;
}
function EmptyState() {
  return <Feedback message="Todavía no hay Pokémon para mostrar." />;
}
function SearchEmptyState({
  state,
  onRetry,
}: {
  state: 'idle' | 'notFound' | 'error';
  onRetry: () => void;
}) {
  if (state === 'notFound')
    return (
      <Feedback
        message="No se encontró ese Pokémon."
        onRetry={onRetry}
        retryLabel="Reintentar búsqueda"
      />
    );
  if (state === 'error')
    return (
      <Feedback
        message={APP_ERROR_MESSAGES.pokemonSearch}
        onRetry={onRetry}
        retryLabel="Reintentar búsqueda"
      />
    );
  return (
    <Feedback message="Ningún Pokémon cargado coincide. Pulsa buscar para consultar la Pokédex." />
  );
}
function detailToPokemon(detail: PokemonDetail): Pokemon {
  return { id: detail.id, name: detail.name, imageUrl: detail.imageUrl };
}
function formatTotal(total: number): string {
  return `${String(total).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} Pokémones`;
}

const styles = StyleSheet.create({
  header: { flexShrink: 0, overflow: 'visible', paddingTop: 20 },
  title: {
    fontSize: 32,
    lineHeight: 44,
    includeFontPadding: true,
    fontWeight: '800',
    color: '#172b42',
    paddingHorizontal: 20,
  },
  total: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: '#536578',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 18,
  },
  search: {
    marginHorizontal: 16,
    marginBottom: 16,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c9d5e1',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#172b42',
  },
  listContent: { paddingHorizontal: 16 },
  emptyContent: { flexGrow: 1, justifyContent: 'center' },
  stateContent: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: 12 },
  footer: { paddingTop: 12 },
});
