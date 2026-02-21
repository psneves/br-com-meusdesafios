import { useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  RefreshControl,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToday } from "../../src/hooks/use-today";
import { useAuthStore } from "../../src/stores/auth.store";
import { haptics } from "../../src/utils/haptics";
import { TodayHeader } from "../../src/components/TodayHeader";
import { XpSummaryBar } from "../../src/components/XpSummaryBar";
import { ChallengeCard } from "../../src/components/ChallengeCard";
import { FeedbackModal } from "../../src/components/FeedbackModal";
import { WeeklySummaryCard } from "../../src/components/WeeklySummaryCard";
import { MonthlySummaryCard } from "../../src/components/MonthlySummaryCard";
import { ChallengeSettingsSheet } from "../../src/components/ChallengeSettingsSheet";
import { TodayScreenSkeleton } from "../../src/components/skeletons/TodayScreenSkeleton";
import { WaterLoggerSheet } from "../../src/components/logging/WaterLoggerSheet";
import { SleepLoggerSheet } from "../../src/components/logging/SleepLoggerSheet";
import { ActivityLoggerSheet } from "../../src/components/logging/ActivityLoggerSheet";
import { DietLoggerSheet } from "../../src/components/logging/DietLoggerSheet";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import type { TrackableCategory, ExerciseModality } from "@meusdesafios/shared";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayLabel(selected: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sel = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate()
  );
  const diffMs = today.getTime() - sel.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays <= 6) {
    const wd = sel.toLocaleDateString("pt-BR", { weekday: "long" });
    return wd.charAt(0).toUpperCase() + wd.slice(1).split("-")[0];
  }
  return `${sel.getDate()}/${sel.getMonth() + 1}`;
}

export default function TodayScreen() {
  const user = useAuthStore((s) => s.user);

  // Day navigation
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const today = useMemo(() => startOfDay(new Date()), []);
  const isToday = selectedDate.getTime() === today.getTime();

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      if (d > today) return prev;
      return d;
    });
  }, [today]);

  const {
    data,
    weekSummary,
    monthSummary,
    isLoading,
    feedback,
    logValue,
    clearFeedback,
    refresh,
  } = useToday(selectedDate);

  const [refreshing, setRefreshing] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // ── Logging modal state ───────────────────────────────────
  const [activeModal, setActiveModal] = useState<{
    cardId: string;
    category: TrackableCategory;
  } | null>(null);

  const activeCard = activeModal
    ? data?.cards.find((c) => c.userTrackableId === activeModal.cardId) ?? null
    : null;

  const handleCloseModal = useCallback(() => setActiveModal(null), []);

  const onRefresh = async () => {
    haptics.light();
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Card action: open category-specific logging sheet (matching web pattern)
  const handleRegister = useCallback(
    (cardId: string) => {
      const card = data?.cards.find((c) => c.userTrackableId === cardId);
      if (card) {
        haptics.light();
        setActiveModal({ cardId, category: card.category });
      }
    },
    [data]
  );

  // ── Modal log handlers ───────────────────────────────────
  const handleWaterLog = useCallback(
    (amount: number) => {
      if (activeModal) logValue(activeModal.cardId, amount);
    },
    [activeModal, logValue]
  );

  const handleSleepLog = useCallback(
    (durationMin: number) => {
      if (activeModal) logValue(activeModal.cardId, durationMin);
    },
    [activeModal, logValue]
  );

  const handleActivityLog = useCallback(
    (value: number, modality: ExerciseModality) => {
      if (activeModal) logValue(activeModal.cardId, value, { exerciseModality: modality });
    },
    [activeModal, logValue]
  );

  const handleDietLog = useCallback(
    (successCount: number) => {
      if (!activeModal || !data) return;
      const card = data.cards.find((c) => c.userTrackableId === activeModal.cardId);
      if (!card) return;
      const delta = successCount - card.progress.value;
      if (delta !== 0) logValue(activeModal.cardId, delta);
    },
    [activeModal, data, logValue]
  );

  if (isLoading) {
    return <TodayScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
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
        {/* Header: user profile + day nav + settings */}
        <TodayHeader
          userName={user?.displayName ?? user?.firstName ?? ""}
          userHandle={user?.handle ?? ""}
          avatarUrl={user?.avatarUrl ?? null}
          friendsCount={user?.friendsCount ?? 0}
          selectedDate={selectedDate}
          isToday={isToday}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onOpenSettings={() => setSettingsVisible(true)}
        />

        {/* XP Summary Bar */}
        <XpSummaryBar
          totalPoints={data?.totalPoints ?? 0}
          pointsWeek={data?.pointsWeek ?? 0}
          pointsMonth={data?.pointsMonth ?? 0}
          dayLabel={getDayLabel(selectedDate)}
        />

        {/* Challenge Cards */}
        {data?.cards.map((card) => (
          <ChallengeCard
            key={card.userTrackableId}
            card={card}
            onRegister={handleRegister}
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

      {/* ── Category Logging Sheets ── */}
      {activeCard && activeModal?.category === "WATER" && (
        <WaterLoggerSheet
          visible
          currentProgress={activeCard.progress.value}
          target={activeCard.goal.target}
          onLog={handleWaterLog}
          onClose={handleCloseModal}
        />
      )}
      {activeCard && activeModal?.category === "SLEEP" && (
        <SleepLoggerSheet
          visible
          targetMin={activeCard.goal.target}
          onLog={handleSleepLog}
          onClose={handleCloseModal}
        />
      )}
      {activeCard && activeModal?.category === "PHYSICAL_EXERCISE" && (
        <ActivityLoggerSheet
          visible
          currentProgress={activeCard.progress.value}
          target={activeCard.goal.target}
          onLog={handleActivityLog}
          onClose={handleCloseModal}
        />
      )}
      {activeCard && activeModal?.category === "DIET_CONTROL" && (
        <DietLoggerSheet
          visible
          currentProgress={activeCard.progress.value}
          currentBreakdown={activeCard.breakdown}
          target={activeCard.goal.target}
          onLog={handleDietLog}
          onClose={handleCloseModal}
        />
      )}
    </SafeAreaView>
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
  summaryToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.phi3,
    gap: spacing.phi1,
  },
  summaryToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary[500],
  },
});
