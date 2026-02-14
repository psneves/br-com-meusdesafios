"use client";

import { useState, useCallback } from "react";
import { useToday } from "@/lib/hooks/use-today";
import { TodayHeader, TodayHeaderSkeleton } from "@/components/today/TodayHeader";
import { TrackableList, TrackableListSkeleton } from "@/components/today/TrackableList";
import { FeedbackToast } from "@/components/today/FeedbackToast";
import { WaterLogger } from "@/components/logging/WaterLogger";
import { SleepLogger } from "@/components/logging/SleepLogger";
import { ActivityLogger } from "@/components/logging/ActivityLogger";
import type { TodayCard } from "@/lib/types/today";
import type { TrackableCategory } from "@meusdesafios/shared";

type ModalType = "water" | "sleep" | "activity" | null;

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
        } else {
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
    async (value: number, unit: string) => {
      if (!selectedCard) return;
      console.log("Activity log:", { value, unit });
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
    <div className="space-y-4 md:space-y-6">
      {isLoading || !data ? (
        <>
          <TodayHeaderSkeleton />
          <TrackableListSkeleton count={4} />
        </>
      ) : (
        <>
          <TodayHeader
            greeting={data.greeting}
            date={data.date}
            totalPoints={data.totalPoints}
            points30d={data.points30d}
            bestStreak={data.bestStreak}
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

      {/* Activity Logger Modal */}
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
