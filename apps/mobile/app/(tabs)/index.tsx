import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToday } from "../../src/hooks/use-today";
import { useAuthStore } from "../../src/stores/auth.store";
import { haptics } from "../../src/utils/haptics";
import { ChallengeCard } from "../../src/components/ChallengeCard";
import { FeedbackModal } from "../../src/components/FeedbackModal";
import { WeeklySummaryCard } from "../../src/components/WeeklySummaryCard";
import { MonthlySummaryCard } from "../../src/components/MonthlySummaryCard";
import { ChallengeSettingsSheet } from "../../src/components/ChallengeSettingsSheet";
import { TodayScreenSkeleton } from "../../src/components/skeletons/TodayScreenSkeleton";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

export default function TodayScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    data,
    weekSummary,
    monthSummary,
    isLoading,
    feedback,
    logQuickAction,
    clearFeedback,
    refresh,
  } = useToday();

  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const onRefresh = async () => {
    haptics.light();
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  if (isLoading) {
    return <TodayScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {data?.greeting || `Olá, ${user?.firstName || ""}!`}
            </Text>
            <View style={styles.pointsRow}>
              <PointPill label="Hoje" value={data?.totalPoints ?? 0} />
              <PointPill label="Semana" value={data?.pointsWeek ?? 0} />
              <PointPill label="Mês" value={data?.pointsMonth ?? 0} />
            </View>
          </View>
          <Pressable onPress={() => setSettingsVisible(true)} accessibilityLabel="Abrir configurações" accessibilityRole="button">
            <Ionicons
              name="settings-outline"
              size={24}
              color={colors.gray[600]}
            />
          </Pressable>
        </View>

        {/* Challenge Cards */}
        {data?.cards.map((card) => (
          <ChallengeCard
            key={card.userTrackableId}
            card={card}
            onQuickAction={logQuickAction}
          />
        ))}

        {/* Summary toggle */}
        {(weekSummary || monthSummary) && (
          <Pressable
            style={styles.summaryToggle}
            onPress={() => setShowSummary(!showSummary)}
            accessibilityLabel={showSummary ? "Ocultar resumo" : "Ver resumo"}
            accessibilityRole="button"
          >
            <Text style={styles.summaryToggleText}>
              {showSummary ? "Ocultar resumo" : "Ver resumo"}
            </Text>
            <Ionicons
              name={showSummary ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.primary[500]}
            />
          </Pressable>
        )}

        {showSummary && (
          <>
            {weekSummary && <WeeklySummaryCard summary={weekSummary} />}
            {monthSummary && <MonthlySummaryCard summary={monthSummary} />}
          </>
        )}
      </ScrollView>

      <FeedbackModal feedback={feedback} onDismiss={clearFeedback} />
      <ChallengeSettingsSheet
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

function PointPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.pointPill}>
      <Text style={styles.pointValue}>{value}</Text>
      <Text style={styles.pointLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.phi4,
    paddingBottom: spacing.phi7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.phi4,
  },
  greeting: {
    ...typography.h2,
    color: colors.gray[900],
  },
  pointsRow: {
    flexDirection: "row",
    gap: spacing.phi3,
    marginTop: spacing.phi2,
  },
  pointPill: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi1,
    borderRadius: 12,
    alignItems: "center",
  },
  pointValue: {
    ...typography.bodySmall,
    fontWeight: "700",
    color: colors.primary[600],
  },
  pointLabel: {
    ...typography.caption,
    color: colors.primary[400],
    fontSize: 10,
  },
  summaryToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.phi3,
    gap: spacing.phi1,
  },
  summaryToggleText: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: "600",
  },
});
