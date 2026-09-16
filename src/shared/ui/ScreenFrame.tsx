import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Applies the native top and horizontal insets; scrollable children own bottom insets. */
export function ScreenFrame({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'right', 'left']}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  content: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' },
});
