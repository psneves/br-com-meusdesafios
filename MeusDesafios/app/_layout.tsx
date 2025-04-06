import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Add this line to set the title for challenge-assign */}
        <Stack.Screen
          name="challenge-assign"
          options={{ title: 'Adicionar desafio' }} // <--- Set the desired title here
        />
        <Stack.Screen name="+not-found" />
        {/* You might have other Stack.Screen entries here too */}
        {/* e.g., for challenge-create if you want to customize its title */}
        {/* <Stack.Screen name="challenge-create" options={{ title: 'Criar Desafio' }} /> */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}