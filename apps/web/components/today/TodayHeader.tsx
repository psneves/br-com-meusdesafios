"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronDown, Info, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { WeeklySummaryPanel } from "@/components/today/WeeklySummaryPanel";
import { MonthlySummaryPanel } from "@/components/today/MonthlySummaryPanel";
import type { WeeklySummary, MonthlySummary } from "@/lib/types/today";

// ── KPI pill styling helper ─────────────────────────────

type KpiState = "primary" | "active" | "dimmed" | "default";

function getKpiState(
  pill: "today" | "week" | "month",
  expandedKpi: "week" | "month" | null
): KpiState {
  if (pill === "today") return expandedKpi ? "dimmed" : "primary";
  if (expandedKpi === pill) return "active";
  if (expandedKpi !== null) return "dimmed";
  return "default";
}

const KPI_PILL_BG: Record<KpiState, string> = {
  primary: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40",
  active:  "bg-indigo-50 dark:bg-indigo-950/25",
  dimmed:  "bg-white/40 dark:bg-gray-900/20",
  default: "bg-white/80 dark:bg-gray-900/40",
};

const KPI_VALUE_COLOR: Record<KpiState, string> = {
  primary: "text-indigo-600 dark:text-indigo-400",
  active:  "text-indigo-600 dark:text-indigo-400",
  dimmed:  "text-gray-300 dark:text-gray-600",
  default: "text-gray-800 dark:text-gray-100",
};

const KPI_LABEL_COLOR: Record<KpiState, string> = {
  primary: "text-indigo-500/80 dark:text-indigo-400/70",
  active:  "text-indigo-500/80 dark:text-indigo-400/70",
  dimmed:  "text-gray-300 dark:text-gray-600",
  default: "text-gray-400 dark:text-gray-500",
};

// ── Avatar helper ───────────────────────────────────────

function HeaderAvatar({
  url,
  name,
  onError,
}: {
  url?: string;
  name?: string;
  onError: () => void;
}) {
  const cls = "h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm dark:ring-gray-800";

  if (!url) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        <User className="h-7 w-7 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  if (url.startsWith("data:")) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={url} alt={name || "Avatar"} className={cls} />;
  }

  return (
    <Image
      src={url}
      alt={name || "Avatar"}
      width={56}
      height={56}
      className={cls}
      onError={onError}
    />
  );
}

// ── Expanded KPI panel ──────────────────────────────────

function KpiDetailPanel({
  expandedKpi,
  weekSummary,
  monthSummary,
  pointsWeek,
  pointsMonth,
}: {
  expandedKpi: "week" | "month";
  weekSummary?: WeeklySummary;
  monthSummary?: MonthlySummary;
  pointsWeek: number;
  pointsMonth: number;
}) {
  if (expandedKpi === "week" && weekSummary) {
    return <WeeklySummaryPanel summary={weekSummary} />;
  }
  if (expandedKpi === "month" && monthSummary) {
    return <MonthlySummaryPanel summary={monthSummary} />;
  }

  const points = expandedKpi === "week" ? pointsWeek : pointsMonth;
  const goalsMet = points > 0 ? Math.ceil(points / 10) : 0;

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500 dark:text-gray-400">
        {goalsMet} {goalsMet === 1 ? "meta batida" : "metas batidas"}
      </span>
      <span className="font-semibold tabular-nums text-gray-700 dark:text-gray-300">
        {points} XP
      </span>
    </div>
  );
}

// ── Component ───────────────────────────────────────────

interface TodayHeaderProps {
  greeting: string;
  date: string;
  userName?: string;
  userHandle?: string;
  avatarUrl?: string;
  friendsCount?: number;
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
  userHandle,
  avatarUrl,
  friendsCount = 0,
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

  return (
    <header className={cn("space-y-3 pt-2", className)}>
      {/* Top row: avatar + info (left)  |  day nav (right) */}
      <div className="flex items-center">
        {/* Avatar + name + follow counts */}
        <div className="flex min-w-0 items-center gap-phi-3">
          <HeaderAvatar
            url={avatarError ? undefined : avatarUrl}
            name={userName}
            onError={() => setAvatarError(true)}
          />
          <div className="min-w-0">
            {userName && (
              <p className="truncate text-[15px] font-bold leading-tight text-gray-900 dark:text-white">
                {userName}
              </p>
            )}
            {userHandle && (
              <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">@{userHandle}</p>
            )}
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{date}</p>
            <div className="mt-0.5 flex items-center gap-3 text-[11px]">
              <span className="text-gray-500 dark:text-gray-400">
                <strong className="font-semibold text-gray-700 dark:text-gray-200">{friendsCount}</strong> {friendsCount === 1 ? "amigo" : "amigos"}
              </span>
            </div>
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
          {(() => {
            const s = getKpiState("today", expandedKpi);
            return (
              <button
                onClick={() => {
                  if (expandedKpi) {
                    setExpandedKpi(null);
                    onKpiChange?.(null);
                  } else {
                    setShowPointsInfo(true);
                  }
                }}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-phi-2 py-phi-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1",
                  KPI_PILL_BG[s]
                )}
                aria-label={`${totalPoints} XP ${dayLabel}. Toque para saber mais`}
              >
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-3xl font-extrabold tabular-nums leading-none transition-colors duration-200", KPI_VALUE_COLOR[s])}>
                    {totalPoints}
                  </span>
                  <span className={cn("text-sm font-bold transition-colors duration-200", KPI_LABEL_COLOR[s])}>XP</span>
                  <Info className={cn("mb-auto mt-0.5 h-3 w-3 transition-colors duration-200", KPI_LABEL_COLOR[s])} />
                </div>
                <span className={cn("mt-1 text-[11px] font-medium leading-none transition-colors duration-200", KPI_LABEL_COLOR[s])}>
                  {dayLabel}
                </span>
              </button>
            );
          })()}
          {/* Secondary: Semana */}
          {(() => {
            const s = getKpiState("week", expandedKpi);
            return (
              <button
                onClick={() => toggleKpi("week")}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-phi-2 py-phi-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                  s === "active" ? "focus-visible:ring-indigo-400" : "focus-visible:ring-gray-400",
                  KPI_PILL_BG[s]
                )}
                aria-label={`${pointsWeek} XP na semana`}
                aria-expanded={expandedKpi === "week"}
              >
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-xl font-extrabold tabular-nums leading-none transition-colors duration-200", KPI_VALUE_COLOR[s])}>
                    {pointsWeek}
                  </span>
                  <span className={cn("text-sm font-bold transition-colors duration-200", KPI_LABEL_COLOR[s])}>XP</span>
                </div>
                <span className={cn("mt-1 flex items-center gap-0.5 text-[11px] font-medium leading-none transition-colors duration-200", KPI_LABEL_COLOR[s])}>
                  Semana
                  <ChevronDown className={cn("h-2.5 w-2.5 transition-transform duration-200", expandedKpi === "week" && "rotate-180")} />
                </span>
              </button>
            );
          })()}
          {/* Secondary: Mês */}
          {(() => {
            const s = getKpiState("month", expandedKpi);
            return (
              <button
                onClick={() => toggleKpi("month")}
                className={cn(
                  "flex min-h-[60px] flex-col items-center justify-center rounded-2xl px-phi-2 py-phi-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                  s === "active" ? "focus-visible:ring-indigo-400" : "focus-visible:ring-gray-400",
                  KPI_PILL_BG[s]
                )}
                aria-label={`${pointsMonth} XP no mês`}
                aria-expanded={expandedKpi === "month"}
              >
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-xl font-extrabold tabular-nums leading-none transition-colors duration-200", KPI_VALUE_COLOR[s])}>
                    {pointsMonth}
                  </span>
                  <span className={cn("text-sm font-bold transition-colors duration-200", KPI_LABEL_COLOR[s])}>XP</span>
                </div>
                <span className={cn("mt-1 flex items-center gap-0.5 text-[11px] font-medium leading-none transition-colors duration-200", KPI_LABEL_COLOR[s])}>
                  Mês
                  <ChevronDown className={cn("h-2.5 w-2.5 transition-transform duration-200", expandedKpi === "month" && "rotate-180")} />
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Expanded KPI detail */}
      {expandedKpi && (
        <div className="rounded-xl bg-gray-50 px-phi-3 py-phi-3 dark:bg-gray-800/40">
          <KpiDetailPanel
            expandedKpi={expandedKpi}
            weekSummary={weekSummary}
            monthSummary={monthSummary}
            pointsWeek={pointsWeek}
            pointsMonth={pointsMonth}
          />
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
              Dia perfeito
            </h3>
            <p>
              Se cumprir <em>todos</em> os 4 desafios no mesmo dia, ganha{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>{" "}
              extra.
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
          <div className="h-14 w-14 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2.5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2.5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
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
