import { StatusBar } from 'expo-status-bar';
import { getPokemonList } from './src/features/pokemonList/composition';
import { PokemonListScreen } from './src/features/pokemonList/PokemonListScreen';

export default function App() {
  return (
    <>
      <PokemonListScreen getPokemonList={getPokemonList} />
      <StatusBar style="auto" />
    </>
  );
}
