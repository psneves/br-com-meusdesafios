"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronDown, Info, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { WeeklySummaryPanel } from "@/components/today/WeeklySummaryPanel";
import { MonthlySummaryPanel } from "@/components/today/MonthlySummaryPanel";
import type { WeeklySummary, MonthlySummary } from "@/lib/types/today";

interface TodayHeaderProps {
  greeting: string;
  date: string;
  userName?: string;
  avatarUrl?: string;
  totalPoints: number;
  pointsWeek: number;
  pointsMonth: number;
  selectedDate: Date;
  isToday?: boolean;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  weekSummary?: WeeklySummary;
  monthSummary?: MonthlySummary;
  onKpiChange?: (kpi: "week" | "month" | null) => void;
  className?: string;
}

function getDayLabel(selected: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sel = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const diffMs = today.getTime() - sel.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";

  if (diffDays <= 6) {
    const wd = sel.toLocaleDateString("pt-BR", { weekday: "long" });
    const capitalized = wd.charAt(0).toUpperCase() + wd.slice(1);
    return capitalized.split("-")[0];
  }

  return `${sel.getDate()}/${sel.getMonth() + 1}`;
}

export function TodayHeader({
  greeting,
  date,
  userName,
  avatarUrl,
  totalPoints,
  pointsWeek,
  pointsMonth,
  selectedDate,
  isToday = true,
  onPrevDay,
  onNextDay,
  weekSummary,
  monthSummary,
  onKpiChange,
  className,
}: TodayHeaderProps) {
  const [showPointsInfo, setShowPointsInfo] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [expandedKpi, setExpandedKpi] = useState<"week" | "month" | null>(null);
  const dayLabel = getDayLabel(selectedDate);

  const toggleKpi = (kpi: "week" | "month") => {
    setExpandedKpi((prev) => {
      const next = prev === kpi ? null : kpi;
      onKpiChange?.(next);
      return next;
    });
  };

  // Mock detail data derived from points
  const weekGoalsMet = pointsWeek > 0 ? Math.ceil(pointsWeek / 10) : 0;
  const monthGoalsMet = pointsMonth > 0 ? Math.ceil(pointsMonth / 10) : 0;

  return (
    <header className={cn("space-y-3 pt-2", className)}>
      {/* Top row: avatar + greeting (left)  |  day nav (right) */}
      <div className="flex items-center">
        {/* Avatar + greeting */}
        <div className="flex min-w-0 items-center gap-phi-3">
          {!avatarUrl || avatarError ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
          ) : (
            <Image
              src={avatarUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-gray-800"
              onError={() => setAvatarError(true)}
            />
          )}
          <div className="min-w-0">
            {userName && (
              <p className="truncate text-[15px] font-bold leading-tight text-gray-900 dark:text-white">
                {userName}
              </p>
            )}
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{date}</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Day navigation pill */}
        <div className="flex items-center gap-1 rounded-full bg-white px-1 py-1 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800/60 dark:ring-gray-700/50">
          {onPrevDay && (
            <button
              onClick={onPrevDay}
              className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="w-[7rem] text-center text-sm font-semibold text-gray-900 dark:text-white">
            {greeting}
          </span>
          {onNextDay && (
            <button
              onClick={onNextDay}
              disabled={isToday}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
                isToday
                  ? "cursor-not-allowed text-gray-200 dark:text-gray-700"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              )}
              aria-label="Dia seguinte"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* XP Summary — single container */}
      <div className="rounded-2xl bg-gray-50 p-phi-2 dark:bg-gray-800/30">
        <div className="grid gap-phi-2" style={{ gridTemplateColumns: "1.618fr 1fr 1fr" }}>
          {/* Primary: Pontos hoje */}
          <button
            onClick={() => {
              if (expandedKpi) {
                setExpandedKpi(null);
                onKpiChange?.(null);
              } else {
                setShowPointsInfo(true);
              }
            }}
            className="flex min-h-[60px] flex-col items-center justify-center rounded-2xl bg-indigo-50 px-phi-2 py-phi-3 transition-colors hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40"
            aria-label={`${totalPoints} XP ${dayLabel}. Toque para saber mais`}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold tabular-nums leading-none text-indigo-600 dark:text-indigo-400">
                {totalPoints}
              </span>
              <span className="text-sm font-bold text-indigo-500/80 dark:text-indigo-400/70">XP</span>
              <Info className="mb-auto mt-0.5 h-3 w-3 text-indigo-400/50 dark:text-indigo-500/50" />
            </div>
            <span className="mt-1 text-[11px] font-medium leading-none text-indigo-500/80 dark:text-indigo-400/70">
              {dayLabel}
            </span>
          </button>
          {/* Secondary: Semana */}
          <button
            onClick={() => toggleKpi("week")}
            className="flex min-h-[60px] flex-col items-center justify-center rounded-2xl bg-white/80 px-phi-2 py-phi-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:bg-gray-900/40"
            aria-label={`${pointsWeek} XP na semana`}
            aria-expanded={expandedKpi === "week"}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tabular-nums leading-none text-gray-800 dark:text-gray-100">
                {pointsWeek}
              </span>
              <span className="text-sm font-bold text-gray-400 dark:text-gray-500">XP</span>
            </div>
            <span className="mt-1 flex items-center gap-0.5 text-[11px] font-medium leading-none text-gray-400 dark:text-gray-500">
              Semana
              <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", expandedKpi === "week" && "rotate-180")} />
            </span>
          </button>
          {/* Secondary: Mês */}
          <button
            onClick={() => toggleKpi("month")}
            className="flex min-h-[60px] flex-col items-center justify-center rounded-2xl bg-white/80 px-phi-2 py-phi-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 dark:bg-gray-900/40"
            aria-label={`${pointsMonth} XP no mês`}
            aria-expanded={expandedKpi === "month"}
          >
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold tabular-nums leading-none text-gray-800 dark:text-gray-100">
                {pointsMonth}
              </span>
              <span className="text-sm font-bold text-gray-400 dark:text-gray-500">XP</span>
            </div>
            <span className="mt-1 flex items-center gap-0.5 text-[11px] font-medium leading-none text-gray-400 dark:text-gray-500">
              Mês
              <ChevronDown className={cn("h-2.5 w-2.5 transition-transform", expandedKpi === "month" && "rotate-180")} />
            </span>
          </button>
        </div>
      </div>

      {/* Expanded KPI detail */}
      {expandedKpi && (
        <div className="rounded-xl bg-gray-50 px-phi-3 py-phi-3 dark:bg-gray-800/40">
          {expandedKpi === "week" && weekSummary ? (
            <WeeklySummaryPanel summary={weekSummary} />
          ) : expandedKpi === "week" ? (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {weekGoalsMet} {weekGoalsMet === 1 ? "meta batida" : "metas batidas"}
              </span>
              <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                {pointsWeek} XP
              </span>
            </div>
          ) : expandedKpi === "month" && monthSummary ? (
            <MonthlySummaryPanel summary={monthSummary} />
          ) : (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                {monthGoalsMet} {monthGoalsMet === 1 ? "meta batida" : "metas batidas"}
              </span>
              <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-300">
                {pointsMonth} XP
              </span>
            </div>
          )}
        </div>
      )}

      {/* Points explanation modal */}
      <Modal
        isOpen={showPointsInfo}
        onClose={() => setShowPointsInfo(false)}
        title="Como funciona o XP"
      >
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              XP diário
            </h3>
            <p>
              Ao bater a meta do dia em qualquer desafio, você ganha{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Meta semanal
            </h3>
            <p>
              Complete 7/7 dias de um desafio (Seg–Dom) e ganhe{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>{" "}
              por desafio.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Semana perfeita
            </h3>
            <p>
              Bata <em>todas</em> as metas em <em>todos</em> os 7 dias e ganhe mais{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>{" "}
              de bônus.
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Semana conta de segunda a domingo. Complete seus desafios e acumule XP!
          </p>
        </div>
      </Modal>
    </header>
  );
}

export function TodayHeaderSkeleton() {
  return (
    <header className="animate-pulse space-y-3 pt-2">
      <div className="flex items-center">
        <div className="flex items-center gap-phi-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        <div className="flex-1" />
        <div className="h-8 w-32 rounded-full bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="rounded-2xl bg-gray-50 p-phi-2 dark:bg-gray-800/30">
        <div className="grid gap-phi-2" style={{ gridTemplateColumns: "1.618fr 1fr 1fr" }}>
          <div className="flex min-h-[60px] flex-col items-center justify-center rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10">
            <div className="h-7 w-10 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-1.5 h-2.5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex min-h-[60px] flex-col items-center justify-center rounded-2xl bg-white/80 dark:bg-gray-900/40"
            >
              <div className="h-5 w-8 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-1.5 h-2.5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
