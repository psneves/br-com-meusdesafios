// TODO: Verify compact layout on iPhone SE / iPhone 13 / Pixel 5 — no vertical scroll on Today
// TODO: Add E2E test (Playwright) asserting no vertical scroll on /today at 375x667 viewport
"use client";

import { useState, useCallback, useMemo } from "react";
import { useToday } from "@/lib/hooks/use-today";
import { TodayHeader, TodayHeaderSkeleton } from "@/components/today/TodayHeader";
import { TrackableList, TrackableListSkeleton } from "@/components/today/TrackableList";
import { FeedbackToast } from "@/components/today/FeedbackToast";

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
  const {
    data,
    isLoading,
    error,
    feedback,
    logQuickAction,
    clearFeedback,
    refresh,
  } = useToday();

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

  const displayGreeting = formatWeekday(selectedDate);
  const displayDate = formatDateShort(selectedDate);

  const handleQuickAction = useCallback(
    async (cardId: string, actionId: string) => {
      return logQuickAction(cardId, actionId);
    },
    [logQuickAction]
  );

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
    <div className="space-y-2 md:space-y-4">
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
            pointsWeek={data.pointsWeek}
            pointsMonth={data.pointsMonth}
            selectedDate={selectedDate}
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
    </div>
  );
}
