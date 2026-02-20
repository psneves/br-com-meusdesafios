"use client";

import { useEffect } from "react";
import { Trophy, Sparkles, X } from "lucide-react";
import type { LogFeedback } from "@/lib/types/today";
import { cn } from "@/lib/utils";

interface FeedbackToastProps {
  feedback: LogFeedback | null;
  onDismiss: () => void;
  duration?: number;
}

export function FeedbackToast({
  feedback,
  onDismiss,
  duration = 3000,
}: FeedbackToastProps) {
  useEffect(() => {
    if (!feedback) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [feedback, duration, onDismiss]);

  if (!feedback) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform",
        "animate-in fade-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl",
          "bg-indigo-600 text-white dark:bg-indigo-700"
        )}
      >
        {feedback.milestone ? (
          <Trophy className="h-6 w-6 text-amber-300" />
        ) : (
          <Sparkles className="h-6 w-6 text-amber-200" />
        )}
        <div>
          <p className="font-medium">{feedback.message}</p>
          {feedback.streakUpdated && (
            <p className="text-sm opacity-90">
              Sequência: {feedback.streakUpdated.from} → {feedback.streakUpdated.to} dias
            </p>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="ml-2 rounded-full p-1 hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
