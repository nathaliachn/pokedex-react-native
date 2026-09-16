import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style={Platform.OS === 'android' ? 'dark' : 'auto'} />
    </SafeAreaProvider>
  );
}
