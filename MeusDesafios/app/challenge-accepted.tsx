// --- Example Snippet for login.tsx ---

import React, { useState } from 'react';
import {
  StyleSheet, TextInput, TouchableOpacity, View, Alert, Image,
  KeyboardAvoidingView, Platform, Text, // Use standard Text
  useColorScheme, ActivityIndicator
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
// import Icon from 'react-native-vector-icons/FontAwesome'; // Example for social icons

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  // ... (useState for email, password, isLoading)

  const handleLogin = () => { /* ... */ };
  const handleSignUp = () => {
      Alert.alert('Navegação', 'Ir para a tela de Inscrição.');
      // router.push('/signup');
  };
  const handleForgotPassword = () => { /* ... */ };
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
          {/* ... (Optional Logo, Title, Subtitle) ... */}

          <TextInput /* ... Email Input ... */ />
          <TextInput /* ... Password Input ... */ />

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

// --- Styles for Login Screen ---
const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardAvoidingContainer: { flex: 1 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 20 },
    // ... (logo, title, subtitle, input styles - adapt colors based on theme)
    input: { height: 50, borderRadius: 10, paddingHorizontal: 15, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: 'rgba(128, 128, 128, 0.3)' },
    primaryButton: {
        paddingVertical: 16, // Slightly more padding
        borderRadius: 12, // More rounded
        alignItems: 'center',
        marginTop: 15,
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 17, // Slightly larger text
        fontWeight: '600', // Semi-bold
    },
    secondaryButton: { // Style for Sign Up link/button
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
        marginVertical: 25, // More space around divider
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
        gap: 15, // Space between social buttons
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

// --- End Example Snippet for login.tsx ---