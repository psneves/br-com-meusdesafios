import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import Constants from "expo-constants";
import { useAuthStore } from "../../src/stores/auth.store";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing } from "../../src/theme/spacing";

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.googleWebClientId,
  iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
});

const PRIVACY_URL =
  Constants.expoConfig?.extra?.privacyPolicyUrl ??
  "https://meusdesafios.com.br/privacy";
const TERMS_URL =
  Constants.expoConfig?.extra?.termsOfUseUrl ??
  "https://meusdesafios.com.br/terms";

export default function LoginScreen() {
  const { loginWithGoogle, loginWithApple } = useAuthStore();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type === "cancelled") return;

      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new Error("Não foi possível obter o token do Google");
      }

      await loginWithGoogle(idToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao entrar";
      Alert.alert("Erro", message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const identityToken = credential.identityToken;
      if (!identityToken) {
        throw new Error("Não foi possível obter o token da Apple");
      }

      const fullName =
        [credential.fullName?.givenName, credential.fullName?.familyName]
          .filter(Boolean)
          .join(" ") || undefined;

      await loginWithApple(
        identityToken,
        fullName,
        credential.email ?? undefined
      );
    } catch (err) {
      // Handle user cancellation silently
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code: string }).code === "ERR_REQUEST_CANCELED"
      ) {
        return;
      }
      const message = err instanceof Error ? err.message : "Erro ao entrar";
      Alert.alert("Erro", message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topSpacer} />

        <View style={styles.hero}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            accessible={false}
          />
          <Text style={styles.title}>Bem-vindo(a)</Text>
          <Text style={styles.tagline}>Consistência vira resultado.</Text>
        </View>

        <View style={styles.bottomSpacer} />

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.googleButton,
              isSigningIn && styles.buttonDisabled,
              pressed && !isSigningIn && styles.buttonPressed,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            accessibilityRole="button"
            accessibilityLabel="Continuar com Google"
          >
            {isSigningIn ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={colors.white} />
                <Text style={styles.googleButtonText}>
                  Continuar com Google
                </Text>
              </>
            )}
          </Pressable>

          {Platform.OS === "ios" && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.appleButton,
                isSigningIn && styles.buttonDisabled,
                pressed && !isSigningIn && styles.buttonPressed,
              ]}
              onPress={handleAppleSignIn}
              disabled={isSigningIn}
              accessibilityRole="button"
              accessibilityLabel="Continuar com Apple"
            >
              {isSigningIn ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={22} color={colors.white} />
                  <Text style={styles.appleButtonText}>
                    Continuar com Apple
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Ao continuar, você concorda com nossos{" "}
            <Text
              style={styles.footerLink}
              onPress={() => Linking.openURL(TERMS_URL)}
              accessibilityRole="link"
            >
              Termos de Uso
            </Text>{" "}
            e{" "}
            <Text
              style={styles.footerLink}
              onPress={() => Linking.openURL(PRIVACY_URL)}
              accessibilityRole="link"
            >
              Política de Privacidade
            </Text>
            .
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.phi5,
  },
  topSpacer: {
    flex: 1.5,
  },
  hero: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 22,
  },
  title: {
    ...typography.h1,
    color: colors.gray[900],
    marginTop: spacing.phi4,
  },
  tagline: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.phi2,
  },
  bottomSpacer: {
    flex: 2,
  },
  buttons: {
    gap: spacing.phi3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
    gap: spacing.phi3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  googleButton: {
    backgroundColor: colors.primary[500],
  },
  appleButton: {
    backgroundColor: colors.black,
  },
  googleButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  appleButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  footer: {
    paddingTop: spacing.phi5,
    paddingBottom: spacing.phi4,
    paddingHorizontal: spacing.phi3,
  },
  footerText: {
    ...typography.caption,
    color: colors.gray[400],
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    textDecorationLine: "underline",
    color: colors.gray[500],
  },
});
