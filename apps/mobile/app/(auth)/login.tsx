import { View, Text, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../src/stores/auth.store";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing } from "../../src/theme/spacing";

export default function LoginScreen() {
  const { loginWithGoogle, loginWithApple } = useAuthStore();

  const handleGoogleSignIn = async () => {
    try {
      // TODO: Integrate @react-native-google-signin/google-signin
      // const { idToken } = await GoogleSignin.signIn();
      // await loginWithGoogle(idToken);
      Alert.alert(
        "Google Sign-In",
        "Configure GOOGLE_CLIENT_ID and install @react-native-google-signin/google-signin to enable."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao entrar";
      Alert.alert("Erro", message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      // TODO: Integrate @invertase/react-native-apple-authentication
      // const credential = await appleAuth.performRequest({ ... });
      // await loginWithApple(credential.identityToken, fullName, email);
      Alert.alert(
        "Apple Sign-In",
        "Install @invertase/react-native-apple-authentication to enable."
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao entrar";
      Alert.alert("Erro", message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="trophy" size={80} color={colors.primary[500]} />
          <Text style={styles.title}>Meus Desafios</Text>
          <Text style={styles.tagline}>Consistência vira resultado</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
          >
            <Ionicons name="logo-google" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Entrar com Google</Text>
          </Pressable>

          {Platform.OS === "ios" && (
            <Pressable
              style={[styles.button, styles.appleButton]}
              onPress={handleAppleSignIn}
            >
              <Ionicons name="logo-apple" size={20} color={colors.white} />
              <Text style={styles.buttonText}>Entrar com Apple</Text>
            </Pressable>
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
  googleButton: {
    backgroundColor: colors.primary[500],
  },
  appleButton: {
    backgroundColor: colors.black,
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
