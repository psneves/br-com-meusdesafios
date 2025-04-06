/**
 * index.tsx
 *
 * Desafios Screen: Displays user performance KPIs, active challenges,
 * daily progress tracking, full visible history (scrollable), deadlines,
 * and actions to find or create new challenges.
 * Theme-aware styling.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ImageSourcePropType,
  ScrollView,
  useColorScheme,
  SafeAreaView,
  Text, // Using standard Text for the new button
} from 'react-native';

// --- Icon Library Imports ---
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons for KPIs and FAB

// --- Custom Component Imports ---
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router'; // Import router for navigation
import { Colors } from '@/constants/Colors'; // Import Colors for theme access

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

// --- Initial Static Challenge Data (Keep existing data) ---
const initialChallengesData: ChallengeData[] = [
  {
    id: 'run',
    title: 'Correr 5km por 30 dias',
    description: 'Complete uma corrida de 5km diariamente.',
    goalDuration: 30,
    currentProgress: 12,
    unit: 'dias',
    startDate: '2024-07-20T00:00:00.000Z',
    deadlineMultiplier: 1.5,
    history: [false, false, true, true, false, true, true, false, true, true],
  },
  {
    id: 'meditate',
    title: 'Meditar 20min por 21 dias',
    description: 'Dedique 20 minutos para meditação focada.',
    goalDuration: 21,
    currentProgress: 18,
    unit: 'dias',
    startDate: '2024-07-15T00:00:00.000Z',
    deadlineMultiplier: 2,
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
    deadlineMultiplier: 1.25,
    history: [false, true, true, true, true, false, true, true, true, false],
  },
];

// --- Mock User Stats Data (Similar to profile.tsx) ---
// TODO: Replace with dynamic data fetching
const userStats = {
  totalPoints: 250,
  currentStreak: 8, // days
  challengesCompleted: 12,
};

// --- Asset Imports ---
const headerImageSource: ImageSourcePropType = require('@/assets/images/desafios-header.png'); // ** Replace **

// --- Main Screen Component ---
export default function DesafiosScreen() {
  // --- Theme Hook ---
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme]; // Get theme colors

  // --- State ---
  const [challengeHistory, setChallengeHistory] = useState<{ [key: string]: (boolean | null)[] }>(
    initialChallengesData.reduce((acc, challenge) => {
      acc[challenge.id] = challenge.history;
      return acc;
    }, {} as { [key: string]: (boolean | null)[] })
  );

  // --- Callbacks ---
  const handleToggleDayCompletion = useCallback((challengeId: string, dayIndex: number) => {
    setChallengeHistory(prevHistory => {
      const currentChallengeHist = prevHistory[challengeId] ? [...prevHistory[challengeId]] : [];
      if (dayIndex < 0 || dayIndex >= currentChallengeHist.length) return prevHistory;
      const currentStatus = currentChallengeHist[dayIndex];
      const newStatus = currentStatus === null ? false : !currentStatus;
      currentChallengeHist[dayIndex] = newStatus;
      console.log(`PERSISTENCE: Challenge ${challengeId}, Day Index ${dayIndex} status updated to ${newStatus}`);
      Alert.alert('Progresso Salvo!', `Status do dia ${dayIndex === 0 ? 'de hoje' : `${dayIndex} dia(s) atrás`} atualizado.`);
      return { ...prevHistory, [challengeId]: currentChallengeHist };
    });
  }, []);

  // Handler for navigating to the Assign Challenge screen
  const handleNavigateToFindChallenges = () => {
    console.log("NAVIGATION: Navigate to Find/Assign Challenges Screen");
    router.push('/challenge-assign'); // Navigate to the assignment screen
  };

  // Handler for navigating to the Create Challenge screen
  const handleNavigateToCreateChallenge = () => {
    console.log("NAVIGATION: Navigate to Create Challenge Screen");
    router.push('/challenge-create'); // Navigate to the creation screen
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
  const createButtonBgColor = isDarkMode ? '#0A84FF' : '#007AFF'; // Use theme tint for create button
  const createButtonTextColor = '#FFFFFF'; // White text on primary color

  // --- Render Logic ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image source={headerImageSource} style={styles.headerImage} resizeMode="cover" />
        }>


        {/* --- User Performance KPI Section --- */}
        <ThemedView style={styles.contentBlock}>
          <ThemedView style={[
            styles.statsContainer,
            {
              backgroundColor: themeColors.card, // Use theme card color
              borderColor: themeColors.border,   // Use theme border color
            }
          ]}>
            {/* KPI 1: Pontos */}
            <View style={styles.statItem}>
              <ThemedText type="title" style={[styles.statValue, { color: themeColors.text }]}>
                {userStats.totalPoints} <ThemedText style={[styles.statUnit, { color: themeColors.text }]}>pontos</ThemedText>
              </ThemedText>
              <View style={styles.labelContainer}>
                <Ionicons name="star-outline" size={16} color={themeColors.icon} style={styles.statIcon} />
                <ThemedText style={[styles.statLabel, { color: themeColors.textSecondary }]}>Pontos</ThemedText>
              </View>
            </View>

            {/* KPI 2: Sequência */}
            <View style={styles.statItem}>
              <ThemedText type="title" style={[styles.statValue, { color: themeColors.text }]}>
                {userStats.currentStreak} <ThemedText style={[styles.statUnit, { color: themeColors.text }]}>dias</ThemedText>
              </ThemedText>
              <View style={styles.labelContainer}>
                <Ionicons name="flame-outline" size={16} color={themeColors.icon} style={styles.statIcon} />
                <ThemedText style={[styles.statLabel, { color: themeColors.textSecondary }]}>Sequência</ThemedText>
              </View>
            </View>

            {/* KPI 3: Desafios Concluídos */}
            <View style={styles.statItem}>
              <ThemedText type="title" style={[styles.statValue, { color: themeColors.text }]}>
                {userStats.challengesCompleted} <ThemedText style={[styles.statUnit, { color: themeColors.text }]}>desafios</ThemedText>
              </ThemedText>
              <View style={styles.labelContainer}>
                <Ionicons name="trophy-outline" size={16} color={themeColors.icon} style={styles.statIcon} />
                <ThemedText style={[styles.statLabel, { color: themeColors.textSecondary }]}>Concluídos</ThemedText>
              </View>
            </View>
          </ThemedView>
        </ThemedView>
        {/* Screen Title */}
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={[styles.pageTitle, { color: primaryTextColor }]}>
            Meus Desafios
          </ThemedText>
        </View>
        {
          /* --- Create New Challenge Button --- 
          <ThemedView style={[styles.contentBlock, styles.createButtonContainer]}>
              <TouchableOpacity
                  onPress={handleNavigateToCreateChallenge}
                  style={[styles.createButton, { backgroundColor: createButtonBgColor }]}
                  accessibilityLabel="Criar novo desafio personalizado"
                  accessibilityRole="button"
              >
                  <Ionicons name="add-circle-outline" size={20} color={createButtonTextColor} style={styles.buttonIcon} />
                  <Text style={[styles.createButtonText, { color: createButtonTextColor }]}>Criar Novo Desafio</Text>
              </TouchableOpacity>
          </ThemedView>
          */
        }
        {/* --- Active Challenges Section Title --- */}
       

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
                <ThemedText type="subtitle" style={[styles.challengeTitle, { color: primaryTextColor }]}>{staticData.title}</ThemedText>
                <ThemedText style={[styles.challengeDescription, { color: secondaryTextColor }]}>{staticData.description}</ThemedText>
                <View style={styles.metadataContainer}>
                  <ThemedText style={[styles.challengeProgress, { color: primaryTextColor }]}>Progresso: {staticData.currentProgress} / {staticData.goalDuration} {staticData.unit}</ThemedText>
                  <ThemedText style={[styles.challengeStartDate, { color: tertiaryTextColor }]}>Iniciado há {daysAgo} {daysAgo === 1 ? 'dia' : 'dias'}</ThemedText>
                </View>
                <View style={styles.deadlineContainer}>
                  <ThemedText style={[styles.challengeDeadline, { color: tertiaryTextColor }]}>Prazo: {formattedDeadline}</ThemedText>
                </View>
              </View>

              {/* Section: History Visualization & Interaction */}
              <View style={[styles.historyContainer, { borderTopColor: separatorColor }]}>
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
                            {dayStatus === true && (<ThemedText style={styles.historyDotCheckmark}>✓</ThemedText>)}
                            {dayStatus === false && (<ThemedText style={styles.historyDotMissedMark}>✕</ThemedText>)}
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

      {/* Floating Action Button (FAB) for Finding/Assigning Challenges */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: fabBackgroundColor }]}
        onPress={handleNavigateToFindChallenges} // Navigate to assign screen
        activeOpacity={0.8}
        accessibilityLabel="Encontrar novos desafios"
      >
        <Ionicons name="search-outline" size={28} color={fabIconColor} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerImage: { width: '100%', height: 250 },
  titleContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    marginBottom: 5, // Reduced margin
  },
  pageTitle: {
    // Color set dynamically
  },
  // Content Block Styles (Copied from profile.tsx)
  contentBlock: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
    // Color from ThemedText
  },
  // Stats Styles (Copied from profile.tsx)
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    // Background and border color set dynamically via themeColors
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5,
  },
  statValue: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    // Color set dynamically via themeColors
  },
  labelContainer: { // Container for icon + label
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statIcon: {
    marginRight: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    // Color set dynamically via themeColors
  },
  statUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    // Color set dynamically via themeColors
  },
  // Create Button Styles
  createButtonContainer: {
    paddingVertical: 0, // Reduce vertical padding
    marginTop: -5, // Pull closer to KPIs
    marginBottom: 15, // Space before challenge list title
  },
  createButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    // Background color set dynamically
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // Color set dynamically
  },
  buttonIcon: {
    marginRight: 8,
  },
  // Challenge Card Styles (Keep existing)
  challengeCard: { borderRadius: 12, padding: 15, marginBottom: 16, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  challengeInfo: { marginBottom: 15 },
  challengeTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  challengeDescription: { fontSize: 14, marginBottom: 10 },
  metadataContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  challengeProgress: { fontSize: 13, fontWeight: '500' },
  challengeStartDate: { fontSize: 12, fontStyle: 'italic' },
  deadlineContainer: { marginTop: 6 },
  challengeDeadline: { fontSize: 12, fontStyle: 'italic' },

  // History Section Styles (Keep existing)
  historyContainer: { marginTop: 15, paddingTop: 5, borderTopWidth: 1 },
  historyDotsScrollViewContent: { paddingVertical: 10, paddingHorizontal: 2 },
  historyDotsContainer: { flexDirection: 'row', gap: 12 },
  historyDayItem: { alignItems: 'center', width: 45 },
  historyDotTouchable: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 4 },
  historyDotCompleted: { backgroundColor: '#34C759', borderColor: '#28a745' },
  historyDotMissed: { backgroundColor: '#FF3B30', borderColor: '#dc3545' },
  historyDotCheckmark: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  historyDotMissedMark: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 20 },
  historyDateText: { fontSize: 11, textAlign: 'center' },

  // FAB Styles (Keep existing, updated icon)
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
  // Padding at the bottom of the scroll view content
  scrollPaddingBottom: {
    height: 80, // Ensure content scrolls above FAB
  },
});

// --- Helper Functions Implementation (Keep existing implementations) ---
function calculateDaysAgo(startDateString: string): number {
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

function formatDate(date: Date): string {
  try {
    const day = date.toLocaleDateString('pt-BR', { day: '2-digit' });
    const month = date.toLocaleDateString('pt-BR', { month: 'short' })
      .replace('.', '').replace(/^\w/, (c) => c.toUpperCase());
    return `${day}-${month}`;
  } catch (error) { console.error("Error formatting date:", error); return '??-???'; }
};

function calculateDeadlineDate(startDateString: string, goalDuration: number, multiplier: number): Date | null {
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