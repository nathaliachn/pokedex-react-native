import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PokemonDetail, PokemonStat } from '../../domain/models/PokemonDetail';
import { GetPokemonDetail } from '../../domain/useCases/GetPokemonDetail';
import { usePokemonDetail } from './usePokemonDetail';

type PokemonDetailScreenProps = {
  pokemonId: number;
  getPokemonDetail: GetPokemonDetail;
  onBack: () => void;
};

export function PokemonDetailScreen({
  pokemonId,
  getPokemonDetail,
  onBack,
}: PokemonDetailScreenProps) {
  const { detail, isLoading, errorMessage, retry } = usePokemonDetail(
    pokemonId,
    getPokemonDetail,
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          android_ripple={{ color: 'rgba(42, 117, 187, 0.16)' }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Returns to the Pokémon list"
        >
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        {renderContent(detail, isLoading, errorMessage, retry)}
      </View>
    </SafeAreaView>
  );
}

function renderContent(
  detail: PokemonDetail | null,
  isLoading: boolean,
  errorMessage: string | null,
  retry: () => void,
) {
  if (isLoading) {
    return (
      <View style={styles.centered} accessibilityLabel="Loading Pokémon details">
        <ActivityIndicator
          size="large"
          color="#2a75bb"
          accessibilityLabel="Loading Pokémon details"
        />
        <Text style={styles.statusText}>Loading Pokémon details…</Text>
      </View>
    );
  }

  if (errorMessage !== null || detail === null) {
    const message =
      errorMessage ?? "We couldn't load this Pokémon right now. Please try again.";

    return (
      <View style={styles.centered} accessibilityLabel={message}>
        <Text style={styles.statusText}>{message}</Text>
        <Pressable
          onPress={retry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.24)' }}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityHint="Loads this Pokémon’s details again"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const displayName = formatLabel(detail.name);

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      accessibilityLabel={`${displayName} details`}
    >
      <Text style={styles.title} accessibilityRole="header">
        {displayName}
      </Text>
      <Image
        source={{ uri: detail.imageUrl }}
        style={styles.image}
        accessibilityIgnoresInvertColors
        accessible
        accessibilityLabel={`${displayName} image`}
      />
      <Text style={styles.sectionLabel}>Height</Text>
      <Text style={styles.sectionValue}>{formatMeasurement(detail.height, 'm')}</Text>
      <Text style={styles.sectionLabel}>Weight</Text>
      <Text style={styles.sectionValue}>{formatMeasurement(detail.weight, 'kg')}</Text>
      <Text style={styles.sectionLabel}>Types</Text>
      <Text style={styles.sectionValue}>{formatList(detail.types)}</Text>
      <Text style={styles.sectionLabel}>Abilities</Text>
      <Text style={styles.sectionValue}>{formatList(detail.abilities)}</Text>
      <Text style={styles.sectionLabel}>Stats</Text>
      {detail.stats.map((stat) => (
        <StatRow key={stat.name} stat={stat} />
      ))}
    </ScrollView>
  );
}

function StatRow({ stat }: { stat: PokemonStat }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statName}>{formatLabel(stat.name)}</Text>
      <Text style={styles.statValue}>{String(stat.value)}</Text>
    </View>
  );
}

function formatLabel(value: string): string {
  if (value.length === 0) {
    return value;
  }

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatList(values: string[]): string {
  if (values.length === 0) {
    return 'None';
  }

  return values.map(formatLabel).join(', ');
}

function formatMeasurement(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`;
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
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2a75bb',
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
    flexShrink: 1,
  },
  image: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5560',
    marginTop: 12,
    marginBottom: 4,
  },
  sectionValue: {
    fontSize: 18,
    color: '#1a1a1a',
    flexShrink: 1,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d5dbe3',
  },
  statName: {
    flex: 1,
    flexShrink: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flexShrink: 0,
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
