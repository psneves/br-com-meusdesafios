/**
 * create-challenge.tsx
 *
 * Screen component for creating a new challenge.
 * Provides input fields for challenge details and a save button.
 * Theme-aware styling.
 */
import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    useColorScheme, // Import useColorScheme
    ScrollView, // Use ScrollView for potentially longer forms
    Text, // Use standard Text for button if ThemedText isn't needed or available
} from 'react-native';

// --- Custom Component Imports ---
// Assuming Themed components are available globally or adjust path
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// --- Navigation Hook ---
// import { useRouter } from 'expo-router';

export default function CreateChallengeScreen() {
    // --- Theme Hook ---
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // --- State for Form Inputs ---
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(''); // Store as string initially
    const [multiplier, setMultiplier] = useState('1.5'); // Default multiplier
    const [isLoading, setIsLoading] = useState(false);

    // --- Navigation ---
    // const router = useRouter();

    // --- Handlers ---
    const handleSaveChallenge = () => {
        // Basic Validation
        if (!title.trim() || !duration.trim()) {
            Alert.alert('Campos Obrigatórios', 'Por favor, preencha o título e a duração do desafio.');
            return;
        }
        const durationNum = parseInt(duration, 10);
        if (isNaN(durationNum) || durationNum <= 0) {
            Alert.alert('Duração Inválida', 'Por favor, insira um número válido de dias para a duração.');
            return;
        }
        const multiplierNum = parseFloat(multiplier);
         if (isNaN(multiplierNum) || multiplierNum < 1) {
            Alert.alert('Multiplicador Inválido', 'Por favor, insira um multiplicador de prazo válido (ex: 1.1, 1.5, 2).');
            return;
        }


        setIsLoading(true);
        console.log('Saving Challenge:', { title, description, duration: durationNum, multiplier: multiplierNum });

        // --- TODO: Backend Integration ---
        // 1. Send API request to create the new challenge with the collected data.
        // 2. Handle API response (success/error).
        // 3. On success, potentially navigate back or show a success message.
        // Example:
        // try {
        //   await api.createChallenge({ title, description, goalDuration: durationNum, deadlineMultiplier: multiplierNum });
        //   Alert.alert('Sucesso', 'Desafio criado com sucesso!');
        //   router.back(); // Go back to the previous screen
        // } catch (error) {
        //   Alert.alert('Erro', 'Não foi possível criar o desafio.');
        // } finally {
        //   setIsLoading(false);
        // }
        // ---------------------------------

        // Placeholder success
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Sucesso (Placeholder)', 'Desafio criado!');
            // router.back(); // Navigate back
        }, 1000);
    };

    // --- Dynamic Styles ---
    const inputBackgroundColor = isDarkMode ? '#3A3A3C' : '#F2F2F7';
    const inputTextColor = isDarkMode ? '#FFFFFF' : '#000000';
    const inputPlaceholderColor = isDarkMode ? '#8E8E93' : '#C7C7CD';
    const saveButtonBg = isDarkMode ? '#0A84FF' : '#007AFF';
    const saveButtonTextColor = '#FFFFFF';

    return (
        // Use ThemedView for automatic background color based on theme
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <ThemedText type="title" style={styles.title}>Criar Novo Desafio</ThemedText>

                {/* Title Input */}
                <ThemedText style={styles.label}>Título do Desafio</ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: inputBackgroundColor, color: inputTextColor }
                    ]}
                    placeholder="Ex: Correr 5km por 30 dias"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor={inputPlaceholderColor}
                    maxLength={100}
                />

                {/* Description Input */}
                <ThemedText style={styles.label}>Descrição (Opcional)</ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        styles.textArea, // Specific style for multi-line
                        { backgroundColor: inputBackgroundColor, color: inputTextColor }
                    ]}
                    placeholder="Adicione detalhes sobre o desafio..."
                    value={description}
                    onChangeText={setDescription}
                    placeholderTextColor={inputPlaceholderColor}
                    multiline={true}
                    numberOfLines={4}
                    maxLength={500}
                />

                {/* Duration Input */}
                <ThemedText style={styles.label}>Duração (em dias)</ThemedText>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: inputBackgroundColor, color: inputTextColor }
                    ]}
                    placeholder="Ex: 30"
                    value={duration}
                    onChangeText={setDuration}
                    placeholderTextColor={inputPlaceholderColor}
                    keyboardType="number-pad" // Use numeric keyboard
                />

                 {/* Deadline Multiplier Input */}
                 <ThemedText style={styles.label}>Multiplicador de Prazo</ThemedText>
                 <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: inputBackgroundColor, color: inputTextColor }
                    ]}
                    placeholder="Ex: 1.5 (para 1.5x a duração)"
                    value={multiplier}
                    onChangeText={setMultiplier}
                    placeholderTextColor={inputPlaceholderColor}
                    keyboardType="decimal-pad" // Allow decimals
                />
                <ThemedText style={styles.hintText}>
                    O prazo final será a Duração x Multiplicador. (Ex: 1.1, 1.25, 1.5, 2)
                </ThemedText>


                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: saveButtonBg }]}
                    onPress={handleSaveChallenge}
                    disabled={isLoading} // Disable button while loading
                >
                    {isLoading ? (
                        <ActivityIndicator color={saveButtonTextColor} />
                    ) : (
                        <Text style={[styles.saveButtonText, { color: saveButtonTextColor }]}>
                            Salvar Desafio
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1, // Take full screen
    },
    scrollContainer: {
        padding: 20, // Add padding around the form content
    },
    title: {
        marginBottom: 25,
        textAlign: 'center',
        fontSize: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        // ThemedText handles color based on theme
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        borderWidth: 1, // Add subtle border
        borderColor: 'rgba(128, 128, 128, 0.3)', // Semi-transparent grey border
        // Background and text color set dynamically
    },
    textArea: {
        height: 100, // Taller for multi-line input
        textAlignVertical: 'top', // Align text to top
        paddingTop: 15, // Adjust padding for multi-line
    },
     hintText: {
        fontSize: 12,
        color: '#888', // Use a fixed grey or adapt based on theme
        marginBottom: 20,
        marginTop: -10, // Pull closer to the input above
    },
    saveButton: {
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        // Background color set dynamically
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        // Color set dynamically
    },
});