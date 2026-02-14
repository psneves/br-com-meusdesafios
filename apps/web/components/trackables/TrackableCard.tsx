"use client";

import { useState } from "react";
import { Check, ChevronRight, AlertCircle } from "lucide-react";
import { StreakBadge } from "./StreakBadge";
import { PointsChip } from "./PointsChip";
import { QuickActionRow, ToggleAction } from "./QuickActionRow";
import { TrackableProgress } from "./TrackableProgress";
import { getCategoryConfig } from "@/lib/category-config";
import type { TodayCard } from "@/lib/types/today";
import { cn } from "@/lib/utils";

interface TrackableCardProps {
  card: TodayCard;
  onQuickAction: (actionId: string) => Promise<void> | void;
  onViewDetails?: () => void;
  className?: string;
}

export function TrackableCard({
  card,
  onQuickAction,
  onViewDetails,
  className,
}: TrackableCardProps) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cfg = getCategoryConfig(card.category);
  const Icon = cfg.icon;
  const isBinary = card.goal.type === "binary";
  const isToggle = card.quickActions.length === 1 && card.quickActions[0]?.type === "toggle";

  const handleAction = async (actionId: string) => {
    setError(null);
    setLoadingActionId(actionId);
    try {
      await Promise.resolve(onQuickAction(actionId));
    } catch {
      setError("Não foi possível atualizar. Tentar novamente");
    } finally {
      setLoadingActionId(null);
    }
  };

  const goalLabel = getGoalLabel(card);
  const remainingLabel = getRemainingLabel(card);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-gray-200 border-l-[3px] bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        cfg.borderAccent,
        card.progress.met && cn(cfg.bgLight, cfg.bgDark),
        className
      )}
    >
      {/* 1. Header row */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <Icon className={cn("h-5 w-5 shrink-0", cfg.color)} />
        <span className="flex-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
          {card.name}
        </span>
        {card.progress.met && (
          <Check
            className={cn("h-4 w-4 shrink-0", cfg.metText, cfg.metTextDark)}
            aria-label="Meta cumprida"
          />
        )}
        <StreakBadge
          current={card.streak.current}
          best={card.streak.best}
          showBest={card.streak.current > 0 && card.streak.current < card.streak.best}
        />
        <PointsChip points={card.pointsToday} showZero size="sm" />
      </div>

      {/* 2. Goal summary line */}
      <p className="px-4 text-xs text-gray-500 dark:text-gray-400">
        {goalLabel}
      </p>

      {/* 3. Progress block */}
      <div className="px-4 pt-2">
        <TrackableProgress
          goal={card.goal}
          progress={card.progress}
          accentColor={cn(cfg.barColor, cfg.barColorDark)}
          metTextClass={cn(cfg.metText, cfg.metTextDark)}
        />
      </div>

      {/* 4. Quick actions */}
      <div className="px-4 pt-3">
        {isToggle ? (
          <ToggleAction
            label={card.progress.met ? "Desfazer" : card.quickActions[0].label}
            isActive={card.progress.met}
            onToggle={() => handleAction(card.quickActions[0].id)}
            isLoading={loadingActionId === card.quickActions[0].id}
            categoryAccent={cfg}
          />
        ) : (
          <QuickActionRow
            actions={card.quickActions}
            onAction={handleAction}
            loadingActionId={loadingActionId}
            categoryAccent={cfg}
          />
        )}
      </div>

      {/* Error inline */}
      {error && (
        <div className="mx-4 mt-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-900/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* 5. Footer state */}
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <div className="min-w-0">
          {card.progress.met ? (
            <p className={cn("flex items-center gap-1 text-xs font-medium", cfg.metText, cfg.metTextDark)}>
              <Check className="h-3.5 w-3.5" />
              Meta de hoje cumprida!
              {card.pointsToday > 0 && (
                <span className="ml-1 text-gray-500 dark:text-gray-400">
                  (+{card.pointsToday} pts)
                </span>
              )}
            </p>
          ) : remainingLabel ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">{remainingLabel}</p>
          ) : null}
        </div>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Ver detalhes
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function getGoalLabel(card: TodayCard): string {
  const { goal, category } = card;

  if (goal.type === "binary") {
    if (category === "DIET") return "Meta: Cumprir dieta hoje";
    return "Meta: Completar hoje";
  }

  if (goal.type === "time_window") {
    return `Meta: Deitar até ${goal.timeWindowEnd}`;
  }

  const target = goal.target || 0;
  const unit = goal.unit || "";
  const formatted = target >= 1000 ? target.toLocaleString() : target.toString();
  return `Meta: ${formatted} ${unit}`;
}

function getRemainingLabel(card: TodayCard): string | null {
  if (card.progress.met) return null;
  const { goal, progress } = card;
  if (goal.type === "binary" || goal.type === "time_window") return null;

  const target = goal.target || 0;
  const remaining = target - progress.value;
  if (remaining <= 0) return null;

  const unit = goal.unit || "";
  const formatted =
    remaining >= 1000
      ? remaining.toLocaleString()
      : remaining % 1 !== 0
        ? remaining.toFixed(1)
        : remaining.toString();
  return `Faltam ${formatted} ${unit}`;
}

// ── Skeleton ────────────────────────────────────────────

export function TrackableCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <div className="h-5 w-5 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1" />
        <div className="h-4 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-10 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="px-4 pt-1">
        <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="px-4 pt-3">
        <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="mt-1 flex justify-between">
          <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 px-4 pt-3">
        <div className="h-[44px] rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-[44px] rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-[44px] rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-3 border-t border-gray-100 px-4 py-2.5 dark:border-gray-800">
        <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
