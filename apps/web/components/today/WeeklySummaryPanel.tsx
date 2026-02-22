"use client";

import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import type { WeeklySummary } from "@/lib/types/today";

interface WeeklySummaryPanelProps {
  summary: WeeklySummary;
}

export function WeeklySummaryPanel({ summary }: WeeklySummaryPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Resumo da Semana
      </h3>

      {/* Day dots row */}
      <div className="flex justify-around">
        {summary.days.map((day) => {
          const ratio = day.total > 0 ? day.metCount / day.total : 0;
          return (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "h-3 w-3 rounded-full",
                  day.isFuture && "bg-gray-200 dark:bg-gray-700",
                  !day.isFuture && ratio === 1 && "bg-emerald-500",
                  !day.isFuture && ratio > 0 && ratio < 1 && "bg-amber-400",
                  !day.isFuture && ratio === 0 && "bg-gray-300 dark:bg-gray-600"
                )}
              />
              <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {day.dayOfMonth}
              </span>
            </div>
          );
        })}
      </div>

      {/* Per-challenge rows */}
      <div className="space-y-2">
        {summary.challenges.map((ch) => {
          const cfg = getCategoryConfig(ch.category);
          return (
            <div key={ch.category} className="flex items-center gap-2">
              <cfg.icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
              <div className="flex flex-1 justify-around">
                {ch.daysMet.map((met, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      met ? cfg.barColor : "bg-gray-200 dark:bg-gray-700",
                      met && cfg.barColorDark
                    )}
                  />
                ))}
              </div>
              <span className="w-8 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {ch.metCount}/{ch.totalDays}
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex justify-around border-t border-gray-100 pt-3 dark:border-gray-700/50">
        <StatPill label="XP" value={String(summary.totalXP)} />
        <StatPill label="Dias perfeitos" value={String(summary.perfectDays)} />
        <StatPill
          label="Meta"
          value={`${Math.round(summary.percentMet)}%`}
        />
      </div>

      {/* Bonus text */}
      {(summary.weeklyGoalBonusXP > 0 || summary.perfectWeekBonusXP > 0) && (
        <p className="text-center text-xs font-semibold text-amber-500">
          {summary.weeklyGoalBonusXP > 0 &&
            `Bônus semanal: +${summary.weeklyGoalBonusXP} XP  `}
          {summary.perfectWeekBonusXP > 0 &&
            `Semana perfeita: +${summary.perfectWeekBonusXP} XP`}
        </p>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg font-semibold text-sky-500 dark:text-sky-400">
        {value}
      </span>
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        {label}
      </span>
    </div>
  );
}
