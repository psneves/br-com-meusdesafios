// TODO: Verify compact layout on iPhone SE / iPhone 13 / Pixel 5 — no vertical scroll on Today
// TODO: Add E2E test (Playwright) asserting no vertical scroll on /today at 375x667 viewport
"use client";

import { useState, useCallback, useMemo } from "react";
import { useToday } from "@/lib/hooks/use-today";
import { useSession } from "@/lib/hooks/use-session";
import { TodayHeader, TodayHeaderSkeleton } from "@/components/today/TodayHeader";
import { TrackableList, TrackableListSkeleton } from "@/components/today/TrackableList";
import { FeedbackToast } from "@/components/today/FeedbackToast";
import { WaterLogger, SleepLogger, ActivityLogger, DietLogger } from "@/components/logging";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { AlertTriangle } from "lucide-react";
import type { TrackableCategory } from "@meusdesafios/shared";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    month: "long",
    day: "numeric",
  });
}

function formatWeekday(date: Date): string {
  const wd = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return wd.charAt(0).toUpperCase() + wd.slice(1);
}

export default function TodayPage() {
  const { user } = useSession();
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [activeModal, setActiveModal] = useState<{
    cardId: string;
    category: TrackableCategory;
  } | null>(null);
  const [expandedKpi, setExpandedKpi] = useState<"week" | "month" | null>(null);

  const {
    data,
    weekSummary,
    monthSummary,
    isLoading,
    error,
    feedback,
    logValue,
    clearFeedback,
    refresh,
  } = useToday(selectedDate);

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

  const displayGreeting = formatWeekday(selectedDate);
  const displayDate = formatDateShort(selectedDate);

  // ── Modal handlers ───────────────────────────────────────

  const handleRegister = useCallback(
    (cardId: string) => {
      const card = data?.cards.find((c) => c.userTrackableId === cardId);
      if (card) setActiveModal({ cardId, category: card.category });
    },
    [data]
  );

  const handleCloseModal = useCallback(() => setActiveModal(null), []);

  const handleWaterLog = useCallback(
    async (amount: number) => {
      if (activeModal) await logValue(activeModal.cardId, amount);
    },
    [activeModal, logValue]
  );

  const handleSleepLog = useCallback(
    async (durationMin: number) => {
      if (activeModal) await logValue(activeModal.cardId, durationMin);
    },
    [activeModal, logValue]
  );

  const handleActivityLog = useCallback(
    async (value: number, _unit?: string, modality?: string) => {
      if (activeModal) await logValue(activeModal.cardId, value, modality ? { exerciseModality: modality } : undefined);
    },
    [activeModal, logValue]
  );

  const handleDietLog = useCallback(
    async (successCount: number) => {
      if (!activeModal || !data) return;
      const card = data.cards.find((c) => c.userTrackableId === activeModal.cardId);
      if (!card) return;
      const delta = successCount - card.progress.value;
      if (delta !== 0) await logValue(activeModal.cardId, delta);
    },
    [activeModal, data, logValue]
  );

  // ── Derive active card ───────────────────────────────────

  const activeCard = activeModal
    ? data?.cards.find((c) => c.userTrackableId === activeModal.cardId) ?? null
    : null;

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="space-y-phi-3 md:space-y-phi-4">
      {/* Inline error banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-phi-4 py-phi-3 dark:border-red-900/50 dark:bg-red-950/20">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 dark:text-red-400" />
          <p className="flex-1 text-sm text-red-700 dark:text-red-300">
            Erro ao carregar dados de hoje
          </p>
          <button
            onClick={refresh}
            className="shrink-0 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isLoading || !data ? (
        <>
          <TodayHeaderSkeleton />
          <TrackableListSkeleton count={4} />
        </>
      ) : (
        <>
          <TodayHeader
            greeting={displayGreeting}
            date={displayDate}
            userName={user?.displayName ?? ""}
            avatarUrl={user?.avatarUrl ?? "/profile/profile.png"}
            totalPoints={data.totalPoints}
            pointsWeek={data.pointsWeek}
            pointsMonth={data.pointsMonth}
            selectedDate={selectedDate}
            isToday={isToday}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            weekSummary={weekSummary ?? undefined}
            monthSummary={monthSummary ?? undefined}
            onKpiChange={setExpandedKpi}
          />
          {expandedKpi !== "month" && (
            <TrackableList
              cards={data.cards}
              onRegister={handleRegister}
            />
          )}
        </>
      )}

      {/* Feedback Toast */}
      <FeedbackToast feedback={feedback} onDismiss={clearFeedback} />

      {/* Logging Modals */}
      {activeCard && activeModal?.category === "WATER" && (
        <WaterLogger
          isOpen
          onClose={handleCloseModal}
          onLog={handleWaterLog}
          currentProgress={activeCard.progress.value}
          target={activeCard.goal.target}
        />
      )}
      {activeCard && activeModal?.category === "SLEEP" && (
        <SleepLogger
          isOpen
          onClose={handleCloseModal}
          onLog={handleSleepLog}
        />
      )}
      {activeCard && activeModal?.category === "PHYSICAL_EXERCISE" && (
        <ActivityLogger
          isOpen
          onClose={handleCloseModal}
          onLog={handleActivityLog}
          category={activeCard.category}
          name={activeCard.name}
          icon={activeCard.icon}
          currentProgress={activeCard.progress.value}
          target={activeCard.goal.target}
          unit={activeCard.goal.unit}
        />
      )}
      {activeCard && activeModal?.category === "DIET_CONTROL" && (
        <DietLogger
          isOpen
          onClose={handleCloseModal}
          onLog={handleDietLog}
          currentProgress={activeCard.progress.value}
          currentBreakdown={activeCard.breakdown}
          target={activeCard.goal.target}
        />
      )}

      {/* Onboarding (first visit only) */}
      <OnboardingModal onComplete={refresh} />
    </div>
  );
}
