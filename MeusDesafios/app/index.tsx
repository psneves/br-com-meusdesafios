import React, { useState } from 'react';
import {
  StyleSheet, TextInput, TouchableOpacity, View, Alert, Image,
  KeyboardAvoidingView, Platform, Text, // Use standard Text
  useColorScheme, ActivityIndicator, ScrollView // Added ScrollView based on original snippet
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
// import { useRouter } from 'expo-router'; // Uncomment if needed for navigation

// import Icon from 'react-native-vector-icons/FontAwesome'; // Example for social icons

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [email, setEmail] = useState(''); // Added state example
  const [password, setPassword] = useState(''); // Added state example
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter(); // Uncomment if needed

  const handleLogin = () => {
      setIsLoading(true);
      Alert.alert('Login (Placeholder)', `Email: ${email}, Senha: ${password}`);
      // TODO: Implement actual login logic
      // On success: router.replace('/(tabs)/challenges'); // or '/(tabs)' to land on the first tab
      setTimeout(() => setIsLoading(false), 1000); // Simulate loading
  };

  const handleSignUp = () => {
      Alert.alert('Navegação', 'Ir para a tela de Inscrição.');
      // router.push('/signup'); // Make sure '/signup' route exists
  };
  const handleForgotPassword = () => {
      Alert.alert('Navegação', 'Ir para a tela Esqueci a Senha.');
      // router.push('/forgot-password'); // Make sure '/forgot-password' route exists
   };
  const handleSocialLogin = (provider: string) => {
      Alert.alert('Login Social (Placeholder)', `Tentando login com ${provider}`);
      // Implement actual social login logic
  };

  // --- Dynamic Styles ---
  const inputBackgroundColor = isDarkMode ? '#3A3A3C' : '#F2F2F7';
  const inputTextColor = isDarkMode ? '#FFFFFF' : '#000000';
  const inputPlaceholderColor = isDarkMode ? '#8E8E93' : '#C7C7CD';
  const primaryButtonBg = isDarkMode ? '#0A84FF' : '#007AFF'; // Main action blue
  const primaryButtonTextColor = '#FFFFFF';
  const secondaryTextColor = isDarkMode ? '#AEAEB2' : '#8E8E93'; // For links/dividers
  const socialButtonBg = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const socialButtonBorder = isDarkMode ? '#555' : '#DDD';
  const socialButtonTextColor = isDarkMode ? '#FFF' : '#000';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Optional: Add Logo/Title */}
          <ThemedText type="title" style={{ marginBottom: 30, textAlign: 'center' }}>Bem-vindo!</ThemedText>

          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: socialButtonBorder }]}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={inputPlaceholderColor}
          />
          <TextInput
            style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: socialButtonBorder }]}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={inputPlaceholderColor}
          />

          {/* --- Modernized Login/Primary Button --- */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: primaryButtonBg }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={primaryButtonTextColor} />
            ) : (
              <Text style={[styles.primaryButtonText, { color: primaryButtonTextColor }]}>
                Entrar
              </Text>
            )}
          </TouchableOpacity>

          {/* --- Modernized Sign Up Button --- */}
           <TouchableOpacity
            style={[styles.secondaryButton]} // Different style for secondary action
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={[styles.secondaryButtonText, { color: primaryButtonBg }]}>
              Não tem conta? Inscrever-se
            </Text>
          </TouchableOpacity>

          {/* --- Divider --- */}
          <View style={styles.dividerContainer}>
              <View style={[styles.dividerLine, {backgroundColor: secondaryTextColor}]} />
              <ThemedText style={[styles.dividerText, {color: secondaryTextColor}]}>OU</ThemedText>
              <View style={[styles.dividerLine, {backgroundColor: secondaryTextColor}]} />
          </View>

          {/* --- Social Login Buttons --- */}
          <View style={styles.socialLoginContainer}>
              <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: socialButtonBg, borderColor: socialButtonBorder }]}
                  onPress={() => handleSocialLogin('Google')}
                  disabled={isLoading}
              >
                  {/* <Icon name="google" size={20} color={socialButtonTextColor} style={styles.socialIcon} /> */}
                  <Text style={[styles.socialButtonText, { color: socialButtonTextColor }]}>Entrar com Google</Text>
              </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.socialButton, { backgroundColor: socialButtonBg, borderColor: socialButtonBorder }]}
                  onPress={() => handleSocialLogin('Apple')}
                  disabled={isLoading}
              >
                  {/* <Icon name="apple" size={20} color={socialButtonTextColor} style={styles.socialIcon} /> */}
                  <Text style={[styles.socialButtonText, { color: socialButtonTextColor }]}>Entrar com Apple</Text>
              </TouchableOpacity>
              {/* Add more social providers if needed */}
          </View>


          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
          >
            <ThemedText style={[styles.linkText, { color: secondaryTextColor }]}>Esqueceu a senha?</ThemedText>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// --- Styles for Login Screen (Copied from challenge-accepted.tsx) ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardAvoidingContainer: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 20 },
    input: { height: 50, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, /* borderColor set dynamically */ },
    primaryButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
    },
    secondaryButton: {
        marginTop: 15,
        paddingVertical: 10,
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '500',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        // backgroundColor set dynamically
    },
    dividerText: {
        marginHorizontal: 10,
        fontSize: 12,
        fontWeight: '500',
        // color set dynamically
    },
    socialLoginContainer: {
        gap: 15,
        marginBottom: 20,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        // backgroundColor, borderColor set dynamically
    },
    socialIcon: {
        marginRight: 10,
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '500',
        // color set dynamically
    },
    linkButton: {
        marginTop: 15,
        alignItems: 'center',
    },
    linkText: {
        fontSize: 14,
        // color set dynamically
    },
});