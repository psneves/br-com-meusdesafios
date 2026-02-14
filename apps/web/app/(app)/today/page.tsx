// TODO: Verify compact layout on iPhone SE / iPhone 13 / Pixel 5 — no vertical scroll on Today
// TODO: Add E2E test (Playwright) asserting no vertical scroll on /today at 375x667 viewport
"use client";

import { useState, useCallback, useMemo } from "react";
import { useToday } from "@/lib/hooks/use-today";
import { TodayHeader, TodayHeaderSkeleton } from "@/components/today/TodayHeader";
import { TrackableList, TrackableListSkeleton } from "@/components/today/TrackableList";
import { FeedbackToast } from "@/components/today/FeedbackToast";
import { WaterLogger } from "@/components/logging/WaterLogger";
import { SleepLogger } from "@/components/logging/SleepLogger";
import { ActivityLogger } from "@/components/logging/ActivityLogger";
import type { TodayCard } from "@/lib/types/today";
import type { TrackableCategory, ExerciseModality } from "@meusdesafios/shared";

type ModalType = "water" | "sleep" | "activity" | null;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDatePt(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function TodayPage() {
  const {
    data,
    isLoading,
    error,
    feedback,
    logQuickAction,
    clearFeedback,
    refresh,
  } = useToday();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCard, setSelectedCard] = useState<TodayCard | null>(null);
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

  const displayDate = formatDatePt(selectedDate);

  const isYesterday = useMemo(() => {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return selectedDate.getTime() === yesterday.getTime();
  }, [selectedDate, today]);

  let displayGreeting: string;
  if (isToday) {
    displayGreeting = data?.greeting || getGreeting();
  } else if (isYesterday) {
    displayGreeting = "Ontem";
  } else {
    displayGreeting = formatDatePt(selectedDate).split(",")[0] || "";
  }

  const handleQuickAction = useCallback(
    async (cardId: string, actionId: string) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      const action = card.quickActions.find((a) => a.id === actionId);
      if (!action) return;

      if (action.type === "add" && action.amount) {
        return logQuickAction(cardId, actionId);
      }

      if (action.type === "toggle") {
        return logQuickAction(cardId, actionId);
      }

      if (action.type === "log") {
        setSelectedCard(card);

        if (card.category === "WATER") {
          setActiveModal("water");
        } else if (card.category === "SLEEP") {
          setActiveModal("sleep");
        } else if (card.category === "PHYSICAL_EXERCISE") {
          setActiveModal("activity");
        }
      }
    },
    [data, logQuickAction]
  );

  const handleWaterLog = useCallback(
    async (amount: number) => {
      if (!selectedCard) return;
      await logQuickAction(selectedCard.userTrackableId, `water-custom-${amount}`);
    },
    [selectedCard, logQuickAction]
  );

  const handleSleepLog = useCallback(
    async (bedtime: string, durationMin: number) => {
      if (!selectedCard) return;
      console.log("Sleep log:", { bedtime, durationMin });
      await logQuickAction(selectedCard.userTrackableId, "sleep-log");
    },
    [selectedCard, logQuickAction]
  );

  const handleActivityLog = useCallback(
    async (value: number, unit: string, modality?: ExerciseModality) => {
      if (!selectedCard) return;
      console.log("Activity log:", { value, unit, modality });
      await logQuickAction(selectedCard.userTrackableId, `activity-log-${value}`);
    },
    [selectedCard, logQuickAction]
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setSelectedCard(null);
  }, []);

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="mb-4 text-gray-500 dark:text-gray-400">Erro ao carregar dados de hoje</p>
        <button
          onClick={refresh}
          className="text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
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
            totalPoints={data.totalPoints}
            points30d={data.points30d}
            bestStreak={data.bestStreak}
            isToday={isToday}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
          />
          <TrackableList
            cards={data.cards}
            onQuickAction={handleQuickAction}
          />
        </>
      )}

      {/* Feedback Toast */}
      <FeedbackToast feedback={feedback} onDismiss={clearFeedback} />

      {/* Water Logger Modal */}
      <WaterLogger
        isOpen={activeModal === "water"}
        onClose={closeModal}
        onLog={handleWaterLog}
        currentProgress={selectedCard?.progress.value}
        target={selectedCard?.goal.target}
      />

      {/* Sleep Logger Modal */}
      <SleepLogger
        isOpen={activeModal === "sleep"}
        onClose={closeModal}
        onLog={handleSleepLog}
        targetBedtime={selectedCard?.goal.timeWindowEnd}
      />

      {/* Activity Logger Modal (Physical Exercise) */}
      {selectedCard && activeModal === "activity" && (
        <ActivityLogger
          isOpen={true}
          onClose={closeModal}
          onLog={handleActivityLog}
          category={selectedCard.category as TrackableCategory}
          name={selectedCard.name}
          icon={selectedCard.icon}
          currentProgress={selectedCard.progress.value}
          target={selectedCard.goal.target}
          unit={selectedCard.goal.unit}
        />
      )}
    </div>
  );
}
