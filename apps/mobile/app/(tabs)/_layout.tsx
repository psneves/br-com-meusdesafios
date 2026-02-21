import { Tabs } from "expo-router";
import { View, Image, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { haptics } from "../../src/utils/haptics";
import { colors } from "../../src/theme/colors";
import { useOfflineQueueStore } from "../../src/stores/offline-queue.store";

function AppHeaderTitle() {
  return (
    <View style={headerStyles.container}>
      <Image
        source={require("../../assets/icon.png")}
        style={headerStyles.logo}
      />
      <Text style={headerStyles.title}>Meus Desafios</Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.gray[900],
  },
});

export default function TabLayout() {
  const queueCount = useOfflineQueueStore((s) => s.queue.length);

  return (
    <Tabs
      screenListeners={{
        tabPress: () => haptics.light(),
      }}
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
        },
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.gray[900],
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hoje",
          headerTitle: () => <AppHeaderTitle />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today-outline" size={size} color={color} />
          ),
          tabBarBadge: queueCount > 0 ? queueCount : undefined,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Ranking",
          headerTitle: () => <AppHeaderTitle />,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
