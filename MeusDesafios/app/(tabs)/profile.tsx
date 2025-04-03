// Assuming this file is saved as app/(tabs)/profile.tsx

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

// --- IMPORTANT ---
// You'll need an icon library for actual social media icons.
// Example using react-native-vector-icons (install it first: npm install react-native-vector-icons)
// import Icon from 'react-native-vector-icons/FontAwesome5'; // Or FontAwesome, MaterialIcons etc.
// Placeholder for a settings icon, replace with actual icon component later
// import { SettingsIcon } from '@/components/SettingsIcon';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// Placeholder for navigation hook if using expo-router
// import { useRouter } from 'expo-router';

// --- Placeholder user data - replace with actual data fetched from API ---
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
  // const router = useRouter(); // Uncomment when navigation is set up

  const handleNavigateToSettings = () => {
    console.log('Navigate to Settings');
    // router.push('/settings'); // Example navigation
    Alert.alert('Navegação', 'Ir para a tela de Configurações.'); // Placeholder feedback
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

  return (
    // Use a standard ScrollView or View if Parallax is not desired for Profile
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E0E0E0', dark: '#212121' }}
      headerImage={
        <View style={styles.profileHeaderContainer}>
          <Image
            source={userProfile.profileImageUrl ? { uri: userProfile.profileImageUrl } : defaultProfileImage}
            style={styles.profileImage}
          />
          <ThemedText style={styles.profileName} type="title">{userProfile.name}</ThemedText>
          <ThemedText style={styles.profileUsername} type="subtitle">{userProfile.username}</ThemedText>

          {/* --- Social Media Handles --- */}
          <View style={styles.socialMediaContainer}>
            {userProfile.instagramHandle && (
              <View style={styles.socialMediaItem}>
                {/* Replace Text with actual Icon component */}
                <ThemedText style={styles.socialMediaIcon}>
                  <Image
                    source={require('@/assets/images/instagram.png')} // Keeping placeholder image source // Mantendo a fonte da imagem de placeholder
                    style={styles.socialMediaIcon}
                  />
                </ThemedText>
                {/* <Icon name="instagram" size={16} color="#DDD" /> */}
                <ThemedText style={styles.socialMediaHandle}>{userProfile.instagramHandle}</ThemedText>
              </View>
            )}
            {userProfile.tiktokHandle && (
              <View style={styles.socialMediaItem}>
                {/* Replace Text with actual Icon component */}
                <ThemedText style={styles.socialMediaIcon}><Image
                  source={require('@/assets/images/tiktok.png')} // Keeping placeholder image source // Mantendo a fonte da imagem de placeholder
                  style={styles.socialMediaIcon}
                /></ThemedText>
                {/* <Icon name="tiktok" size={16} color="#DDD" /> */}
                <ThemedText style={styles.socialMediaHandle}>{userProfile.tiktokHandle}</ThemedText>
              </View>
            )}
          </View>
        </View>
      }>

      {/* --- Main Content Area --- */}

      {/* Stats Section - Consider adding more relevant KPIs */}
      <ThemedView style={styles.contentBlock}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Meu Desempenho</ThemedText>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="title" style={styles.statValue}>{userProfile.stats.totalPoints} <ThemedText style={styles.statUnit}>pontos</ThemedText></ThemedText>
            <ThemedText style={styles.statLabel}>Últimos 30 dias</ThemedText>
          </View>

          <View style={styles.statItem}>
            <ThemedText type="title" style={styles.statValue}>{userProfile.stats.currentStreak} <ThemedText style={styles.statUnit}>dias</ThemedText></ThemedText>
            <ThemedText style={styles.statLabel}>Sequência Atual</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="title" style={styles.statValue}>{userProfile.stats.challengesCompleted} <ThemedText style={styles.statUnit}>dias</ThemedText></ThemedText>
            <ThemedText style={styles.statLabel}>Sequência Máxima</ThemedText>
          </View>

          {/* Add more statItems here if needed */}
        </View>
      </ThemedView>

      {/* Badges/Achievements Section - Now showing name */}
      <ThemedView style={styles.contentBlock}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Desafios Concluídos</ThemedText>
        {userProfile.badges.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesContainer}>
            {userProfile.badges.map((badge) => (
              <View key={badge.id} style={styles.badgeItem}>
                <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                {/* Added badge name back */}
                <ThemedText style={styles.badgeName} numberOfLines={2}>{badge.name}</ThemedText>
              </View>
            ))}
          </ScrollView>
        ) : (
          <ThemedText style={styles.noItemsText}>Complete desafios para ganhar conquistas!</ThemedText>
        )}
      </ThemedView>

      {/* Settings CTA Button */}
      <ThemedView style={[styles.contentBlock, styles.ctaBlock]}>
        <TouchableOpacity onPress={handleNavigateToSettings} style={styles.settingsButton}>
          {/* Optional: Add Settings Icon here */}
          {/* <SettingsIcon color="#FFF" style={styles.settingsIcon} /> */}
          <ThemedText style={styles.settingsButtonText}>Gerenciar Conta e Configurações</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Share Button */}
      <ThemedView style={[styles.contentBlock, styles.ctaBlock, styles.shareBlock]}>
        <TouchableOpacity onPress={handleShareProfile} style={styles.shareButton}>
          {/* Optional: Add Share Icon here */}
          {/* <Icon name="share-alt" size={18} color="#FFF" style={styles.buttonIcon} /> */}
          <ThemedText style={styles.shareButtonText}>Compartilhar Meu Perfil</ThemedText>
        </TouchableOpacity>
      </ThemedView>

    </ParallaxScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  // Header Styles
  profileHeaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFF',
    marginBottom: 10,
    backgroundColor: '#ccc',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 2, // Added margin
  },
  profileUsername: {
    fontSize: 16,
    color: '#DDD',
    textAlign: 'center',
    marginBottom: 8, // Added margin below username
  },
  // Social Media Styles
  socialMediaContainer: {
    flexDirection: 'row', // Changed to column to stack items vertically
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15, // Space between social media items
  },
  socialMediaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // Space between icon and handle
  },
  socialMediaIcon: { // Placeholder style for text icon
    height: 20,
    width: 20,
    fontSize: 16,
    color: '#DDD',
  },
  socialMediaHandle: {
    fontSize: 14,
    color: '#DDD',
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
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start', // Align items top for potentially different text lengths
    backgroundColor: '#f9f9f9', // Subtle background for stats section
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 5, // Add padding to prevent text collision
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333', // Darker color for value
  },
  statLabel: {
    fontSize: 11, // Slightly smaller label
    color: '#555', // Darker grey for label
    marginTop: 4, // Increased space
    textAlign: 'center',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#333',
  },

  // Badges Styles
  badgesContainer: {
    paddingTop: 8,
    paddingBottom: 12, // Added bottom padding
  },
  badgeItem: {
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content top
    marginRight: 12, // Reduced margin
    padding: 8, // Reduced padding
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    width: 85, // Fixed width
    height: 85, // Fixed height to make them square-ish
  },
  badgeIcon: {
    marginTop: 5,
    fontSize: 20, // Slightly larger icon
  },
  badgeName: {
    fontSize: 10,
    textAlign: 'center',
    color: '#444', // Darker text for name
    lineHeight: 15,
    fontWeight: '500',
  },
  noItemsText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    paddingVertical: 10,
  },

  // CTA Block Styles (for buttons)
  ctaBlock: {
    paddingVertical: 5, // Reduced vertical padding for button blocks
  },
  // Settings Button Styles (CTA Style)
  settingsButton: {
    backgroundColor: '#555', // Darker grey for settings button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center content
    flexDirection: 'row', // Allow icon placement
    width: '100%',
  },
  settingsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5, // Space text from potential icon
  },
  settingsIcon: { // Style for potential icon
    marginRight: 8,
  },

  // Share Button Styles
  shareBlock: {
    marginTop: 5, // Add some space above share button
    marginBottom: 20, // Add space at the very bottom
  },
  shareButton: {
    backgroundColor: '#007AFF', // Primary blue color
    paddingVertical: 14, // Slightly larger padding
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center content
    flexDirection: 'row', // Allow icon placement
    width: '100%',
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5, // Space text from potential icon
  },
  buttonIcon: { // Style for potential icon in buttons
    marginRight: 8,
  },

  // Removed unused styles from previous version
  // settingsLink, settingsText, settingsArrow
});