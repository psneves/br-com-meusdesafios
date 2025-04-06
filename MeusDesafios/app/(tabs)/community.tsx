/**
 * community.tsx
 *
 * Displays the community leaderboard, allowing users to filter rankings
 * based on active challenges and proximity/area. Shows key performance
 * indicators (KPIs) for each ranked user.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  ImageSourcePropType,
  Alert,
} from 'react-native';

// --- Icon Library Imports (Choose ONE and install/configure) ---
// import { Ionicons } from '@expo/vector-icons';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- Custom Component Imports ---
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// --- Navigation Hook (Example using expo-router) ---
// import { useRouter } from 'expo-router';

// --- Type Definitions ---
interface FilterOption {
  id: string;
  label: string;
}

// Updated KPI order: 1: Sequência, 2: Desafios, 3: Pontos
interface LeaderboardUser {
  id: string;
  rank: number;
  name: string; // Keep name for potential future use or tooltips
  username: string; // Added username field
  // KPI 1: Sequência (Streak)
  kpi1Label: 'Sequência';
  kpi1Value: string | number;
  // KPI 2: Pontos (Points)
  kpi2Label: 'Pontos';
  kpi2Value: string | number;
  // Optional: Add profile image URL
  // profileImageUrl?: string;
}

// --- Placeholder Data (Replace with API calls) ---

// Available challenges for filtering
const challengeFilterOptions: FilterOption[] = [
  { id: 'all', label: 'Todos Desafios' },
  { id: 'run', label: 'Correr 5km' },
  { id: 'meditate', label: 'Meditar 20min' },
  { id: 'read', label: 'Ler 10 Páginas' },
];

// Area/Distance filters
const areaFilterOptions: FilterOption[] = [
  { id: 'all', label: 'Global' },
  { id: '50km', label: 'Até 50km' },
  { id: '100km', label: 'Até 100km' },
  { id: '200km', label: 'Até 200km' },
  { id: '500km', label: 'Até 500km' },
  { id: '500+km', label: '500km+' },
];

// Function to simulate fetching leaderboard data based on filters
const fetchLeaderboardData = async (
  challengeFilter: string,
  areaFilter: string
): Promise<LeaderboardUser[]> => {
  console.log(`Fetching leaderboard for: Challenge=${challengeFilter}, Area=${areaFilter}`);
  await new Promise(resolve => setTimeout(resolve, 800));

  // --- TODO: Replace with actual API call ---

  // Return mock data with UPDATED KPI ORDER and added username
  let mockData: Omit<LeaderboardUser, 'rank'>[] = [
    { id: '1', name: 'Maria Oliveira', username: 'maria_o', kpi1Label: 'Sequência', kpi1Value: '15d 🔥', kpi2Label: 'Pontos', kpi2Value: 1580 },
    { id: '2', name: 'João Pereira', username: 'pereira', kpi1Label: 'Sequência', kpi1Value: '12d 🔥', kpi2Label: 'Pontos', kpi2Value: 1420 },
    { id: '3', name: 'Ana Silva', username: 'ana_silva', kpi1Label: 'Sequência', kpi1Value: '8d 🔥', kpi2Label: 'Pontos', kpi2Value: 1350 },
    { id: '4', name: 'Carlos Souza', username: 'carlos_souza', kpi1Label: 'Sequência', kpi1Value: '5d 🔥', kpi2Label: 'Pontos', kpi2Value: 1100 },
    { id: '5', name: 'Jéssica Neves', username: 'jess_neves', kpi1Label: 'Sequência', kpi1Value: '3d 🔥', kpi2Label: 'Pontos', kpi2Value: 950 },
    { id: '6', name: 'Paulo Neves', username: 'psneves', kpi1Label: 'Sequência', kpi1Value: '2d 🔥', kpi2Label: 'Pontos', kpi2Value: 800 },
  ];

  // Simple filtering simulation
  if (challengeFilter !== 'all') {
    mockData = mockData.filter((_, index) => index % 2 === (challengeFilter === 'run' ? 0 : 1));
  }
   if (areaFilter !== 'all' && areaFilter !== 'Global') {
     mockData = mockData.slice(0, Math.max(1, 6 - parseInt(areaFilter) / 100));
   }

  // Assign ranks after filtering
  return mockData.map((user, index) => ({ ...user, rank: index + 1 }));
};

// --- Asset Imports ---
const headerImageSource: ImageSourcePropType = require('@/assets/images/comunidade-header.png'); // ** Replace with your actual header image **

// --- Main Screen Component ---
export default function CommunityScreen() {
  // --- State ---
  const [selectedChallengeFilter, setSelectedChallengeFilter] = useState<string>(challengeFilterOptions[0].id);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>(areaFilterOptions[0].id);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // --- Navigation ---
  // const router = useRouter();

  // --- Data Fetching Effect ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeaderboardData(selectedChallengeFilter, selectedAreaFilter);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
        Alert.alert("Erro", "Não foi possível carregar o ranking. Tente novamente.");
        setLeaderboardData([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedChallengeFilter, selectedAreaFilter]);

  // --- Render Item Function for FlatList ---
  // Renders a single row in the leaderboard.
  const renderLeaderboardItem = ({ item }: { item: LeaderboardUser }) => (
    <View style={styles.leaderboardItem}>
      <ThemedText style={styles.rankText}>{item.rank}.</ThemedText>
      {/* Display @username instead of full name */}
      <ThemedText style={styles.usernameText} numberOfLines={1}>
        @{item.username || 'usuário'} {/* Fallback if username is missing */}
      </ThemedText>
      {/* Display the 3 KPIs */}
      <View style={styles.kpiContainer}>
        {/* KPI 1: Pontos */}
        <View style={styles.kpiItem}>
          <ThemedText style={styles.kpiValue}>{item.kpi2Value}</ThemedText>
          <ThemedText style={styles.kpiLabel}>{item.kpi2Label}</ThemedText>
        </View>
        {/* KPI 2: Sequência */}
        <View style={styles.kpiItem}>
          <ThemedText style={styles.kpiValue}>{item.kpi1Value}</ThemedText>
          <ThemedText style={styles.kpiLabel}>{item.kpi1Label}</ThemedText>
        </View>
      </View>
    </View>
  );

  // --- Render Logic ---
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#BBDEFB', dark: '#0D47A1' }}
      headerImage={
        <Image
          source={headerImageSource}
          style={styles.headerImage}
          resizeMode="cover"
        />
      }>
      {/* Screen Title */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.pageTitle}>Comunidade</ThemedText>
      </ThemedView>

      {/* --- Filter Section --- */}
      <ThemedView style={styles.filterSection}>
        {/* Challenge Filter */}
        <View style={styles.filterGroup}>
          <ThemedText style={styles.filterLabel}>Filtrar por Desafio:</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollViewContent}>
            {challengeFilterOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterButton,
                  selectedChallengeFilter === option.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedChallengeFilter(option.id)}
                disabled={isLoading}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    selectedChallengeFilter === option.id && styles.filterButtonTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Area/Distance Filter */}
        <View style={styles.filterGroup}>
          <ThemedText style={styles.filterLabel}>Filtrar por Proximidade/Raio:</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollViewContent}>
            {areaFilterOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterButton,
                  selectedAreaFilter === option.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedAreaFilter(option.id)}
                disabled={isLoading}
              >
                <ThemedText
                  style={[
                    styles.filterButtonText,
                    selectedAreaFilter === option.id && styles.filterButtonTextActive,
                  ]}
                >
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ThemedView>

      {/* --- Leaderboard Section --- */}
      <ThemedView style={styles.leaderboardSection}>
        <ThemedText type="subtitle" style={styles.leaderboardTitle}>Ranking</ThemedText>
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={leaderboardData}
            renderItem={renderLeaderboardItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
                <ThemedText style={styles.emptyListText}>Nenhum resultado encontrado para estes filtros.</ThemedText>
            }
          />
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  // --- Header, Title Styles ---
  headerImage: { width: '100%', height: 250 },
  titleContainer: { paddingHorizontal: 16, paddingTop: 10, marginBottom: 5 },
  pageTitle: { color: '#FFF' }, // Explicitly white title

  // --- Filter Section Styles ---
  filterSection: { paddingHorizontal: 16, marginBottom: 20, backgroundColor: '#f8f8f8', paddingVertical: 10, borderRadius: 8, marginHorizontal: 16 },
  filterGroup: { marginBottom: 10 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  filterScrollViewContent: { paddingRight: 10 },
  filterButton: { backgroundColor: '#e0e0e0', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginRight: 8, borderWidth: 1, borderColor: '#ccc' },
  filterButtonActive: { backgroundColor: '#007AFF', borderColor: '#0056b3' },
  filterButtonText: { fontSize: 13, color: '#444', fontWeight: '500' },
  filterButtonTextActive: { color: '#FFFFFF' },

  // --- Leaderboard Section Styles ---
  leaderboardSection: { paddingHorizontal: 16, marginBottom: 20 },
  leaderboardTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 15 }, // Explicitly white title
  loadingIndicator: { marginTop: 30 },
  emptyListText: { textAlign: 'center', marginTop: 30, fontSize: 15, color: '#BBB' }, // Lighter color for empty text on potentially dark bg
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(238, 238, 238, 0.5)', // Lighter separator for dark bg
  },
  rankText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DDD', // Lighter grey for rank
    width: 35,
  },
  usernameText: { // Renamed from nameText
    flex: 1, // Allow username to take available space
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF', // Explicitly white username
    marginRight: 8, // Reduced margin slightly
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12, // Reduced gap slightly
  },
  kpiItem: {
    alignItems: 'flex-end',
    minWidth: 50, // Reduced minWidth slightly
  },
  kpiValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#87CEFA', // Light Sky Blue for KPI value contrast on dark
  },
  kpiLabel: {
    fontSize: 10,
    color: '#BBB', // Lighter grey for KPI label
    marginTop: 2,
  },
});