import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Share, // Import Share API
  Alert, // For feedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Using Ionicons as used elsewhere
import { useRouter } from 'expo-router'; // Import useRouter for navigation

// --- Custom Component Imports ---
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors'; // Assuming Colors constant exists
import { useColorScheme } from '@/hooks/useColorScheme'; // Make sure this is imported

// --- TODO: Replace with dynamic data fetching (API, state management, etc.) ---
const userProfile = {
  name: 'Paulo Neves',
  username: '@psneves', // Main app username
  profileImageUrl: null, // Use null or a default image path initially
  instagramHandle: '@pssneves', // Added Instagram
  tiktokHandle: '@pssneves', // Added TikTok
  stats: {
    challengesCompleted: 12,
    currentStreak: 8, // days
    totalPoints: 250,
    // Consider adding more relevant KPIs if applicable, e.g.:
    // totalDistanceRun: 540, // km
    // totalMeditationMinutes: 1200,
  },
  badges: [
    { id: '1', name: 'Iniciante Consistente', icon: '🔥' },
    { id: '2', name: 'Corredor 100km', icon: '🏃‍♂️' },
    { id: '3', name: 'Mestre da Meditação', icon: '🧘' },
    { id: '4', name: 'Leitor Voraz', icon: '📚' },
    // Add more badges...
  ],
};

// Default profile image if user hasn't uploaded one
const defaultProfileImage = require('@/assets/images/profile.jpeg'); // ** Make sure this default image exists **

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter(); // Use router for navigation

  const handleNavigateToSettings = () => {
    console.log('Navigate to Settings');
    router.push('/settings'); // Navigate to settings screen (ensure '/settings' route exists)
  };

  // --- Share Functionality ---
  const handleShareProfile = async () => {
    try {
      const result = await Share.share({
        message:
          `Confira meu progresso no Meus Desafios!\n` +
          `Desafios Concluídos: ${userProfile.stats.challengesCompleted}\n` +
          `Pontos: ${userProfile.stats.totalPoints}\n` +
          `Junte-se a mim! #MeusDesafiosApp`, // Customize your share message
        // url: 'your_app_link_here', // Optional: Link to your app or website
        title: `Meu Perfil Meus Desafios - ${userProfile.name}`, // Optional: Title for some share targets
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log(`Compartilhado via: ${result.activityType}`);
        } else {
          // Shared
          console.log('Perfil compartilhado com sucesso!');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Compartilhamento cancelado.');
      }
    } catch (error: any) {
      Alert.alert('Erro', `Não foi possível compartilhar: ${error.message}`);
    }
  };

  // --- Dynamic Colors ---
  const isDarkMode = colorScheme === 'dark';
  const themeColors = Colors[colorScheme];
  const headerTextColor = '#FFFFFF'; // Assuming dark header background from ParallaxScrollView
  const headerSecondaryTextColor = '#DDD'; // Assuming dark header background
  const badgeBackgroundColor = themeColors.card;
  const badgeTextColor = themeColors.textSecondary;
  const settingsButtonBgColor = themeColors.card; // Use card color for secondary button
  const settingsButtonTextColor = themeColors.text;
  const shareButtonBgColor = themeColors.tint; // Use theme tint for primary action
  const shareButtonTextColor = isDarkMode ? '#000000' : '#FFFFFF';



  return (
    <ParallaxScrollView
      // Define header background colors consistent with other screens or design
      headerBackgroundColor={{ light: '#E0E0E0', dark: '#212121' }}
      headerImage={
        <View style={styles.profileHeaderContainer}>
          <Image
            source={userProfile.profileImageUrl ? { uri: userProfile.profileImageUrl } : defaultProfileImage}
            style={styles.profileImage}
          />
          {/* Header text colors kept simple assuming a contrasting header background */}
          <ThemedText style={[styles.profileName, { color: headerTextColor }]} type="title">{userProfile.name}</ThemedText>
          <ThemedText style={[styles.profileUsername, { color: headerSecondaryTextColor }]} type="subtitle">{userProfile.username}</ThemedText>

          {/* --- Social Media Handles --- */}
          <View style={styles.socialMediaContainer}>
            {userProfile.instagramHandle && (
              <View style={styles.socialMediaItem}>
                <Ionicons name="logo-instagram" size={18} color={headerSecondaryTextColor} style={styles.socialMediaIcon} />
                <ThemedText style={[styles.socialMediaHandle, { color: headerSecondaryTextColor }]}>{userProfile.instagramHandle}</ThemedText>
              </View>
            )}
            {userProfile.tiktokHandle && (
              <View style={styles.socialMediaItem}>
                <Ionicons name="logo-tiktok" size={18} color={headerSecondaryTextColor} style={styles.socialMediaIcon} />
                <ThemedText style={[styles.socialMediaHandle, { color: headerSecondaryTextColor }]}>{userProfile.tiktokHandle}</ThemedText>
              </View>
            )}
          </View>
        </View>
      }>

      {/* --- Main Content Area --- */}

      {/* --- Stats Section - Updated KPIs & Visuals --- */}
      <ThemedView style={styles.contentBlock}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Meu Desempenho</ThemedText>
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
              {userProfile.stats.totalPoints} <ThemedText style={[styles.statUnit, { color: themeColors.text }]}>pontos</ThemedText>
            </ThemedText>
            <View style={styles.labelContainer}>
              <Ionicons name="star-outline" size={16} color={themeColors.icon} style={styles.statIcon} />
              <ThemedText style={[styles.statLabel, { color: themeColors.textSecondary }]}>Pontos</ThemedText>
            </View>
          </View>

          {/* KPI 2: Sequência */}
          <View style={styles.statItem}>
            <ThemedText type="title" style={[styles.statValue, { color: themeColors.text }]}>
              {userProfile.stats.currentStreak} <ThemedText style={[styles.statUnit, { color: themeColors.text }]}>dias</ThemedText>
            </ThemedText>
            <View style={styles.labelContainer}>
              <Ionicons name="flame-outline" size={16} color={themeColors.icon} style={styles.statIcon} />
              <ThemedText style={[styles.statLabel, { color: themeColors.textSecondary }]}>Sequência</ThemedText>
            </View>
          </View>

          {/* KPI 3: Desafios Concluídos */}
          <View style={styles.statItem}>
            <ThemedText type="title" style={[styles.statValue, { color: themeColors.text }]}>
              {userProfile.stats.challengesCompleted} <ThemedText style={[styles.statUnit, { color: themeColors.text }]}>desafios</ThemedText>
            </ThemedText>
            <View style={styles.labelContainer}>
              <Ionicons name="trophy-outline" size={16} color={themeColors.icon} style={styles.statIcon} />
              <ThemedText style={[styles.statLabel, { color: themeColors.textSecondary }]}>Concluídos</ThemedText>
            </View>
          </View>
        </ThemedView>
      </ThemedView>

      {/* Badges/Achievements Section - Now showing name */}
      <ThemedView style={styles.contentBlock}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Desafios Concluídos</ThemedText>
        {userProfile.badges.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesContainer}>
            {userProfile.badges.map((badge) => (
              <ThemedView key={badge.id} style={[styles.badgeItem, { backgroundColor: badgeBackgroundColor }]}>
                <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                <ThemedText style={[styles.badgeName, { color: badgeTextColor }]} numberOfLines={2}>{badge.name}</ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        ) : (
          <ThemedText style={styles.noItemsText}>Complete desafios para ganhar conquistas!</ThemedText>
        )}
      </ThemedView>
      
      {/* Share Button */}
      <ThemedView style={[styles.contentBlock, styles.ctaBlock, styles.shareBlock]}>
        <TouchableOpacity
          onPress={handleShareProfile}
          style={[styles.shareButton, { backgroundColor: shareButtonBgColor }]}
          accessibilityLabel="Compartilhar Meu Perfil"
          accessibilityRole="button"
        >
          <Ionicons name="share-social-outline" size={18} color={shareButtonTextColor} style={styles.buttonIcon} />
          <ThemedText style={[styles.shareButtonText, { color: shareButtonTextColor }]}>Compartilhar Meu Perfil</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Settings CTA Button */}
      <ThemedView style={[styles.contentBlock, styles.ctaBlock]}>
        <TouchableOpacity
          onPress={handleNavigateToSettings}
          style={[styles.settingsButton, { backgroundColor: settingsButtonBgColor }]}
          accessibilityLabel="Gerenciar Conta e Configurações"
          accessibilityRole="button"
        >
          <Ionicons name="settings-outline" size={18} color={settingsButtonTextColor} style={styles.buttonIcon} />
          <ThemedText style={[styles.settingsButtonText, { color: settingsButtonTextColor }]}>Gerenciar Conta e Configurações</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  // Header Styles
  profileHeaderContainer: {
    paddingTop: 20,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20, // Add some padding below header content
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF', // Keep white border for contrast on potentially varied backgrounds
    marginBottom: 10,
    backgroundColor: '#ccc', // Placeholder background
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    // Color set dynamically based on header background
  },
  profileUsername: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12, // Increased margin below username
    // Color set dynamically based on header background
  },
  // Social Media Styles
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20, // Increased space between social media items
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5, // Space between icon and handle
  },
  socialMediaIcon: {
    // Size/Color set dynamically
  },
  socialMediaHandle: {
    fontSize: 14,
    // Color set dynamically based on header background
  },

  // Content Block Styles
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

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingVertical: 15,
    borderRadius: 12, // More rounded corners
    borderWidth: 1,
    // Background and border color set dynamically
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
    // Color set dynamically
  },
  labelContainer: { // Container for icon + label
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6, // Increased space
  },
  statIcon: {
    marginRight: 4, // Space between icon and label
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    // Color set dynamically
  },
  statUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    // Color set dynamically
  },

  // Badges Styles
  badgesContainer: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  badgeItem: {
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically too
    marginRight: 12,
    padding: 8,
    borderRadius: 10, // Slightly more rounded
    width: 85,
    height: 85,
    // Background color set dynamically
  },
  badgeIcon: {
    fontSize: 24, // Slightly larger icon
    marginBottom: 4, // Space between icon and name
  },
  badgeName: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14, // Adjusted line height
    fontWeight: '500',
    // Color set dynamically
  },
  noItemsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
    // Color from ThemedText, consider using secondary color
  },

  // CTA Block Styles
  ctaBlock: {
    paddingVertical: 5,
  },
  // Settings Button Styles
  settingsButton: {
    paddingVertical: 14, // Consistent padding
    borderRadius: 10, // Consistent radius
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    // Background color set dynamically
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600', // Semi-bold
    // Color set dynamically
  },
  // Share Button Styles
  shareBlock: {
    marginTop: 10, // Add some space above share button
    marginBottom: 20,
  },
  shareButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    // Background color set dynamically
  },
  shareButtonText: {
    color: '#ffffff', // Usually white text on primary color
    fontSize: 16,
    fontWeight: '600', // Semi-bold
  },
  buttonIcon: {
    marginRight: 8, // Space between icon and text in buttons
  },
});