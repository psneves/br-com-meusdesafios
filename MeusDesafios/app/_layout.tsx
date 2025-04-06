// FILE: app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return; // Don't redirect until auth state is known

    const inAuthGroup = segments[0] === '(tabs)';
    // Check if the current route segment corresponds to the root index (our new login screen)
    const isLoginPage = segments === null || (segments.length === 1 && segments[0] === 'index' as string);

    if (isAuthenticated) {
      // If authenticated but not in the tabs group, redirect to the main app
      if (!inAuthGroup) {
        router.replace('/(tabs)/challenges'); // Or '/(tabs)' if you prefer the first tab
      }
      // If authenticated and already in tabs, do nothing.
    } else {
      // If NOT authenticated and NOT already on the login page, redirect there.
      // The root path '/' now corresponds to 'app/index.tsx'
      if (!isLoginPage) {
         router.replace('/'); // Redirect to the root/login screen
      }
      // If not authenticated and already on the login page, do nothing.
    }
  }, [isAuthenticated, isLoading, segments, router]); // Keep dependencies

  // Optional: Loading indicator while checking auth
  // if (isLoading) {
  //   return <LoadingIndicator />;
  // }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Define Login screen OUTSIDE tabs, matching the NEW filename 'index.tsx' */}
        {/* THIS LINE IS UPDATED: */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        {/* Define the Tabs group */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Other modal/auxiliary screens */}
        <Stack.Screen
          name="challenge-assign"
          options={{ title: 'Adicionar desafio', presentation: 'modal' }}
        />
        <Stack.Screen
          name="challenge-create"
          options={{ title: 'Criar desafio', presentation: 'modal' }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
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
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}