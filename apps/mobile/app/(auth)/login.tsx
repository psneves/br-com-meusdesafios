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
        <View style={styles.hero}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            accessible={false}
          />
          <Text style={styles.title}>Meus Desafios</Text>
          <Text style={styles.tagline}>Consistência vira resultado</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[
              styles.button,
              styles.googleButton,
              isSigningIn && styles.buttonDisabled,
            ]}
            onPress={handleGoogleSignIn}
            disabled={isSigningIn}
            accessibilityRole="button"
            accessibilityLabel="Entrar com Google"
          >
            {isSigningIn ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={colors.white} />
                <Text style={styles.buttonText}>Entrar com Google</Text>
              </>
            )}
          </Pressable>

          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={12}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.phi5,
  },
  hero: {
    alignItems: "center",
    marginBottom: spacing.phi7,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  title: {
    ...typography.h1,
    color: colors.primary[500],
    marginTop: spacing.phi4,
  },
  tagline: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.phi2,
  },
  buttons: {
    gap: spacing.phi3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.phi4,
    borderRadius: 12,
    gap: spacing.phi3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButton: {
    backgroundColor: colors.primary[500],
  },
  appleButton: {
    height: 52,
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
