import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { COLORS } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <HomeScreen />
    </SafeAreaProvider>
  );
}
