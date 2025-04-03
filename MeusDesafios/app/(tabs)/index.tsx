/**
 * index.tsx
 *
 * Desafios Screen: Displays active challenges, daily progress tracking,
 * full visible history (scrollable), deadlines, and navigation to create new challenges.
 * Theme-aware styling.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ImageSourcePropType,
  ScrollView,
  useColorScheme, // Import useColorScheme
  SafeAreaView, // Import SafeAreaView
} from 'react-native';

// --- Icon Library Imports ---
import { Ionicons } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Custom Component Imports ---
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// --- Navigation Hook ---
// import { useRouter } from 'expo-router';

// --- Type Definition for Challenge Data ---
interface ChallengeData {
  id: string;
  title: string;
  description: string;
  goalDuration: number; // The target number of days to perform the activity
  currentProgress: number;
  unit: string;
  startDate: string; // ISO 8601 Date string
  deadlineMultiplier: number; // e.g., 2 (for 2x duration), 1.5, 1.333, 1.25, 1.1
  history: (boolean | null)[]; // Full history to display. Index 0 is Today.
}

// --- Helper Functions ---

/** Calculates days passed since start date. */
const calculateDaysAgo = (startDateString: string): number => {
  try {
    const startDate = new Date(startDateString);
    const today = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);
    const differenceInTime = today.getTime() - startDate.getTime();
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
    return Math.max(0, differenceInDays);
  } catch (error) { console.error("Error calculating days ago:", error); return 0; }
};

/** Formats date as "DD-Mês" (e.g., "02-Abr"). */
const formatDate = (date: Date): string => {
  try {
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = date.toLocaleDateString('pt-BR', { month: 'short' })
                      .replace('.', '').replace(/^\w/, (c) => c.toUpperCase());
    return `${day}-${month}`;
  } catch (error) { console.error("Error formatting date:", error); return '??-???'; }
};

/** Calculates the deadline date based on start date, duration, and multiplier. */
const calculateDeadlineDate = (startDateString: string, goalDuration: number, multiplier: number): Date | null => {
    try {
        const startDate = new Date(startDateString);
        const totalAllowedDays = Math.ceil(goalDuration * multiplier); // Calculate total days allowed
        const deadlineDate = new Date(startDate);
        deadlineDate.setDate(startDate.getDate() + totalAllowedDays - 1); // Add allowed days (minus 1 as start day counts)
        return deadlineDate;
    } catch (error) {
        console.error("Error calculating deadline date:", error);
        return null;
    }
};

// --- Initial Static Challenge Data (with deadlineMultiplier) ---
const initialChallengesData: ChallengeData[] = [
  {
    id: 'run',
    title: 'Correr 5km por 30 dias',
    description: 'Complete uma corrida de 5km diariamente.',
    goalDuration: 30,
    currentProgress: 12,
    unit: 'dias',
    startDate: '2024-07-20T00:00:00.000Z',
    deadlineMultiplier: 1.5, // Example: 30 * 1.5 = 45 days total allowed
    history: [false, false, true, true, false, true, true, false, true, true], // Example longer history
  },
  {
    id: 'meditate',
    title: 'Meditar 20min por 21 dias',
    description: 'Dedique 20 minutos para meditação focada.',
    goalDuration: 21,
    currentProgress: 18,
    unit: 'dias',
    startDate: '2024-07-15T00:00:00.000Z',
    deadlineMultiplier: 2, // Example: 21 * 2 = 42 days total allowed
    history: [true, true, true, false, true, true, true, true, false, true, true],
  },
  {
    id: 'read',
    title: 'Ler 10 páginas por 90 dias',
    description: 'Leia no mínimo 10 páginas de um livro.',
    goalDuration: 90,
    currentProgress: 45,
    unit: 'dias',
    startDate: '2024-06-01T00:00:00.000Z',
    deadlineMultiplier: 1.25, // Example: 90 * 1.25 = 112.5 -> 113 days allowed
    history: [false, true, true, true, true, false, true, true, true, false],
  },
];

// --- Asset Imports ---
const headerImageSource: ImageSourcePropType = require('@/assets/images/desafios-header.png');

// --- Main Screen Component ---
export default function DesafiosScreen() {
  // --- Theme Hook ---
  const colorScheme = useColorScheme();

  // --- State ---
  const [challengeHistory, setChallengeHistory] = useState<{ [key: string]: (boolean | null)[] }>(
    initialChallengesData.reduce((acc, challenge) => {
      acc[challenge.id] = challenge.history;
      return acc;
    }, {} as { [key: string]: (boolean | null)[] })
  );

  // --- Navigation ---
  // const router = useRouter();

  // --- Callbacks ---
  const handleToggleDayCompletion = useCallback((challengeId: string, dayIndex: number) => {
    setChallengeHistory(prevHistory => {
      const currentChallengeHist = prevHistory[challengeId] ? [...prevHistory[challengeId]] : [];
      if (dayIndex < 0 || dayIndex >= currentChallengeHist.length) return prevHistory;
      const currentStatus = currentChallengeHist[dayIndex];
      const newStatus = currentStatus === null ? false : !currentStatus;
      currentChallengeHist[dayIndex] = newStatus;
      // --- TODO: Backend Integration ---
      console.log(`PERSISTENCE: Challenge ${challengeId}, Day Index ${dayIndex} status updated to ${newStatus}`);
      Alert.alert('Progresso Salvo!', `Status do dia ${dayIndex === 0 ? 'de hoje' : `${dayIndex} dia(s) atrás`} atualizado.`);
      return { ...prevHistory, [challengeId]: currentChallengeHist };
    });
  }, []);

  const handleNavigateToCreate = () => {
      console.log("NAVIGATION: Navigate to Create Challenge Screen");
      Alert.alert("Navegação (Placeholder)", "Ir para a tela de criação de desafio.");
      // --- TODO: Navigation Implementation ---
      // Example: router.push('/create-challenge');
  };

  // --- Helper to get static data ---
  const getChallengeStaticData = (id: string): ChallengeData | undefined => {
    return initialChallengesData.find(c => c.id === id);
  };

  // --- Dynamic Styles based on Theme ---
  const isDarkMode = colorScheme === 'dark';
  const cardBackgroundColor = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const primaryTextColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';
  const secondaryTextColor = isDarkMode ? '#EBEBF5' : '#555555';
  const tertiaryTextColor = isDarkMode ? '#A0A0A0' : '#666666';
  const separatorColor = isDarkMode ? '#48484A' : '#eee';
  const dotDefaultBg = isDarkMode ? '#555' : '#E0E0E0';
  const dotDefaultBorder = isDarkMode ? '#777' : '#d0d0d0';
  const fabBackgroundColor = isDarkMode ? '#0A84FF' : '#007AFF'; // Primary action blue
  const fabIconColor = '#FFFFFF'; // White icon on blue background

  // --- Render Logic ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image source={headerImageSource} style={styles.headerImage} resizeMode="cover" />
        }>
        {/* Screen Title */}
        <View style={[styles.titleContainer, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <ThemedText type="title" style={[styles.pageTitle, { color: primaryTextColor }]}>
            Meus Desafios
          </ThemedText>
          <TouchableOpacity
            style={[styles.headerFab, { backgroundColor: fabBackgroundColor }]}
            onPress={() => Alert.alert("Buscar Desafios", "Ir para tela de descobrir novos desafios.")}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={22} color={fabIconColor} />
          </TouchableOpacity>
        </View>

        {/* Map through challenge IDs */}
        {Object.keys(challengeHistory).map((challengeId) => {
          const staticData = getChallengeStaticData(challengeId);
          const history = challengeHistory[challengeId];
          if (!staticData || !history) return null;

          const daysAgo = useMemo(() => calculateDaysAgo(staticData.startDate), [staticData.startDate]);
          const deadlineDate = useMemo(() => calculateDeadlineDate(staticData.startDate, staticData.goalDuration, staticData.deadlineMultiplier), [staticData.startDate, staticData.goalDuration, staticData.deadlineMultiplier]);
          const formattedDeadline = deadlineDate ? formatDate(deadlineDate) : 'N/A';

          return (
            <View key={challengeId} style={[styles.challengeCard, { backgroundColor: cardBackgroundColor }]}>
              {/* Section: Challenge Information */}
              <View style={styles.challengeInfo}>
                <ThemedText type="subtitle" style={[styles.challengeTitle, { color: primaryTextColor }]}>
                  {staticData.title}
                </ThemedText>
                <ThemedText style={[styles.challengeDescription, { color: secondaryTextColor }]}>
                  {staticData.description}
                </ThemedText>
                <View style={styles.metadataContainer}>
                   <ThemedText style={[styles.challengeProgress, { color: primaryTextColor }]}>
                      Progresso: {staticData.currentProgress} / {staticData.goalDuration} {staticData.unit}
                   </ThemedText>
                   <ThemedText style={[styles.challengeStartDate, { color: tertiaryTextColor }]}>
                      Iniciado há {daysAgo} {daysAgo === 1 ? 'dia' : 'dias'}
                   </ThemedText>
                </View>
                 <View style={styles.deadlineContainer}>
                   <ThemedText style={[styles.challengeDeadline, { color: tertiaryTextColor }]}>
                      Prazo: {formattedDeadline}
                   </ThemedText>
                </View>
              </View>

              {/* Section: History Visualization & Interaction */}
              <View style={[styles.historyContainer, { borderTopColor: separatorColor }]}>
                {/* "Histórico:" Title Removed */}
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.historyDotsScrollViewContent}
                >
                  <View style={styles.historyDotsContainer}>
                    {history.map((dayStatus, index) => {
                      const today = new Date();
                      const targetDate = new Date(today);
                      targetDate.setDate(today.getDate() - index);
                      const dateString = formatDate(targetDate);

                      return (
                        <View key={`${challengeId}-hist-${index}`} style={styles.historyDayItem}>
                          <TouchableOpacity
                            onPress={() => handleToggleDayCompletion(challengeId, index)}
                            activeOpacity={0.7}
                            style={[
                              styles.historyDotTouchable,
                              { backgroundColor: dotDefaultBg, borderColor: dotDefaultBorder },
                              dayStatus === true && styles.historyDotCompleted,
                              dayStatus === false && styles.historyDotMissed,
                            ]}
                          >
                            {dayStatus === true && ( <ThemedText style={styles.historyDotCheckmark}>✓</ThemedText> )}
                            {dayStatus === false && ( <ThemedText style={styles.historyDotMissedMark}>✕</ThemedText> )}
                          </TouchableOpacity>
                          <ThemedText style={[styles.historyDateText, { color: tertiaryTextColor }]}>
                              {dateString}
                          </ThemedText>
                        </View>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            </View>
          );
        })}
        {/* Add some padding at the bottom of the scroll content to prevent FAB overlap */}
        <View style={styles.scrollPaddingBottom} />
      </ParallaxScrollView>

      {/* Floating Action Button (FAB) for Creating Challenge */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: fabBackgroundColor }]}
        onPress={handleNavigateToCreate}
        activeOpacity={0.8}
      >
        {/* Use an Icon component here */}
        <Ionicons name="add" size={28} color={fabIconColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Set a default background or use theme
    // Note: ThemedView could potentially be used here if needed globally
  },
  headerImage: { width: '100%', height: 250 },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 15,
  },
  pageTitle: {
    // Color set dynamically
  },
  // Challenge Card Styles
  challengeCard: { borderRadius: 12, padding: 15, marginBottom: 16, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  challengeInfo: { marginBottom: 15 },
  challengeTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  challengeDescription: { fontSize: 14, marginBottom: 10 },
  metadataContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  challengeProgress: { fontSize: 13, fontWeight: '500' },
  challengeStartDate: { fontSize: 12, fontStyle: 'italic' },
  deadlineContainer: { marginTop: 6 },
  challengeDeadline: { fontSize: 12, fontStyle: 'italic' },

  // History Section Styles
  historyContainer: {
      marginTop: 15, // Increased margin slightly as title is removed
      paddingTop: 5, // Reduced padding as title is removed
      borderTopWidth: 1
      // Border color set dynamically
  },
  // Removed historyTitle style
  historyDotsScrollViewContent: { paddingVertical: 10, paddingHorizontal: 2 }, // Added padding for better spacing
  historyDotsContainer: { flexDirection: 'row', gap: 12 },
  historyDayItem: { alignItems: 'center', width: 45 },
  historyDotTouchable: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 4 },
  historyDotCompleted: { backgroundColor: '#34C759', borderColor: '#28a745' },
  historyDotMissed: { backgroundColor: '#FF3B30', borderColor: '#dc3545' },
  historyDotCheckmark: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  historyDotMissedMark: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  historyDateText: { fontSize: 11, textAlign: 'center' },

  // FAB Styles
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    // Background color set dynamically
  },
  // Removed fabIcon style (was for text '+')

  // Padding at the bottom of the scroll view content
  scrollPaddingBottom: {
      height: 80, // Adjust height to be more than FAB height + bottom margin
  },
});