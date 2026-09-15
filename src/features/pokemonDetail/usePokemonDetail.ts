import { useCallback, useEffect, useState } from 'react';
import { PokemonDetail } from '../../domain/models/PokemonDetail';
import { GetPokemonDetail } from '../../domain/useCases/GetPokemonDetail';
import { APP_ERROR_MESSAGES } from '../../shared/appErrors';

export type PokemonDetailViewState = {
  detail: PokemonDetail | null;
  isLoading: boolean;
  errorMessage: string | null;
  retry: () => void;
};

export function usePokemonDetail(
  pokemonId: number,
  getPokemonDetail: GetPokemonDetail,
): PokemonDetailViewState {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState<number>(0);

  const retry = useCallback(() => {
    setReloadToken((currentToken) => currentToken + 1);
  }, []);

  useEffect(() => {
    let isCurrentRequest = true;

    const loadDetail = async (): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const pokemonDetail = await getPokemonDetail.execute(pokemonId);

        if (!isCurrentRequest) {
          return;
        }

        setDetail(pokemonDetail);
      } catch {
        if (!isCurrentRequest) {
          return;
        }

        setDetail(null);
        setErrorMessage(APP_ERROR_MESSAGES.pokemonDetail);
      } finally {
        if (isCurrentRequest) {
          setIsLoading(false);
        }
      }
    };

    void loadDetail();

    return () => {
      isCurrentRequest = false;
    };
  }, [getPokemonDetail, pokemonId, reloadToken]);

  return {
    detail,
    isLoading,
    errorMessage,
    retry,
  };
}
