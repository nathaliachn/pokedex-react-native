import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

type FeedbackProps = {
  message: string;
  loading?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
};

export function Feedback({ message, loading = false, onRetry, retryLabel }: FeedbackProps) {
  return (
    <View style={styles.container}>
      <View
        accessible
        accessibilityRole={loading ? 'progressbar' : 'text'}
        accessibilityLabel={message}
        accessibilityState={{ busy: loading }}
        accessibilityLiveRegion="polite"
        style={styles.message}
      >
        {loading ? <ActivityIndicator size="large" color="#195e96" accessible={false} /> : null}
        <Text style={styles.text}>{message}</Text>
      </View>
      {onRetry && !loading ? (
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel ?? 'Retry'}
          android_ripple={{ color: '#ffffff33' }}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 24, gap: 20 },
  message: { alignItems: 'center', gap: 16 },
  text: { fontSize: 17, color: '#465568', textAlign: 'center' },
  button: {
    backgroundColor: '#195e96', borderRadius: 12, minHeight: 48, minWidth: 112,
    paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center', justifyContent: 'center',
  },
  pressed: { backgroundColor: '#12466f' },
  buttonText: { color: '#fff', fontSize: 17, fontWeight: '600', textAlign: 'center' },
});
