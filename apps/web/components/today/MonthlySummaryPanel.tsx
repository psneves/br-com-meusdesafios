"use client";

import { Star } from "lucide-react";
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

      {/* Unified calendar with multi-challenge dots per day */}
      <div>
        {/* Weekday header */}
        <div className="mb-1 grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label, i) => (
            <span
              key={i}
              className="text-[10px] font-medium text-gray-400 dark:text-gray-500"
            >
              {label}
            </span>
          ))}
        </div>

        {/* Calendar weeks */}
        <div className="space-y-1">
          {Array.from({ length: totalWeeks }).map((_, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, colIdx) => {
                const slotIdx = weekIdx * 7 + colIdx;
                const dayNum = slotIdx - startOffset + 1;

                if (dayNum < 1 || dayNum > summary.daysInMonth) {
                  return <span key={colIdx} className="h-10" />;
                }

                const isFuture = dayNum >= summary.futureDayStart;
                const isSelected = dayNum === summary.selectedDay;

                // Collect met status per challenge for this day
                const challengeDots = summary.challenges.map((ch) => ({
                  category: ch.category,
                  met: ch.daysMet[dayNum - 1],
                }));

                const allMet = !isFuture && challengeDots.every((d) => d.met);

                return (
                  <div
                    key={colIdx}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg py-0.5",
                      isFuture && "opacity-40",
                      isSelected && "ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-gray-900",
                      allMet && !isFuture && "bg-emerald-50 dark:bg-emerald-900/15"
                    )}
                  >
                    {/* Day number */}
                    <span
                      className={cn(
                        "text-[10px] font-semibold tabular-nums leading-tight",
                        isFuture && "text-gray-300 dark:text-gray-600",
                        !isFuture && "text-gray-600 dark:text-gray-400",
                        isSelected && "text-indigo-600 dark:text-indigo-400"
                      )}
                    >
                      {dayNum}
                    </span>
                    {/* 2x2 challenge dot grid */}
                    <div className="mt-0.5 grid grid-cols-2 gap-[3px]">
                      {challengeDots.map((dot) => {
                        const cfg = getCategoryConfig(dot.category);
                        return (
                          <span
                            key={dot.category}
                            className={cn(
                              "h-2 w-2 rounded-full",
                              isFuture && "bg-gray-200 dark:bg-gray-700/50",
                              !isFuture && dot.met && cfg.barColor,
                              !isFuture && dot.met && cfg.barColorDark,
                              !isFuture && !dot.met && "bg-gray-200 dark:bg-gray-700"
                            )}
                          />
                        );
                      })}
                    </div>
                    {/* Perfect day star */}
                    {allMet && (
                      <Star className="mt-0.5 h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700/50" />

      {/* Challenge legend + stats */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {summary.challenges.map((ch) => {
          const cfg = getCategoryConfig(ch.category);
          return (
            <div key={ch.category} className="flex items-center gap-1.5">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", cfg.barColor, cfg.barColorDark)} />
              <cfg.icon className={cn("h-3 w-3 shrink-0", cfg.color)} />
              <span className="truncate text-[11px] text-gray-600 dark:text-gray-400">
                {ch.name}
              </span>
              <span className="ml-auto shrink-0 text-[10px] font-medium tabular-nums text-gray-400 dark:text-gray-500">
                {ch.metCount}/{ch.totalDays}
              </span>
            </div>
          );
        })}
      </div>
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
