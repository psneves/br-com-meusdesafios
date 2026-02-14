"use client";

import { useState, useCallback, useEffect } from "react";
import type { TodayCard, TodayResponse, LogFeedback } from "../types/today";
import { getMockTodayResponse } from "../mock/today-data";

interface UseTodayResult {
  data: TodayResponse | null;
  isLoading: boolean;
  error: Error | null;
  feedback: LogFeedback | null;
  logQuickAction: (cardId: string, actionId: string) => Promise<void>;
  logValue: (cardId: string, value: number, meta?: Record<string, unknown>) => Promise<void>;
  clearFeedback: () => void;
  refresh: () => Promise<void>;
}

// Flag to switch between mock and real API
const USE_MOCK = true;

export function useToday(): UseTodayResult {
  const [data, setData] = useState<TodayResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [feedback, setFeedback] = useState<LogFeedback | null>(null);

  const fetchToday = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (USE_MOCK) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const response = getMockTodayResponse();
        setData(response);
      } else {
        const response = await fetch("/api/trackables/today");
        if (!response.ok) throw new Error("Failed to fetch today data");
        const json = await response.json();
        setData(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Helper to update a card with new value
  const updateCardWithValue = useCallback(
    (card: TodayCard, addValue: number): { card: TodayCard; feedback: LogFeedback | null } => {
      const newValue = card.progress.value + addValue;
      const target = card.goal.target || 0;
      const wasMet = card.progress.met;
      const nowMet = target > 0 ? newValue >= target : addValue > 0;

      let newPoints = card.pointsToday;
      let feedbackData: LogFeedback | null = null;

      if (!wasMet && nowMet) {
        newPoints = 10;
        const newStreak = card.streak.current + 1;

        // Check milestones
        let bonus = 0;
        if (newStreak === 3) bonus = 5;
        else if (newStreak === 7) bonus = 10;
        else if (newStreak === 14) bonus = 20;
        else if (newStreak === 30) bonus = 50;

        newPoints += bonus;

        feedbackData = {
          goalMet: true,
          pointsEarned: newPoints,
          streakUpdated: { from: card.streak.current, to: newStreak },
          milestone: bonus > 0 ? { day: newStreak, bonus } : undefined,
          message: bonus > 0
            ? `Meta cumprida! +10 pts. Sequência dia ${newStreak}: +${bonus} pts!`
            : `Meta cumprida! +10 pts`,
        };

        return {
          card: {
            ...card,
            progress: {
              ...card.progress,
              value: newValue,
              met: true,
              percentage: 100,
            },
            pointsToday: newPoints,
            streak: { ...card.streak, current: newStreak },
          },
          feedback: feedbackData,
        };
      }

      return {
        card: {
          ...card,
          progress: {
            ...card.progress,
            value: newValue,
            percentage: target > 0 ? Math.min(100, Math.round((newValue / target) * 100)) : 0,
          },
        },
        feedback: null,
      };
    },
    []
  );

  // Log with a specific value (for modals)
  const logValue = useCallback(
    async (cardId: string, value: number, meta?: Record<string, unknown>) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const { card: updatedCard, feedback: newFeedback } = updateCardWithValue(card, value);

          const updatedCards = data.cards.map((c) =>
            c.userTrackableId === cardId ? updatedCard : c
          );

          const newTotal = updatedCards.reduce((sum, c) => sum + c.pointsToday, 0);

          setData({
            ...data,
            totalPoints: newTotal,
            cards: updatedCards,
          });

          if (newFeedback) {
            setFeedback(newFeedback);
          }
        } else {
          const response = await fetch("/api/trackables/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userTrackableId: cardId,
              valueNum: value,
              meta,
            }),
          });

          if (!response.ok) throw new Error("Erro ao registar");

          const json = await response.json();
          if (json.data.feedback) {
            setFeedback(json.data.feedback);
          }

          await fetchToday();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro ao registar"));
      }
    },
    [data, fetchToday, updateCardWithValue]
  );

  const logQuickAction = useCallback(
    async (cardId: string, actionId: string) => {
      if (!data) return;

      const card = data.cards.find((c) => c.userTrackableId === cardId);
      if (!card) return;

      // Check for custom action IDs (from modals)
      if (actionId.startsWith("water-custom-")) {
        const amount = parseInt(actionId.replace("water-custom-", ""), 10);
        if (!isNaN(amount)) {
          await logValue(cardId, amount);
          return;
        }
      }

      if (actionId.startsWith("activity-log-")) {
        const value = parseFloat(actionId.replace("activity-log-", ""));
        if (!isNaN(value)) {
          await logValue(cardId, value);
          return;
        }
      }

      if (actionId === "sleep-log") {
        // For sleep, just mark as completed
        await logValue(cardId, 1);
        return;
      }

      const action = card.quickActions.find((a) => a.id === actionId);
      if (!action) return;

      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 300));

          const updatedCards = data.cards.map((c) => {
            if (c.userTrackableId !== cardId) return c;

            // Handle different action types
            if (action.type === "add" && action.amount) {
              const { card: updatedCard, feedback: newFeedback } = updateCardWithValue(c, action.amount);
              if (newFeedback) setFeedback(newFeedback);
              return updatedCard;
            }

            if (action.type === "toggle") {
              const nowMet = !c.progress.met;
              let newPoints = c.pointsToday;

              if (nowMet && !c.progress.met) {
                newPoints = 10;
                const newStreak = c.streak.current + 1;

                let bonus = 0;
                if (newStreak === 3) bonus = 5;
                else if (newStreak === 7) bonus = 10;
                else if (newStreak === 14) bonus = 20;
                else if (newStreak === 30) bonus = 50;

                newPoints += bonus;

                setFeedback({
                  goalMet: true,
                  pointsEarned: newPoints,
                  streakUpdated: { from: c.streak.current, to: newStreak },
                  milestone: bonus > 0 ? { day: newStreak, bonus } : undefined,
                  message: bonus > 0
                    ? `Meta cumprida! +10 pts. Sequência dia ${newStreak}: +${bonus} pts!`
                    : `Meta cumprida! +10 pts`,
                });

                return {
                  ...c,
                  progress: { ...c.progress, value: 1, met: true, percentage: 100 },
                  pointsToday: newPoints,
                  streak: { ...c.streak, current: newStreak },
                };
              }

              return {
                ...c,
                progress: { ...c.progress, value: 0, met: false, percentage: 0 },
                pointsToday: 0,
              };
            }

            return c;
          });

          const newTotal = updatedCards.reduce((sum, c) => sum + c.pointsToday, 0);

          setData({
            ...data,
            totalPoints: newTotal,
            cards: updatedCards,
          });
        } else {
          const response = await fetch("/api/trackables/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userTrackableId: cardId,
              valueNum: action.amount,
            }),
          });

          if (!response.ok) throw new Error("Failed to log action");

          const json = await response.json();
          if (json.data.feedback) {
            setFeedback(json.data.feedback);
          }

          await fetchToday();
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Erro ao registar"));
      }
    },
    [data, fetchToday, logValue, updateCardWithValue]
  );

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  return {
    data,
    isLoading,
    error,
    feedback,
    logQuickAction,
    logValue,
    clearFeedback,
    refresh: fetchToday,
  };
}
