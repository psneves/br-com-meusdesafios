"use client";

import { useState } from "react";
import { Check, ChevronRight, AlertCircle, Plus, Loader2 } from "lucide-react";
import { StreakBadge } from "./StreakBadge";
import { PointsChip } from "./PointsChip";
import { getCategoryConfig } from "@/lib/category-config";
import type { TodayCard, QuickAction, PeriodSummary } from "@/lib/types/today";
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

  const handleAction = async (actionId: string) => {
    setError(null);
    setLoadingActionId(actionId);
    try {
      await Promise.resolve(onQuickAction(actionId));
    } catch {
      setError("Erro ao atualizar. Tente novamente.");
    } finally {
      setLoadingActionId(null);
    }
  };

  const goalLabel = getGoalLabel(card);

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-gray-200 border-l-[3px] bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
        cfg.borderAccent,
        card.progress.met && cn(cfg.bgLight, cfg.bgDark),
        className
      )}
    >
      {/* Header: icon + name + goal | streak + points */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-0.5">
        <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
              {card.name}
            </span>
            {card.progress.met && (
              <Check
                className={cn("h-3.5 w-3.5 shrink-0", cfg.metText, cfg.metTextDark)}
                aria-label="Meta cumprida"
              />
            )}
          </div>
          <p className="text-[11px] leading-tight text-gray-400 dark:text-gray-500">
            {goalLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StreakBadge current={card.streak.current} showBest={false} />
          <PointsChip points={card.pointsToday} showZero size="sm" />
        </div>
      </div>

      {/* Progress bar (only for target-type goals with progress) */}
      {card.goal.type === "target" && (
        <div className="px-3 pt-1">
          <CompactProgress
            value={card.progress.value}
            target={card.goal.target || 0}
            unit={card.goal.unit || ""}
            met={card.progress.met}
            percentage={card.progress.percentage}
            accentColor={cn(cfg.barColor, cfg.barColorDark)}
            metTextClass={cn(cfg.metText, cfg.metTextDark)}
          />
        </div>
      )}

      {/* Period stats (7d / 30d) */}
      <PeriodStats card={card} />

      {/* Compact action row — category-specific */}
      <div className="px-3 pt-1.5 pb-2.5">
        <CompactActions
          card={card}
          cfg={cfg}
          loadingActionId={loadingActionId}
          onAction={handleAction}
        />
      </div>

      {/* Error inline */}
      {error && (
        <div className="mx-3 mb-2 flex items-center gap-1.5 rounded-lg bg-red-50 px-2.5 py-1.5 dark:bg-red-900/20">
          <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
          <p className="text-[11px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Footer: met message or details link */}
      {(card.progress.met || onViewDetails) && (
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-1.5 dark:border-gray-800">
          <div className="min-w-0">
            {card.progress.met && (
              <p className={cn("flex items-center gap-1 text-[11px] font-medium", cfg.metText, cfg.metTextDark)}>
                <Check className="h-3 w-3" />
                Meta cumprida!
                {card.pointsToday > 0 && (
                  <span className="ml-0.5 text-gray-400 dark:text-gray-500">
                    (+{card.pointsToday} pts)
                  </span>
                )}
              </p>
            )}
          </div>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Detalhes
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Compact Progress (single-line) ──────────────────────

function CompactProgress({
  value,
  target,
  unit,
  met,
  percentage,
  accentColor,
  metTextClass,
}: {
  value: number;
  target: number;
  unit: string;
  met: boolean;
  percentage: number;
  accentColor: string;
  metTextClass: string;
}) {
  const fmt = (v: number) =>
    v >= 1000 ? v.toLocaleString() : v % 1 !== 0 ? v.toFixed(1) : v.toString();

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className={cn("h-full rounded-full transition-all duration-500", accentColor)}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
        <span
          className={cn(
            "shrink-0 text-[11px] font-medium tabular-nums",
            met ? metTextClass : "text-gray-500 dark:text-gray-400"
          )}
        >
          {fmt(value)}/{fmt(target)} {unit}
        </span>
      </div>
    </div>
  );
}

// ── Compact Actions (category-specific) ─────────────────

function CompactActions({
  card,
  cfg,
  loadingActionId,
  onAction,
}: {
  card: TodayCard;
  cfg: ReturnType<typeof getCategoryConfig>;
  loadingActionId: string | null;
  onAction: (id: string) => void;
}) {
  const isLoading = (id: string) => loadingActionId === id;
  const isAnyLoading = !!loadingActionId;

  switch (card.category) {
    case "WATER":
      return (
        <WaterCompactActions
          actions={card.quickActions}
          cfg={cfg}
          isLoading={isLoading}
          isAnyLoading={isAnyLoading}
          onAction={onAction}
        />
      );
    case "DIET_CONTROL":
      return (
        <DietCompactActions
          card={card}
          cfg={cfg}
          isLoading={isLoading}
          isAnyLoading={isAnyLoading}
          onAction={onAction}
        />
      );
    case "SLEEP":
    case "PHYSICAL_EXERCISE":
      return (
        <SingleButtonAction
          action={card.quickActions.find((a) => a.type === "log") || card.quickActions[0]}
          cfg={cfg}
          isLoading={isLoading}
          isAnyLoading={isAnyLoading}
          onAction={onAction}
        />
      );
    default:
      return null;
  }
}

// Water: "+" primary button + horizontal chip row (250/500/750)
function WaterCompactActions({
  actions,
  cfg,
  isLoading,
  isAnyLoading,
  onAction,
}: {
  actions: QuickAction[];
  cfg: ReturnType<typeof getCategoryConfig>;
  isLoading: (id: string) => boolean;
  isAnyLoading: boolean;
  onAction: (id: string) => void;
}) {
  const addActions = actions.filter((a) => a.type === "add");
  const logAction = actions.find((a) => a.type === "log");

  return (
    <div className="flex items-center gap-2">
      {/* Quick-add chips */}
      <div className="flex flex-1 items-center gap-1.5">
        {addActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={isAnyLoading}
            className={cn(
              "flex-1 rounded-lg border py-1.5 text-center text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-50",
              cfg.activeBg,
              cfg.activeBgDark,
              cfg.metText,
              cfg.metTextDark,
              "border-current/15 hover:opacity-80"
            )}
          >
            {isLoading(action.id) ? (
              <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
            ) : (
              `+${action.amount}`
            )}
          </button>
        ))}
      </div>
      {/* Custom log button */}
      {logAction && (
        <button
          onClick={() => onAction(logAction.id)}
          disabled={isAnyLoading}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            "disabled:pointer-events-none disabled:opacity-50",
            cfg.btnBg,
            cfg.btnHover,
            cfg.btnBgDark,
            cfg.btnHoverDark
          )}
          aria-label="Personalizar quantidade"
        >
          {isLoading(logAction.id) ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}

// Diet: segmented "Cumpri / Não cumpri"
function DietCompactActions({
  card,
  cfg,
  isLoading,
  isAnyLoading,
  onAction,
}: {
  card: TodayCard;
  cfg: ReturnType<typeof getCategoryConfig>;
  isLoading: (id: string) => boolean;
  isAnyLoading: boolean;
  onAction: (id: string) => void;
}) {
  const toggleAction = card.quickActions.find((a) => a.type === "toggle");
  if (!toggleAction) return null;

  const met = card.progress.met;

  return (
    <div className="flex overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => !met && onAction(toggleAction.id)}
        disabled={isAnyLoading}
        className={cn(
          "flex flex-1 items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
          "disabled:pointer-events-none",
          met
            ? cn("text-white", cfg.btnBg, cfg.btnBgDark)
            : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        {isLoading(toggleAction.id) && !met ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <>
            {met && <Check className="h-3.5 w-3.5" />}
            Cumpri
          </>
        )}
      </button>
      <div className="w-px bg-gray-200 dark:bg-gray-700" />
      <button
        onClick={() => met && onAction(toggleAction.id)}
        disabled={isAnyLoading}
        className={cn(
          "flex flex-1 items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
          "disabled:pointer-events-none",
          !met
            ? "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        {isLoading(toggleAction.id) && met ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Nao cumpri"
        )}
      </button>
    </div>
  );
}

// Sleep / Exercise: single "Registar" button
function SingleButtonAction({
  action,
  cfg,
  isLoading,
  isAnyLoading,
  onAction,
}: {
  action: QuickAction;
  cfg: ReturnType<typeof getCategoryConfig>;
  isLoading: (id: string) => boolean;
  isAnyLoading: boolean;
  onAction: (id: string) => void;
}) {
  if (!action) return null;

  return (
    <button
      onClick={() => onAction(action.id)}
      disabled={isAnyLoading}
      className={cn(
        "flex w-full items-center justify-center rounded-lg py-2 text-xs font-medium text-white transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
        "disabled:pointer-events-none disabled:opacity-50",
        cfg.btnBg,
        cfg.btnHover,
        cfg.btnBgDark,
        cfg.btnHoverDark
      )}
    >
      {isLoading(action.id) ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        action.label
      )}
    </button>
  );
}

// ── Period Stats (7d / 30d) ─────────────────────────────

function PeriodStats({ card }: { card: TodayCard }) {
  if (!card.period7d && !card.period30d) return null;

  const isTarget = card.goal.type === "target";

  return (
    <div className="flex items-center gap-0.5 px-3 pt-1 text-[10px] leading-none text-gray-400 dark:text-gray-500">
      {card.period7d && (
        <span>
          Sem: {formatPeriod(card.period7d, isTarget, 7)}
        </span>
      )}
      {card.period7d && card.period30d && (
        <span className="mx-1">·</span>
      )}
      {card.period30d && (
        <span>
          Mes: {formatPeriod(card.period30d, isTarget, 30)}
        </span>
      )}
    </div>
  );
}

function formatPeriod(period: PeriodSummary, isTarget: boolean, totalDays: number): string {
  if (!isTarget) {
    return `${period.count}/${totalDays} dias`;
  }

  const unit = period.unit || "";
  let valueStr: string;

  if (unit === "ml" && period.value >= 1000) {
    valueStr = `${(period.value / 1000).toFixed(1).replace(/\.0$/, "")}L`;
  } else if (period.value >= 1000) {
    valueStr = period.value.toLocaleString() + (unit ? ` ${unit}` : "");
  } else {
    valueStr = period.value.toString() + (unit ? ` ${unit}` : "");
  }

  return `${valueStr} (${period.count}/${totalDays})`;
}

// ── Helpers ──────────────────────────────────────────────

function getGoalLabel(card: TodayCard): string {
  const { goal, category } = card;

  if (goal.type === "binary") {
    if (category === "DIET_CONTROL") return "Cumprir dieta hoje";
    return "Completar hoje";
  }

  if (goal.type === "time_window") {
    return `Deitar ate ${goal.timeWindowEnd}`;
  }

  const target = goal.target || 0;
  const unit = goal.unit || "";
  const formatted = target >= 1000 ? target.toLocaleString() : target.toString();
  return `Meta: ${formatted} ${unit}`;
}

// ── Skeleton ────────────────────────────────────────────

export function TrackableCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-1 h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="px-3 pt-1 pb-2.5">
        <div className="h-8 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
