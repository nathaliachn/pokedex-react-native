import { useState } from 'react';
import { Image, ImageProps } from 'react-native';

type PokemonArtworkProps = Omit<ImageProps, 'source'> & {
  primaryUri: string;
  fallbackUri: string;
};

export function PokemonArtwork({ primaryUri, fallbackUri, ...props }: PokemonArtworkProps) {
  const [useFallback, setUseFallback] = useState(false);
  return (
    <Image
      key={primaryUri}
      {...props}
      source={{ uri: useFallback ? fallbackUri : primaryUri }}
      fadeDuration={0}
      resizeMethod="resize"
      onError={() => {
        if (!useFallback) setUseFallback(true);
      }}
    />
  );
}

export function officialArtworkUri(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function spriteUri(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
