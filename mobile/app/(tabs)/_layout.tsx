// FILE: app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, ActivityIndicator } from 'react-native'; // Added ActivityIndicator for loading state

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth'; // Keep useAuth import

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth(); // Get auth state

  // Optional: Show a loading indicator while auth state is being determined.
  // The root layout also handles redirection, so this might be brief or unnecessary.
  // if (isLoading) {
  //   // You could return a simple loading view or null
  //   // return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  //   return null;
  // }

  // Only render the Tabs component if the user is authenticated
  if (isAuthenticated) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            position: Platform.OS === 'ios' ? 'absolute' : undefined,
          },
        }}>
        {/* Screens accessible only when authenticated */}
        <Tabs.Screen
          name="challenges" // This will likely be the default tab now
          options={{
            title: 'Desafios',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Comunidade',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.2.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle.fill" color={color} />,
          }}
        />
        {/* Ensure the index screen is NOT listed here anymore */}
        {/* <Tabs.Screen name="index" options={{ href: null }} /> */}
      </Tabs>
    );
  }

  // If not authenticated (and potentially not loading anymore), render nothing for this layout.
  // The root layout's redirection logic defined in `app/_layout.tsx` will handle navigation.
  return null;
}
