import { useCallback, useEffect, useState } from 'react';
import { Pokemon } from '../../domain/models/Pokemon';
import { GetPokemonList } from '../../domain/useCases/GetPokemonList';

export type PokemonListViewState = {
  pokemon: Pokemon[];
  isLoading: boolean;
  errorMessage: string | null;
  retry: () => void;
};

const FRIENDLY_ERROR_MESSAGE =
  "We couldn't load Pokémon right now. Please try again.";

export function usePokemonList(
  getPokemonList: GetPokemonList,
): PokemonListViewState {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const retry = useCallback(() => {
    setReloadToken((currentToken) => currentToken + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPokemon = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const page = await getPokemonList.execute({ limit: 20, offset: 0 });

        if (!isMounted) {
          return;
        }

        setPokemon(page.items);
      } catch {
        if (!isMounted) {
          return;
        }

        setPokemon([]);
        setErrorMessage(FRIENDLY_ERROR_MESSAGE);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadPokemon();

    return () => {
      isMounted = false;
    };
  }, [getPokemonList, reloadToken]);

  return {
    pokemon,
    isLoading,
    errorMessage,
    retry,
  };
}
