"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronRight, AlertCircle, Plus, Minus, Loader2 } from "lucide-react";
import { StreakBadge } from "./StreakBadge";
import { PointsChip } from "./PointsChip";
import { getCategoryConfig } from "@/lib/category-config";
import type { TodayCard, QuickAction } from "@/lib/types/today";
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
      <div className="flex items-center gap-2 px-3 pt-2 pb-0.5">
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
          <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
            {goalLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StreakBadge current={card.streak.current} showBest={false} />
          <PointsChip points={card.pointsToday} showZero size="sm" />
        </div>
      </div>

      {/* Progress bar (only for target-type goals) */}
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
            isSleep={card.category === "SLEEP"}
          />
        </div>
      )}

      {/* Compact action row — category-specific */}
      <div className="px-3 pt-1 pb-2">
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

      {/* Footer: details link only */}
      {onViewDetails && (
        <div className="flex items-center justify-end border-t border-gray-100 px-3 dark:border-gray-800">
          <button
            onClick={onViewDetails}
            className="inline-flex min-h-[44px] shrink-0 items-center gap-0.5 text-[11px] font-medium text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded dark:text-gray-500 dark:hover:text-gray-300"
          >
            Detalhes
            <ChevronRight className="h-3 w-3" />
          </button>
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
  isSleep = false,
}: {
  value: number;
  target: number;
  unit: string;
  met: boolean;
  percentage: number;
  accentColor: string;
  metTextClass: string;
  isSleep?: boolean;
}) {
  const fmt = (v: number) => {
    if (isSleep) return formatMinAsHours(v);
    return v >= 1000 ? v.toLocaleString("pt-BR") : v % 1 !== 0 ? v.toFixed(1) : v.toString();
  };

  const displayUnit = isSleep ? "" : unit;

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
          {fmt(value)} / {fmt(target)}{displayUnit ? ` ${displayUnit}` : ""}
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
        <AddChipActions
          actions={card.quickActions}
          cfg={cfg}
          isLoading={isLoading}
          isAnyLoading={isAnyLoading}
          onAction={onAction}
        />
      );
    case "DIET_CONTROL":
      return (
        <DietMealActions
          card={card}
          cfg={cfg}
          loadingActionId={loadingActionId}
          onAction={onAction}
        />
      );
    case "SLEEP":
      return (
        <SleepCompactActions
          actions={card.quickActions}
          cfg={cfg}
          isLoading={isLoading}
          isAnyLoading={isAnyLoading}
          onAction={onAction}
        />
      );
    case "PHYSICAL_EXERCISE":
      return (
        <ExerciseCompactActions
          card={card}
          cfg={cfg}
          loadingActionId={loadingActionId}
          onAction={onAction}
        />
      );
    default:
      return null;
  }
}

// ── Add Chip Actions (Water) ─────────────────────────────

function AddChipActions({
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

  return (
    <div className="flex items-center gap-1.5">
      {addActions.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          disabled={isAnyLoading}
          aria-label={`Adicionar ${action.amount} ${action.unit || "ml"}`}
          className={cn(
            "flex-1 rounded-lg border py-1.5 text-center text-xs font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            "disabled:pointer-events-none disabled:opacity-50",
            "active:scale-[0.97]",
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
  );
}

// ── Diet Meal Actions (5 meal circles) ───────────────────

type MealState = "neutral" | "success" | "fail";

const MEAL_LABELS = ["Café", "Lanche", "Almoço", "Lanche", "Jantar"];

function DietMealActions({
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
  const breakdownToMeals = (card: TodayCard): MealState[] => {
    if (card.breakdown?.length === 5) {
      return card.breakdown.map((b) => {
        if (b.value === 1) return "success" as MealState;
        if (b.value === -1) return "fail" as MealState;
        return "neutral" as MealState;
      });
    }
    const successCount = Math.min(Math.max(0, card.progress.value), 5);
    return Array.from({ length: 5 }, (_, i) =>
      i < successCount ? "success" as MealState : "neutral" as MealState
    );
  };

  const [meals, setMeals] = useState<MealState[]>(() => breakdownToMeals(card));

  // Sync when card data changes (date navigation)
  useEffect(() => {
    setMeals(breakdownToMeals(card));
  }, [card.breakdown, card.progress.value]);

  const isAnyLoading = !!loadingActionId;

  const cycleMeal = (index: number) => {
    if (isAnyLoading) return;

    setMeals((prev) => {
      const current = prev[index];
      let next: MealState;
      let delta = 0;

      if (current === "neutral") {
        next = "success";
        delta = 1;
      } else if (current === "success") {
        next = "fail";
        delta = -1;
      } else {
        next = "neutral";
        delta = 0;
      }

      const updated = [...prev];
      updated[index] = next;

      if (delta !== 0) {
        onAction(`diet-meal-delta-${delta}`);
      }

      return updated;
    });
  };

  return (
    <div className="flex items-end justify-between">
      {meals.map((state, i) => (
        <button
          key={i}
          onClick={() => cycleMeal(i)}
          disabled={isAnyLoading}
          className="flex flex-col items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded-full disabled:pointer-events-none disabled:opacity-50"
          aria-label={`${MEAL_LABELS[i]}: ${state === "neutral" ? "não registrado" : state === "success" ? "cumprido" : "não cumprido"}`}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-all",
              state === "neutral" &&
                "border-2 border-dashed border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-500",
              state === "success" &&
                cn("text-white shadow-sm", cfg.btnBg, cfg.btnBgDark),
              state === "fail" &&
                "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400"
            )}
          >
            {state === "neutral" && (
              <span className="text-[11px] font-medium">{i + 1}</span>
            )}
            {state === "success" && <Check className="h-4 w-4" strokeWidth={2.5} />}
            {state === "fail" && <X className="h-4 w-4" strokeWidth={2.5} />}
          </div>
          <span className="text-[9px] leading-none text-gray-500 dark:text-gray-400">
            {MEAL_LABELS[i]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Sleep Compact Actions ([6:30] [7:00] [-] [+]) ──────

function SleepCompactActions({
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
  const presets = actions.filter((a) => a.label !== "+" && a.label !== "\u2212");
  const plusAction = actions.find((a) => a.label === "+");
  const minusAction = actions.find((a) => a.label === "\u2212");

  return (
    <div className="flex items-center gap-1.5">
      {presets.map((action) => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          disabled={isAnyLoading}
          aria-label={`Registrar ${action.label} horas de sono`}
          className={cn(
            "flex-1 rounded-lg border py-1.5 text-center text-xs font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            "disabled:pointer-events-none disabled:opacity-50",
            "active:scale-[0.97]",
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
            action.label
          )}
        </button>
      ))}
      {minusAction && (
        <button
          onClick={() => onAction(minusAction.id)}
          disabled={isAnyLoading}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            "disabled:pointer-events-none disabled:opacity-50",
            "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
            "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
          aria-label="Menos 30 minutos"
        >
          {isLoading(minusAction.id) ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Minus className="h-3.5 w-3.5" />
          )}
        </button>
      )}
      {plusAction && (
        <button
          onClick={() => onAction(plusAction.id)}
          disabled={isAnyLoading}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            "disabled:pointer-events-none disabled:opacity-50",
            "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
            "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
          aria-label="Mais 30 minutos"
        >
          {isLoading(plusAction.id) ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </div>
  );
}

// ── Exercise Compact Actions ────────────────────────────

const EXERCISE_MODALITIES = [
  { id: "CYCLING", label: "Bike" },
  { id: "RUN", label: "Corrida" },
  { id: "GYM", label: "Muscula\u00e7\u00e3o" },
  { id: "SWIM", label: "Nata\u00e7\u00e3o" },
] as const;

const MIN_EXERCISE_MINUTES = 5;
const MAX_EXERCISE_MINUTES = 120;
const EXERCISE_STEP = 5;

interface ExerciseLogEntry {
  modality: string;
  label: string;
  minutes: number;
}

function ExerciseCompactActions({
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
  const ACTION_TO_MODALITY: Record<string, { id: string; label: string }> = {
    "exercise-gym": { id: "GYM", label: "Muscula\u00e7\u00e3o" },
    "exercise-run": { id: "RUN", label: "Corrida" },
    "exercise-cycling": { id: "CYCLING", label: "Bike" },
    "exercise-swim": { id: "SWIM", label: "Nata\u00e7\u00e3o" },
  };

  const [selectedModality, setSelectedModality] = useState<string | null>(null);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const breakdownToLogs = (breakdown?: typeof card.breakdown): ExerciseLogEntry[] => {
    if (!breakdown?.length) return [];
    return breakdown.map((b) => {
      const mod = ACTION_TO_MODALITY[b.actionId];
      return {
        modality: mod?.id ?? b.actionId,
        label: mod?.label ?? b.label,
        minutes: b.value,
      };
    });
  };

  const [logs, setLogs] = useState<ExerciseLogEntry[]>(() => breakdownToLogs(card.breakdown));

  // Sync logs when card data changes (date navigation)
  useEffect(() => {
    setLogs(breakdownToLogs(card.breakdown));
  }, [card.breakdown]);

  const isAnyLoading = !!loadingActionId;
  const actionId = `exercise-${selectedModality}-${selectedMinutes}`;

  const handleRegister = () => {
    if (!selectedModality) return;
    const mod = EXERCISE_MODALITIES.find((m) => m.id === selectedModality);
    if (mod) {
      setLogs((prev) => [...prev, { modality: mod.id, label: mod.label, minutes: selectedMinutes }]);
    }
    onAction(actionId);
  };

  const canDecrement = selectedMinutes > MIN_EXERCISE_MINUTES;
  const canIncrement = selectedMinutes < MAX_EXERCISE_MINUTES;

  return (
    <div className="space-y-1">
      {/* Logged entries */}
      {logs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {logs.map((entry, i) => (
            <span
              key={`${entry.modality}-${entry.minutes}-${i}`}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                cfg.activeBg, cfg.activeBgDark, cfg.metText, cfg.metTextDark
              )}
            >
              {entry.label} {entry.minutes} min
            </span>
          ))}
        </div>
      )}

      {/* Modality selector */}
      <div>
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Modalidade
        </p>
        <div className="flex gap-1">
          {EXERCISE_MODALITIES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModality(m.id)}
              disabled={isAnyLoading}
              aria-label={`Selecionar ${m.label}`}
              aria-pressed={selectedModality === m.id}
              className={cn(
                "flex-1 rounded-md py-1.5 text-center text-[10px] font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                "disabled:pointer-events-none disabled:opacity-50",
                "active:scale-[0.97]",
                selectedModality === m.id
                  ? cn("text-white", cfg.btnBg, cfg.btnBgDark)
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration stepper + Registrar */}
      <div>
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Duração
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedMinutes((v) => Math.max(MIN_EXERCISE_MINUTES, v - EXERCISE_STEP))}
            disabled={isAnyLoading || !canDecrement}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-40",
              "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
            aria-label="Diminuir duração"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[3rem] text-center text-xs font-semibold tabular-nums text-gray-900 dark:text-white">
            {selectedMinutes} min
          </span>
          <button
            onClick={() => setSelectedMinutes((v) => Math.min(MAX_EXERCISE_MINUTES, v + EXERCISE_STEP))}
            disabled={isAnyLoading || !canIncrement}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-40",
              "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            )}
            aria-label="Aumentar duração"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={handleRegister}
            disabled={!selectedModality || isAnyLoading}
            className={cn(
              "ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              "disabled:pointer-events-none disabled:opacity-50",
              cfg.btnBg,
              cfg.btnHover,
              cfg.btnBgDark,
              cfg.btnHoverDark
            )}
          >
            {loadingActionId === actionId ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Registrar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────

function formatMinAsHours(min: number): string {
  if (min <= 0) return "0 h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

function getGoalLabel(card: TodayCard): string {
  const { goal, category } = card;

  if (goal.type === "binary") {
    if (category === "DIET_CONTROL") return "Cumprir dieta hoje";
    return "Completar hoje";
  }

  if (goal.type === "time_window") {
    return `Deitar at\u00e9 ${goal.timeWindowEnd}`;
  }

  // Target type
  const target = goal.target || 0;
  const unit = goal.unit || "";

  if (category === "SLEEP" && unit === "min") {
    return `Noite passada \u00b7 Meta: ${formatMinAsHours(target)}`;
  }

  if (category === "DIET_CONTROL") {
    return `Meta: ${target} ${unit}/dia`;
  }

  const formatted = target >= 1000 ? target.toLocaleString("pt-BR") : target.toString();
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
