"use client";

import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import type { MonthlySummary } from "@/lib/types/today";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

interface MonthlySummaryPanelProps {
  summary: MonthlySummary;
}

export function MonthlySummaryPanel({ summary }: MonthlySummaryPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {MONTH_NAMES[summary.month]} {summary.year}
      </h3>

      {/* Per-challenge rows with progress bars */}
      <div className="space-y-2.5">
        {summary.challenges.map((ch) => {
          const cfg = getCategoryConfig(ch.category);
          return (
            <div key={ch.category} className="flex items-center gap-2">
              <cfg.icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
              <span className="w-24 truncate text-sm text-gray-700 dark:text-gray-300">
                {ch.name}
              </span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={cn("absolute inset-y-0 left-0 rounded-full", cfg.barColor, cfg.barColorDark)}
                  style={{ width: `${Math.min(100, ch.percentMet)}%` }}
                />
              </div>
              <span className="w-9 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
                {Math.round(ch.percentMet)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex justify-around border-t border-gray-100 pt-3 dark:border-gray-700/50">
        <StatPill label="XP" value={String(summary.totalXP)} />
        <StatPill label="Dias perfeitos" value={String(summary.perfectDays)} />
        <StatPill label="Melhor sequência" value={String(summary.bestStreak)} />
      </div>
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
