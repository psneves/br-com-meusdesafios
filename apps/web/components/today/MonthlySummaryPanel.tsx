"use client";

import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import type { MonthlySummary } from "@/lib/types/today";

const WEEKDAY_LABELS = ["S", "T", "Q", "Q", "S", "S", "D"];

interface MonthlySummaryPanelProps {
  summary: MonthlySummary;
}

export function MonthlySummaryPanel({ summary }: MonthlySummaryPanelProps) {
  const firstDay = new Date(summary.year, summary.month, 1);
  const startDow = firstDay.getDay(); // 0=Sun
  const startOffset = startDow === 0 ? 6 : startDow - 1; // Mon=0..Sun=6

  const totalSlots = startOffset + summary.daysInMonth;
  const totalWeeks = Math.ceil(totalSlots / 7);

  return (
    <div className="space-y-2.5">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <KpiCell
          value={`${summary.percentMet}`}
          suffix="%"
          label="Realizado"
          color="text-red-500 dark:text-red-400"
        />
        <KpiCell
          value={`${summary.perfectDays}`}
          suffix="d"
          label="Dia Perfeito"
          color="text-blue-500 dark:text-blue-400"
        />
        <KpiCell
          value={`${summary.totalDone}`}
          label="Total Feito"
          color="text-teal-500 dark:text-teal-400"
        />
        <KpiCell
          value={`${summary.bestStreak}`}
          suffix="d"
          label="Melhor Série"
          color="text-orange-500 dark:text-orange-400"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700/50" />

      {/* Shared weekday header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((label, i) => (
          <span
            key={i}
            className="text-[10px] font-medium text-gray-400 dark:text-gray-500"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Per-challenge calendar */}
      {summary.challenges.map((ch) => {
        const cfg = getCategoryConfig(ch.category);
        return (
          <div key={ch.category} className="space-y-1">
            {/* Challenge header with inline stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <cfg.icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
                  {ch.name}
                </span>
              </div>
              <span className="text-[10px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
                {ch.percentMet}% &middot; {ch.metCount}/{ch.totalDays}d
              </span>
            </div>

            {/* Calendar grid */}
            {Array.from({ length: totalWeeks }).map((_, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, colIdx) => {
                  const slotIdx = weekIdx * 7 + colIdx;
                  const dayNum = slotIdx - startOffset + 1;

                  if (dayNum < 1 || dayNum > summary.daysInMonth) {
                    return <span key={colIdx} className="h-6" />;
                  }

                  const isFuture = dayNum >= summary.futureDayStart;
                  const met = ch.daysMet[dayNum - 1];
                  const isSelected = dayNum === summary.selectedDay;

                  return (
                    <div key={colIdx} className="flex justify-center">
                      <span
                        className={cn(
                          "flex h-6 w-6 items-center justify-center rounded text-[9px] font-semibold tabular-nums",
                          isFuture && "bg-gray-100 text-gray-300 dark:bg-gray-700/40 dark:text-gray-600",
                          !isFuture && met && cfg.barColor + " text-white",
                          !isFuture && met && cfg.barColorDark,
                          !isFuture && !met && "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500",
                          isSelected && "ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900"
                        )}
                      >
                        {dayNum}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}

    </div>
  );
}

function KpiCell({
  value,
  suffix,
  label,
  color,
}: {
  value: string;
  suffix?: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-baseline gap-0.5">
        <span className={cn("text-xl font-extrabold tabular-nums leading-none", color)}>
          {value}
        </span>
        {suffix && (
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            {suffix}
          </span>
        )}
      </div>
      <span className="mt-0.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">
        {label}
      </span>
    </div>
  );
}
