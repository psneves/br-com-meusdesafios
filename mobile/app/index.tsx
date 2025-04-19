import React, { useState, useEffect } from 'react';
import {
  StyleSheet, TextInput, TouchableOpacity, View, Alert, Image,
  KeyboardAvoidingView, Platform, Text,
  useColorScheme, ActivityIndicator, ScrollView
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '@/hooks/useAuth'; // Import your auth hook

// For dark/light mode support
const googleLogo = require('@/assets/images/google-logo.webp'); // Corrected extension if needed, assuming .png exists

// Ensure the web browser is dismissible, required for expo-auth-session
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // --- State for traditional login ---
  const [email, setEmail] = useState(''); // Renamed from username to email
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false); // General loading state for traditional login

  // --- State for social login ---
  const [isGoogleLoading, setIsGoogleLoading] = useState(false); // Specific Google loading state
  const { login } = useAuth(); // Get the login function from your hook

  // --- Google Auth Hook ---
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // Use web client ID for simplicity on all platforms in this example
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });

  // --- Effect to handle Google Auth Response ---
  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type === 'success') {
        const { authentication } = response;
        if (authentication?.accessToken) {
          console.log("Google Auth Success: Got access token");
          setIsGoogleLoading(true); // Indicate fetching user info
          try {
            // Fetch user info from Google
            const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
              headers: { Authorization: `Bearer ${authentication.accessToken}` },
            });
            const userInfo = await userInfoResponse.json();
            console.log("Google User Info:", userInfo);

            // --- TODO: Adapt your useAuth hook's login function ---
            // Your current `login` expects email/password. You need to either:
            // 1. Modify `login` to accept Google user info directly.
            // 2. Create a new function in `useAuth` like `loginWithGoogle(userInfo)`.
            // For now, we'll simulate calling the existing login with fetched email.
            // This is NOT ideal long-term. You should adapt useAuth.
            // For this example, we'll just log the info and not proceed with login
            // as the user wants a simple username/password flow.
            // If you wanted to integrate Google login, you'd call login or loginWithGoogle here.
            Alert.alert('Google Login Info', `Logged in as: ${userInfo.email}\n(Google login not fully integrated in this example)`);

          } catch (error) {
            console.error("Failed to fetch Google user info:", error);
            Alert.alert('Erro', 'Não foi possível obter informações do Google.');
          } finally {
            setIsGoogleLoading(false);
          }
        } else {
          console.warn("Google Auth Success but no access token received.");
          Alert.alert('Erro', 'Falha na autenticação com Google (sem token).');
          setIsGoogleLoading(false);
        }
      } else if (response?.type === 'error') {
        console.error("Google Auth Error:", response.error);
        Alert.alert('Erro', `Falha na autenticação com Google: ${response.error}`);
        setIsGoogleLoading(false);
      } else if (response?.type === 'cancel' || response?.type === 'dismiss') {
        console.log("Google Auth Cancelled/Dismissed by user.");
        setIsGoogleLoading(false); // Reset loading state if user cancels
      }
    };

    // Only process response if it exists
    if (response) {
      handleGoogleResponse();
    }
  }, [response]); // Add response to dependency array

  // --- Traditional Login Handler ---
  const handleLogin = async () => {
    setIsLoading(true);
    console.log("Attempting traditional login with:", { email, password }); // Log email

    try {
      // Call the login function from the auth hook
      // The auth hook will handle the hardcoded check
      await login({ email, password }); // Pass email instead of username
      // If login is successful, the useAuth hook will update state
      // and the RootLayoutNav effect will handle navigation.
    } catch (error) {
      // Error handling is done inside useAuth, but we catch here to stop loading
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Placeholder Handlers (Keep or adapt) ---
  const handleSignUp = () => { Alert.alert('Cadastro (Placeholder)', 'Funcionalidade de cadastro ainda não implementada.'); };
  const handleForgotPassword = () => { Alert.alert('Recuperar Senha (Placeholder)', 'Funcionalidade de recuperação de senha ainda não implementada.'); };

  // --- Updated Social Login Handler (Only Google remains) ---
  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      if (request) { // Ensure the request object is ready
        setIsGoogleLoading(true); // Set loading state before prompting
        promptAsync(); // Trigger Google Sign-In prompt
      } else {
        console.error("Google Auth Request not ready.");
        Alert.alert("Erro", "Não é possível iniciar o login com Google agora.");
      }
    }
    // Apple login removed as per request
  };

  // --- Dynamic Styles ---
  const inputBackgroundColor = isDarkMode ? '#3A3A3C' : '#F2F2F7';
  const inputTextColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inputPlaceholderColor = isDarkMode ? '#8E8E93' : '#C7C7CD';
  const loginButtonBg = isDarkMode ? '#0A84FF' : '#007AFF'; // Blue for primary action
  const loginButtonTextColor = '#FFFFFF';
  const socialButtonBg = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const socialButtonBorder = isDarkMode ? '#48484A' : '#E0E0E0';
  const socialButtonTextColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedText type="title" style={{ marginBottom: 30, textAlign: 'center' }}>Bem-vindo(a)!</ThemedText>

          {/* --- Traditional Login Form --- */}
          {/* Updated label to E-mail */}
          <ThemedText style={styles.label}>E-mail</ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBackgroundColor, color: inputTextColor }
            ]}
            placeholder="email@exemplo.com" // Updated placeholder
            value={email} // Use email state
            onChangeText={setEmail} // Update email state
            placeholderTextColor={inputPlaceholderColor}
            autoCapitalize="none"
            keyboardType="email-address" // Suggest email keyboard
          />

          <ThemedText style={styles.label}>Senha</ThemedText>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBackgroundColor, color: inputTextColor }
            ]}
            placeholder="Sua senha" // Updated placeholder for UX
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={inputPlaceholderColor}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: loginButtonBg }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={loginButtonTextColor} />
            ) : (
              <Text style={[styles.loginButtonText, { color: loginButtonTextColor }]}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* --- Divider --- */}
          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#48484A' : '#D1D1D6' }]} />
            <ThemedText style={[styles.dividerText, { color: isDarkMode ? '#8E8E93' : '#8E8E93' }]}>OU</ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: isDarkMode ? '#48484A' : '#D1D1D6' }]} />
          </View>

          {/* --- Social Login Buttons --- */}
          <View style={styles.socialLoginContainer}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: socialButtonBg, borderColor: socialButtonBorder }]}
              onPress={() => handleSocialLogin('Google')}
              disabled={!request || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <ActivityIndicator color={socialButtonTextColor} size="small" />
              ) : (
                <>
                  {/* Use the Image component here */}
                  <Image source={googleLogo} style={styles.socialIconImage} />
                  <Text style={[styles.socialButtonText, { color: socialButtonTextColor }]}>Entrar com Google</Text>
                </>
              )}
            </TouchableOpacity>
            {/* Apple login button removed */}
          </View>

          {/* --- Signup and Forgot Password Links --- */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={handleSignUp}>
              <ThemedText type="link">Criar Conta</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <ThemedText type="link">Esqueceu a senha?</ThemedText>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// --- Styles (Adjusted for new elements) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
  },
  loginButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20, // Space before divider
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20, // Adjusted margin
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  socialLoginContainer: {
    gap: 15,
    marginBottom: 20, // Space before links
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 50,
  },
  socialIconImage: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: 'contain',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});