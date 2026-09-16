import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PokemonDetail, PokemonStat } from '../../domain/models/PokemonDetail';
import { GetPokemonDetail } from '../../domain/useCases/GetPokemonDetail';
import { APP_ERROR_MESSAGES } from '../../shared/appErrors';
import { Feedback } from '../../shared/ui/Feedback';
import { PokemonArtwork, spriteUri } from '../../shared/ui/PokemonArtwork';
import { ScreenFrame } from '../../shared/ui/ScreenFrame';
import { usePokemonDetail } from './usePokemonDetail';
import { getPokemonTypeLabel, getPokemonTypeStyle } from './pokemonTypeStyles';
import { getPokemonStatLabel } from './pokemonStatLabels';

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
  const { detail, isLoading, errorMessage, retry } = usePokemonDetail(pokemonId, getPokemonDetail);
  const insets = useSafeAreaInsets();
  const [section, setSection] = useState<'about' | 'stats'>('about');
  return (
    <ScreenFrame>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        android_ripple={{ color: '#195e961a' }}
        accessibilityRole="button"
        accessibilityLabel="Volver a la lista de Pokémon"
      >
        <Text style={styles.backButtonText}>‹ Volver a Pokédex</Text>
      </Pressable>
      {detail && !isLoading && errorMessage === null ? (
        <SegmentedNav section={section} onChange={setSection} />
      ) : null}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          (isLoading || errorMessage !== null || detail === null) && styles.stateContent,
          { paddingBottom: insets.bottom },
        ]}
      >
        {isLoading ? (
          <Feedback loading message="Cargando detalles del Pokémon…" />
        ) : errorMessage !== null || detail === null ? (
          <Feedback
            message={errorMessage ?? APP_ERROR_MESSAGES.pokemonDetail}
            onRetry={retry}
            retryLabel="Reintentar cargar los detalles del Pokémon"
          />
        ) : (
          <DetailContent detail={detail} section={section} />
        )}
      </ScrollView>
    </ScreenFrame>
  );
}

function DetailContent({ detail, section }: { detail: PokemonDetail; section: 'about' | 'stats' }) {
  const primaryType = detail.types[0];
  const primaryAccent = primaryType ? getPokemonTypeStyle(primaryType).backgroundColor : '#195e96';
  const heroTextColor = getContrastingTextColor('#edf4f8');
  return (
    <>
      {section === 'about' ? (
        <>
          <View style={styles.hero}>
            <View
              style={[styles.heroTint, { backgroundColor: primaryAccent }]}
              accessible={false}
              importantForAccessibility="no"
            />
            <View
              style={[styles.heroCircleLarge, { borderColor: primaryAccent }]}
              accessible={false}
              importantForAccessibility="no"
            />
            <View
              style={[styles.heroCircleSmall, { backgroundColor: primaryAccent }]}
              accessible={false}
              importantForAccessibility="no"
            />
            <View style={styles.heroCopy}>
              <Text style={[styles.heroNumber, { color: heroTextColor }]}>
                Pokémon #{String(detail.id).padStart(3, '0')}
              </Text>
              <Text style={[styles.heroTitle, { color: heroTextColor }]} accessibilityRole="header">
                {formatLabel(detail.name)}
              </Text>
              <View
                style={styles.badges}
                accessibilityLabel={`Tipos: ${formatTypeList(detail.types)}`}
              >
                {detail.types.length ? (
                  detail.types.map((type) => <TypeBadge key={type} type={type} />)
                ) : (
                  <Text style={styles.heroLabel}>No hay tipos registrados</Text>
                )}
              </View>
            </View>
            <PokemonArtwork
              primaryUri={detail.imageUrl}
              fallbackUri={spriteUri(detail.id)}
              style={styles.image}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
              accessible={false}
              importantForAccessibility="no"
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionEyebrow}>PERFIL</Text>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Información
            </Text>
            <View style={styles.measurements}>
              <View style={styles.measurement} accessible>
                <Text style={styles.sectionLabel}>Altura</Text>
                <Text style={styles.sectionValue}>{detail.height.toFixed(1)} m</Text>
              </View>
              <View style={styles.measurement} accessible>
                <Text style={styles.sectionLabel}>Peso</Text>
                <Text style={styles.sectionValue}>{detail.weight.toFixed(1)} kg</Text>
              </View>
            </View>
            <View style={styles.abilityBlock}>
              <Text style={styles.sectionLabel} accessibilityRole="header">
                Habilidades
              </Text>
              <Text style={styles.sectionValue}>{formatList(detail.abilities)}</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>RENDIMIENTO</Text>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Estadísticas base
          </Text>
          {detail.stats.length === 0 ? (
            <Text style={styles.sectionValue}>No hay estadísticas disponibles.</Text>
          ) : (
            detail.stats.map((stat) => (
              <StatRow key={stat.name} stat={stat} accentColor={primaryAccent} />
            ))
          )}
        </View>
      )}
    </>
  );
}

function SegmentedNav({
  section,
  onChange,
}: {
  section: 'about' | 'stats';
  onChange: (value: 'about' | 'stats') => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {(['about', 'stats'] as const).map((value) => (
        <Pressable
          key={value}
          onPress={() => onChange(value)}
          style={[styles.segment, section === value && styles.segmentActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: section === value }}
          accessibilityLabel={value === 'about' ? 'Información' : 'Estadísticas'}
        >
          <Text style={[styles.segmentText, section === value && styles.segmentTextActive]}>
            {value === 'about' ? 'Información' : 'Estadísticas'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function StatRow({ stat, accentColor }: { stat: PokemonStat; accentColor: string }) {
  const normalizedValue = Math.max(0, Math.min(150, stat.value));
  const width = `${(normalizedValue / 150) * 100}%` as `${number}%`;
  return (
    <View
      style={styles.statRow}
      accessible
      accessibilityLabel={`${getPokemonStatLabel(stat.name)}, estadística base ${stat.value}`}
    >
      <View style={styles.statHeader}>
        <Text style={styles.statName}>{getPokemonStatLabel(stat.name)}</Text>
        <Text style={styles.statValue}>{stat.value}</Text>
      </View>
      <View style={styles.barTrack} accessible={false} importantForAccessibility="no">
        <View
          style={[styles.barFill, { width, backgroundColor: accentColor }]}
          accessible={false}
          importantForAccessibility="no"
        />
      </View>
    </View>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors = getPokemonTypeStyle(type);
  return (
    <View
      style={[styles.badge, { backgroundColor: colors.backgroundColor }]}
      accessible
      accessibilityLabel={getPokemonTypeLabel(type)}
    >
      <Text style={[styles.badgeText, { color: colors.textColor }]}>
        {getPokemonTypeLabel(type)}
      </Text>
    </View>
  );
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
function formatList(values: string[]): string {
  return values.length ? values.map(formatLabel).join(', ') : 'Ninguna';
}
function formatTypeList(values: string[]): string {
  return values.length ? values.map(getPokemonTypeLabel).join(', ') : 'Ninguno';
}

function getContrastingTextColor(background: string): string {
  const red = Number.parseInt(background.slice(1, 3), 16);
  const green = Number.parseInt(background.slice(3, 5), 16);
  const blue = Number.parseInt(background.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.55 ? '#172b42' : '#ffffff';
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  pressed: { backgroundColor: '#e5eff8' },
  backButtonText: { fontSize: 17, fontWeight: '600', color: '#195e96', flexShrink: 1 },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 4,
    borderRadius: 14,
    backgroundColor: '#dfe8f0',
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { backgroundColor: '#fff' },
  segmentText: { fontSize: 16, fontWeight: '600', color: '#536578' },
  segmentTextActive: { color: '#172b42' },
  scrollContent: { paddingHorizontal: 16, gap: 16 },
  stateContent: { flexGrow: 1, justifyContent: 'center' },
  hero: {
    minHeight: 390,
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#edf4f8',
    gap: 8,
    position: 'relative',
  },
  heroTint: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.12,
    top: -150,
    right: -80,
  },
  heroCircleLarge: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 2,
    opacity: 0.16,
    bottom: -110,
    left: -105,
  },
  heroCircleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    opacity: 0.11,
    top: 92,
    left: 30,
  },
  heroCopy: { zIndex: 1, gap: 8 },
  heroNumber: { fontSize: 15, color: '#172b42' },
  heroTitle: { fontSize: 30, fontWeight: '700', color: '#172b42' },
  heroLabel: { fontSize: 16, fontWeight: '600', color: '#465568' },
  image: { width: '100%', maxWidth: 240, height: 230, alignSelf: 'center', zIndex: 1 },
  section: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dce3eb',
    gap: 12,
  },
  sectionEyebrow: { fontSize: 12, letterSpacing: 1.4, fontWeight: '800', color: '#195e96' },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#172b42' },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#465568' },
  sectionValue: { fontSize: 18, color: '#172b42' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    borderRadius: 999,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  badgeText: { fontSize: 16, fontWeight: '700' },
  measurements: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  measurement: { flexGrow: 1, flexBasis: 120, gap: 6 },
  abilityBlock: {
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5eaf0',
    gap: 6,
  },
  statRow: { gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5eaf0' },
  statHeader: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  statName: { flexGrow: 1, flexShrink: 1, flexBasis: 120, fontSize: 17, color: '#465568' },
  statValue: { fontSize: 17, fontWeight: '700', color: '#172b42', fontVariant: ['tabular-nums'] },
  barTrack: { height: 10, borderRadius: 999, backgroundColor: '#d9e1ea', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: '#195e96' },
});
