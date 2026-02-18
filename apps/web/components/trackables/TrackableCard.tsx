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
        "grid rounded-2xl border bg-white p-phi-3 dark:bg-gray-900",
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
      style={{ gridTemplateColumns: "48px 1fr auto" }}
    >
      {/* Left zone: category icon */}
      <div className="flex items-start pt-0.5">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            cfg.activeBg,
            cfg.activeBgDark
          )}
        >
          <Icon className={cn("h-5 w-5", cfg.color)} />
        </div>
      </div>

      {/* Middle zone: content */}
      <div className="min-w-0 space-y-1">
        {/* Row 1: Name + check + streak + points (all inline) */}
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
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <StreakBadge current={card.streak.current} showBest={false} />
            <PointsChip points={card.pointsToday} size="sm" />
          </div>
        </div>

        {/* Row 2: Goal subtitle OR exercise breakdown (same row, no height change) */}
        {card.category === "PHYSICAL_EXERCISE" &&
        card.breakdown &&
        card.breakdown.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-hidden">
            {card.breakdown.map((entry, i) => (
              <span
                key={`${entry.actionId}-${i}`}
                className={cn(
                  "shrink-0 text-[10px] font-medium leading-tight",
                  cfg.metText,
                  cfg.metTextDark
                )}
              >
                {entry.label} {entry.value}′
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[10px] leading-tight text-gray-400 dark:text-gray-500">
            {goalLabel}
          </p>
        )}

        {/* Row 3: Progress bar (target-type only) */}
        {card.goal.type === "target" && (
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
        )}
      </div>

      {/* Right zone: plus button only */}
      <div className="flex items-center pl-2">
        <button
          onClick={onRegister}
          aria-label={`Registrar ${card.name}`}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full text-white transition-all active:scale-90",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
            cfg.btnBg,
            cfg.btnHover,
            cfg.btnBgDark,
            cfg.btnHoverDark
          )}
        >
          <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
        </button>
      </div>
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
    <div
      className="animate-pulse grid rounded-2xl border border-gray-200 bg-white p-phi-3 dark:border-gray-800 dark:bg-gray-900"
      style={{ gridTemplateColumns: "48px 1fr auto" }}
    >
      {/* Left: icon placeholder */}
      <div className="flex items-start pt-0.5">
        <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* Middle: text + bar */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="ml-auto h-4 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="ml-auto h-2.5 w-14 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      {/* Right: button only */}
      <div className="flex items-center pl-2">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}
