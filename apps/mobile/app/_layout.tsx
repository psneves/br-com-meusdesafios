import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../src/stores/auth.store";
import { startQueueFlushListener } from "../src/services/queue-flush";
import { registerForPushNotifications } from "../src/services/push-notifications";
import { ErrorBoundary } from "../src/components/ErrorBoundary";
import { colors } from "../src/theme/colors";

const sentryDsn = Constants.expoConfig?.extra?.sentryDsn;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 0.2,
  });
}

function AuthGate() {
  const { isLoading, isAuthenticated, user, restoreSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Start offline queue flush listener and register push notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = startQueueFlushListener();
    registerForPushNotifications().catch(() => {});
    return unsubscribe;
  }, [isAuthenticated]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inOnboardingGroup = segments[0] === "(onboarding)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && !user?.dateOfBirth && !inOnboardingGroup) {
      router.replace("/(onboarding)/dob");
    } else if (isAuthenticated && user?.dateOfBirth && (inAuthGroup || inOnboardingGroup)) {
      router.replace("/(tabs)");
    }
  }, [isLoading, isAuthenticated, user?.dateOfBirth, segments, router]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return <Slot />;
}

function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary onError={(error) => Sentry.captureException(error)}>
        <AuthGate />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootLayout);

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
});
