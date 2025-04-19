/**
 * challenge-assign.tsx
 *
 * Screen component for assigning a new challenge from a list.
 * Provides a searchable list of challenges and a button to assign the selected challenge.
 * Theme-aware styling.
 */
import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    useColorScheme,
    Text, // Using standard Text for button
    TextInput, // Added for search functionality
} from 'react-native';

// --- Custom Component Imports ---
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// --- Navigation Hook (Example) ---
// import { useRouter } from 'expo-router';

// --- Type Definition for Challenge ---
interface Challenge {
    id: string;
    title: string;
    description: string;
    // Add other relevant fields if needed, e.g., default duration
}

// --- Mock Challenge Data (Replace with API call later) ---
const mockChallenges: Challenge[] = [
    { id: 'run_5k_30d', title: 'Correr 5km por 30 dias', description: 'Complete uma corrida de 5km diariamente.' },
    { id: 'meditate_20m_21d', title: 'Meditar 20min por 21 dias', description: 'Dedique 20 minutos para meditação focada.' },
    { id: 'read_10p_90d', title: 'Ler 10 páginas por 90 dias', description: 'Leia no mínimo 10 páginas de um livro.' },
    { id: 'pushups_30_15d', title: 'Fazer 30 flexões por 15 dias', description: 'Complete 30 flexões diariamente.' },
    { id: 'write_500w_7d', title: 'Escrever 500 palavras por 7 dias', description: 'Escreva um texto com pelo menos 500 palavras.' },
    { id: 'no_sugar_14d', title: 'Sem Açúcar por 14 dias', description: 'Evite alimentos e bebidas com açúcar adicionado.' },
    { id: 'wake_early_30d', title: 'Acordar às 6h por 30 dias', description: 'Levante-se às 6 da manhã todos os dias.' },
    // Add more challenges as needed
];

export default function AssignChallengeScreen() {
    // --- Theme Hook ---
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    // --- State ---
    const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
    const [searchText, setSearchText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Navigation ---
    // const router = useRouter();

    // --- Filtering Logic ---
    const filteredChallenges = useMemo(() => {
        if (!searchText.trim()) {
            return mockChallenges; // Return all if search is empty
        }
        const lowerCaseSearch = searchText.toLowerCase();
        return mockChallenges.filter(challenge =>
            challenge.title.toLowerCase().includes(lowerCaseSearch) ||
            challenge.description.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchText]); // Recalculate only when searchText changes

    // --- Handlers ---
    const handleAssignChallenge = () => {
        if (!selectedChallenge) {
            Alert.alert('Nenhum Desafio Selecionado', 'Por favor, selecione um desafio da lista para atribuir.');
            return;
        }

        setIsLoading(true);
        console.log('Assigning Challenge:', selectedChallenge);

        // --- TODO: Backend Integration ---
        // 1. Send API request to assign the selectedChallenge.id to the current user.
        // 2. Handle API response (success/error).
        // 3. On success, navigate back or show a success message and clear selection.
        // Example:
        // try {
        //   await api.assignChallenge(selectedChallenge.id);
        //   Alert.alert('Sucesso', `Desafio "${selectedChallenge.title}" atribuído!`);
        //   setSelectedChallenge(null); // Clear selection
        //   setSearchText(''); // Clear search
        //   // router.back(); // Go back
        // } catch (error) {
        //   Alert.alert('Erro', 'Não foi possível atribuir o desafio.');
        // } finally {
        //   setIsLoading(false);
        // }
        // ---------------------------------

        // Placeholder success
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Sucesso (Placeholder)', `Desafio "${selectedChallenge.title}" atribuído!`);
            setSelectedChallenge(null); // Clear selection after assigning
            setSearchText(''); // Optionally clear search text
            // router.back(); // Navigate back
        }, 1000);
    };

    // --- Render Item for FlatList ---
    const renderChallengeItem = ({ item }: { item: Challenge }) => {
        const isSelected = selectedChallenge?.id === item.id;
        // Dynamic background for selected item based on theme
        const itemBackgroundColor = isSelected
            ? (isDarkMode ? 'rgba(10, 132, 255, 0.3)' : 'rgba(0, 122, 255, 0.1)') // Subtle blue highlight
            : 'transparent';
        const itemBorderColor = isSelected
            ? (isDarkMode ? '#0A84FF' : '#007AFF') // Blue border when selected
            : (isDarkMode ? '#48484A' : '#E0E0E0'); // Default border

        return (
            <TouchableOpacity
                onPress={() => setSelectedChallenge(item)}
                style={[
                    styles.challengeItem,
                    { backgroundColor: itemBackgroundColor, borderColor: itemBorderColor }
                ]}
                activeOpacity={0.7}
            >
                <ThemedText style={styles.challengeTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.challengeDescription}>{item.description}</ThemedText>
            </TouchableOpacity>
        );
    };

    // --- Dynamic Styles ---
    const inputBackgroundColor = isDarkMode ? '#3A3A3C' : '#F2F2F7';
    const inputTextColor = isDarkMode ? '#FFFFFF' : '#000000';
    const inputPlaceholderColor = isDarkMode ? '#8E8E93' : '#C7C7CD';
    const assignButtonBg = isDarkMode ? '#34C759' : '#28a745'; // Green for assign/confirm
    const assignButtonTextColor = '#FFFFFF';
    const listSeparatorColor = isDarkMode ? '#48484A' : '#eee';

    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>Novo Desafio</ThemedText>

            {/* Search Bar */}
            <TextInput
                style={[
                    styles.searchBar,
                    { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: listSeparatorColor }
                ]}
                placeholder="Buscar desafios por título ou descrição..."
                placeholderTextColor={inputPlaceholderColor}
                value={searchText}
                onChangeText={setSearchText}
                clearButtonMode="while-editing" // iOS clear button
            />

            {/* Challenge List */}
            <FlatList
                data={filteredChallenges}
                renderItem={renderChallengeItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: listSeparatorColor }]} />}
                ListEmptyComponent={
                    <ThemedText style={styles.emptyListText}>Nenhum desafio encontrado.</ThemedText>
                }
            />

            {/* Assign Button Area */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.assignButton,
                        { backgroundColor: assignButtonBg },
                        (!selectedChallenge || isLoading) && styles.disabledButton // Style for disabled state
                    ]}
                    onPress={handleAssignChallenge}
                    disabled={!selectedChallenge || isLoading} // Disable if loading or no challenge selected
                >
                    {isLoading ? (
                        <ActivityIndicator color={assignButtonTextColor} />
                    ) : (
                        <Text style={[styles.assignButtonText, { color: assignButtonTextColor }]}>
                            {selectedChallenge ? `Adicionar "${selectedChallenge.title}"` : 'Selecione um Desafio'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        // ThemedView handles background color
    },
    title: {
        paddingHorizontal: 20,
        paddingTop: 20, // Add some top padding
        paddingBottom: 15,
        textAlign: 'center',
        fontSize: 24,
        // ThemedText handles color
    },
    searchBar: {
        height: 45, // Slightly taller
        borderRadius: 10, // More rounded
        paddingHorizontal: 15,
        marginHorizontal: 20, // Add horizontal margin
        marginBottom: 15, // Space below search bar
        fontSize: 16,
        borderWidth: 1,
        // Background, text, and border color set dynamically
    },
    listContent: {
        paddingHorizontal: 20, // Padding for the list items
        paddingBottom: 80, // Ensure space for the button at the bottom
    },
    challengeItem: {
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderWidth: 1.5, // Slightly thicker border for selection emphasis
        borderRadius: 8,
        marginBottom: 10, // Use margin instead of separator for spacing
        // Background and border color set dynamically based on selection/theme
    },
    challengeTitle: {
        fontSize: 16,
        fontWeight: '600', // Semi-bold title
        marginBottom: 5,
        // ThemedText handles color
    },
    challengeDescription: {
        fontSize: 14,
        // ThemedText handles color, potentially use a secondary color
        color: '#666', // Example fixed color, or use theme color
    },
    separator: {
        height: 1,
        // Background color set dynamically
        // Note: This is used if ItemSeparatorComponent is preferred over marginBottom on items
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        fontStyle: 'italic',
        // ThemedText handles color, potentially use a muted color
        color: '#888', // Example fixed color
    },
    buttonContainer: {
        padding: 20, // Padding around the button
        borderTopWidth: 1, // Separator line above button area
        borderTopColor: 'rgba(128, 128, 128, 0.2)', // Subtle separator
        // Use ThemedView's background or set explicitly if needed
        position: 'absolute', // Make button stick to bottom
        bottom: 0,
        left: 0,
        right: 0,
        // Background color should match ThemedView or be set explicitly for theme
    },
    assignButton: {
        paddingVertical: 16,
        borderRadius: 12, // More rounded button
        alignItems: 'center',
        justifyContent: 'center',
        // Background color set dynamically
        // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    assignButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        // Color set dynamically
    },
    disabledButton: {
        opacity: 0.5, // Make button look faded when disabled
        backgroundColor: '#a0a0a0', // Use a grey background when disabled (adjust for theme)
    },
});