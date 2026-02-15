"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import type { WeeklySummary } from "@/lib/types/today";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

interface WeeklySummaryPanelProps {
  summary: WeeklySummary;
}

export function WeeklySummaryPanel({ summary }: WeeklySummaryPanelProps) {
  const selectedIdx = summary.days.findIndex((d) => d.isSelected);
  const rowCount = summary.challenges.length;

  return (
    <div className="space-y-3">
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

      {/* Day strip */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Day labels */}
        {DAY_LABELS.map((label) => (
          <span
            key={label}
            className="text-[10px] font-medium text-gray-400 dark:text-gray-500"
          >
            {label}
          </span>
        ))}
        {/* Date numbers + dots */}
        {summary.days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-0.5">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                day.isFuture && "text-gray-300 dark:text-gray-600",
                !day.isFuture && !day.isSelected && "text-gray-700 dark:text-gray-300",
                day.isSelected && "ring-2 ring-indigo-400 text-indigo-600 dark:text-indigo-400"
              )}
            >
              {day.dayOfMonth}
            </span>
            <DayDot
              metCount={day.metCount}
              total={day.total}
              isFuture={day.isFuture}
            />
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 dark:border-gray-700/50" />

      {/* Per-challenge rows — CSS grid for column alignment + vertical highlight */}
      <div
        className="grid items-center gap-y-2"
        style={{
          gridTemplateColumns: "1rem 6.5rem repeat(7, 1fr) 2.5rem",
        }}
      >
        {/* Vertical pill highlight for selected day */}
        {selectedIdx >= 0 && (
          <div
            className="pointer-events-none z-0 justify-self-center rounded-full bg-indigo-50 dark:bg-indigo-900/25"
            style={{
              gridColumn: selectedIdx + 3,
              gridRow: `1 / ${rowCount + 1}`,
              width: "1.5rem",
              height: "100%",
              paddingTop: "0.125rem",
              paddingBottom: "0.125rem",
            }}
          />
        )}

        {/* Challenge rows */}
        {summary.challenges.map((ch, rowIdx) => {
          const cfg = getCategoryConfig(ch.category);
          const row = rowIdx + 1;

          return (
            <Fragment key={ch.category}>
              {/* Icon */}
              <div
                className="z-10 flex justify-center"
                style={{ gridRow: row, gridColumn: 1 }}
              >
                <cfg.icon className={cn("h-4 w-4 shrink-0", cfg.color)} />
              </div>

              {/* Name */}
              <span
                className="z-10 truncate text-xs font-medium text-gray-700 dark:text-gray-300"
                style={{ gridRow: row, gridColumn: 2 }}
              >
                {ch.name}
              </span>

              {/* 7 day dots */}
              {ch.daysMet.map((met, i) => {
                const isFuture = summary.days[i].isFuture;
                return (
                  <div
                    key={i}
                    className="z-10 flex justify-center"
                    style={{ gridRow: row, gridColumn: i + 3 }}
                  >
                    <span
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        isFuture && "bg-gray-100 dark:bg-gray-700/50",
                        !isFuture && met && cfg.barColor,
                        !isFuture && met && cfg.barColorDark,
                        !isFuture && !met && "bg-gray-200 dark:bg-gray-700"
                      )}
                    />
                  </div>
                );
              })}

              {/* Count */}
              <span
                className="z-10 text-right text-[11px] tabular-nums font-medium text-gray-500 dark:text-gray-400"
                style={{ gridRow: row, gridColumn: 10 }}
              >
                {ch.metCount}/{ch.totalDays}
              </span>
            </Fragment>
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

function DayDot({
  metCount,
  total,
  isFuture,
}: {
  metCount: number;
  total: number;
  isFuture: boolean;
}) {
  if (isFuture) {
    return (
      <span className="h-2 w-2 rounded-full bg-gray-200 dark:bg-gray-700" />
    );
  }
  if (metCount === total) {
    return <span className="h-2 w-2 rounded-full bg-emerald-500" />;
  }
  if (metCount > 0) {
    return <span className="h-2 w-2 rounded-full bg-amber-400" />;
  }
  return (
    <span className="h-2 w-2 rounded-full border border-gray-300 dark:border-gray-600" />
  );
}
