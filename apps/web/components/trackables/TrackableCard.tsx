"use client";

import { Check, Plus } from "lucide-react";
import { StreakBadge } from "./StreakBadge";
import { PointsChip } from "./PointsChip";
import { getCategoryConfig } from "@/lib/category-config";
import type { TodayCard } from "@/lib/types/today";
import { cn } from "@/lib/utils";

// ── Card ─────────────────────────────────────────────────

interface TrackableCardProps {
  card: TodayCard;
  onRegister: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function TrackableCard({
  card,
  onRegister,
  onViewDetails: _onViewDetails,
  className,
}: TrackableCardProps) {
  const cfg = getCategoryConfig(card.category);
  const Icon = cfg.icon;

  const goalLabel = getGoalLabel(card);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border bg-white dark:bg-gray-900",
        card.progress.met
          ? cn(
              "border-l-[3px]",
              cfg.borderAccent,
              cfg.bgLight,
              cfg.bgDark,
              "border-gray-200/80 dark:border-gray-700/40"
            )
          : cn("border-l-2", cfg.borderAccent, "border-gray-200 dark:border-gray-800"),
        className
      )}
    >
      {/* Header: icon + name + goal | streak + points + register */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-0.5">
        <Icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
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
          <p className="text-[10px] leading-tight text-gray-400 dark:text-gray-500">
            {goalLabel}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <StreakBadge current={card.streak.current} showBest={false} />
          <PointsChip points={card.pointsToday} size="sm" />
          <button
            onClick={onRegister}
            aria-label="Registrar"
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-white transition-all active:scale-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              cfg.btnBg,
              cfg.btnHover,
              cfg.btnBgDark,
              cfg.btnHoverDark
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Progress bar — target-based cards */}
      {card.goal.type === "target" && (
        <div className="px-3 pt-1 pb-2">
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

      {/* Exercise breakdown chips (read-only) */}
      {card.category === "PHYSICAL_EXERCISE" &&
        card.breakdown &&
        card.breakdown.length > 0 && (
          <div className="flex flex-wrap gap-1 px-3 pt-1 pb-2">
            {card.breakdown.map((entry, i) => (
              <span
                key={`${entry.actionId}-${i}`}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  cfg.activeBg,
                  cfg.activeBgDark,
                  cfg.metText,
                  cfg.metTextDark
                )}
              >
                {entry.label} {entry.value}′
              </span>
            ))}
          </div>
        )}

      {/* Bottom padding for cards without progress bar */}
      {card.goal.type !== "target" &&
        !(card.category === "PHYSICAL_EXERCISE" && card.breakdown && card.breakdown.length > 0) && (
          <div className="pb-1" />
        )}
    </div>
  );
}

// ── Compact Progress ────────────────────────────────────

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
  const displayPct = met ? 100 : percentage;

  return (
    <div className="space-y-0.5">
      {/* Progress bar */}
      <div
        className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
        role="progressbar"
        aria-valuenow={Math.min(100, displayPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progresso: ${fmt(value)} de ${fmt(target)}${displayUnit ? ` ${displayUnit}` : ""}`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", accentColor)}
          style={{ width: `${Math.min(100, displayPct)}%` }}
        />
      </div>
      {/* Labels below bar */}
      <div className="flex items-center">
        <span
          className={cn(
            "ml-auto text-[10px] font-medium tabular-nums",
            met ? metTextClass : "text-gray-400 dark:text-gray-500"
          )}
        >
          {fmt(value)} / {fmt(target)}{displayUnit ? ` ${displayUnit}` : ""}
        </span>
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
    if (category === "DIET_CONTROL") return "Dieta hoje";
    return "Completar";
  }

  if (goal.type === "time_window") {
    return `Até ${goal.timeWindowEnd}`;
  }

  const target = goal.target || 0;
  const unit = goal.unit || "";

  if (category === "SLEEP" && unit === "min") {
    return `Dormir ${formatMinAsHours(target)} na noite anterior`;
  }

  if (category === "DIET_CONTROL") {
    return `Seguir plano nas ${target} refeições`;
  }

  if (category === "PHYSICAL_EXERCISE") {
    return `Exercitar-se por ${target}${unit}`;
  }

  if (category === "WATER") {
    const formatted = target >= 1000 ? target.toLocaleString("pt-BR") : target.toString();
    return `Beber ${formatted}${unit}`;
  }

  const formatted = target >= 1000 ? target.toLocaleString("pt-BR") : target.toString();
  return `${formatted} ${unit}`;
}

// ── Skeleton ────────────────────────────────────────────

export function TrackableCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-3.5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-1 h-2.5 w-14 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-5 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
