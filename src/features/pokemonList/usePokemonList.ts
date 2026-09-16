import { useCallback, useEffect, useRef, useState } from 'react';
import { Pokemon } from '../../domain/models/Pokemon';
import { GetPokemonList } from '../../domain/useCases/GetPokemonList';
import { APP_ERROR_MESSAGES } from '../../shared/appErrors';
import { appendUniquePokemon, POKEMON_LIST_PAGE_SIZE } from './listPagination';

export type PokemonListViewState = {
  pokemon: Pokemon[];
  totalCount: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  errorMessage: string | null;
  paginationErrorMessage: string | null;
  canLoadMore: boolean;
  retry: () => void;
  refresh: () => void;
  loadMore: () => void;
};

export function usePokemonList(getPokemonList: GetPokemonList): PokemonListViewState {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paginationErrorMessage, setPaginationErrorMessage] = useState<string | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);
  const [refreshToken, setRefreshToken] = useState<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  const retry = useCallback(() => {
    setReloadToken((currentToken) => currentToken + 1);
  }, []);

  const refresh = useCallback(() => {
    setRefreshToken((currentToken) => currentToken + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMoreRef.current || errorMessage !== null || nextOffset === null) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setPaginationErrorMessage(null);

    const loadNextPage = async (): Promise<void> => {
      try {
        const page = await getPokemonList.execute({
          limit: POKEMON_LIST_PAGE_SIZE,
          offset: nextOffset,
        });

        if (!isMountedRef.current) {
          return;
        }

        setPokemon((currentPokemon) => appendUniquePokemon(currentPokemon, page.items));
        setNextOffset(page.nextOffset);
      } catch {
        if (isMountedRef.current) {
          setPaginationErrorMessage(APP_ERROR_MESSAGES.pokemonList);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoadingMore(false);
        }

        isLoadingMoreRef.current = false;
      }
    };

    void loadNextPage();
  }, [errorMessage, getPokemonList, isLoading, nextOffset]);

  useEffect(() => {
    isMountedRef.current = true;

    const loadPokemon = async (): Promise<void> => {
      const refreshing = refreshToken > 0;
      setIsLoading(!refreshing);
      setIsRefreshing(refreshing);
      setErrorMessage(null);
      setPaginationErrorMessage(null);

      try {
        const page = await getPokemonList.execute({
          limit: POKEMON_LIST_PAGE_SIZE,
          offset: 0,
        });

        if (!isMountedRef.current) {
          return;
        }

        setPokemon(page.items);
        setTotalCount(page.totalCount);
        setNextOffset(page.nextOffset);
      } catch {
        if (!isMountedRef.current) {
          return;
        }

        if (!refreshing) setPokemon([]);
        setNextOffset(null);
        setErrorMessage(APP_ERROR_MESSAGES.pokemonList);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    void loadPokemon();

    return () => {
      isMountedRef.current = false;
    };
  }, [getPokemonList, refreshToken, reloadToken]);

  return {
    pokemon,
    totalCount,
    isLoading,
    isRefreshing,
    isLoadingMore,
    errorMessage,
    paginationErrorMessage,
    canLoadMore: nextOffset !== null,
    retry,
    refresh,
    loadMore,
  };
}
