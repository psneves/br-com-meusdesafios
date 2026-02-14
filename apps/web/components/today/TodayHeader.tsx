import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface TodayHeaderProps {
  greeting: string;
  date: string;
  totalPoints: number;
  pointsWeek: number;
  pointsMonth: number;
  selectedDate: Date;
  isToday?: boolean;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  className?: string;
}

// ── Date helpers for KPI labels & tooltips ───────────────

function getDayLabel(selected: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sel = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const diffMs = today.getTime() - sel.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";

  // Within last 6 days: abbreviated weekday
  if (diffDays <= 6) {
    const wd = sel.toLocaleDateString("pt-BR", { weekday: "short" });
    return wd.charAt(0).toUpperCase() + wd.slice(1).replace(".", "");
  }

  // Older: short date
  return `${sel.getDate()}/${sel.getMonth() + 1}`;
}

function getDayTooltip(selected: Date): string {
  return selected.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getWeekTooltip(selected: Date): string {
  const day = selected.getDay(); // 0=Sun
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(selected);
  mon.setDate(selected.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);

  const fmtShort = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");

  if (mon.getMonth() === sun.getMonth()) {
    const monStr = fmtShort(mon);
    return `${mon.getDate()}–${sun.getDate()} de ${monStr.split(" de ")[1] || monStr.split(" ")[1]}`;
  }
  return `${fmtShort(mon)} – ${fmtShort(sun)}`;
}

function getMonthTooltip(selected: Date): string {
  const month = selected.toLocaleDateString("pt-BR", { month: "long" });
  const lastDay = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate();
  return `1–${lastDay} de ${month}`;
}

export function TodayHeader({
  greeting,
  date,
  totalPoints,
  pointsWeek,
  pointsMonth,
  selectedDate,
  isToday = true,
  onPrevDay,
  onNextDay,
  className,
}: TodayHeaderProps) {
  const dayLabel = getDayLabel(selectedDate);
  const dayTooltip = getDayTooltip(selectedDate);
  const weekTooltip = getWeekTooltip(selectedDate);
  const monthTooltip = getMonthTooltip(selectedDate);

  return (
    <header className={cn("space-y-1.5", className)}>
      {/* Day navigation */}
      <div className="flex items-center justify-center gap-1">
        {onPrevDay && (
          <button
            onClick={onPrevDay}
            className="flex h-11 w-11 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            aria-label="Dia anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            {greeting}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">{date}</p>
        </div>
        {onNextDay && (
          <button
            onClick={onNextDay}
            disabled={isToday}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              isToday
                ? "cursor-not-allowed text-gray-200 dark:text-gray-700"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            )}
            aria-label="Dia seguinte"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Line 2: KPI columns with vertical dividers */}
      <div className="grid grid-cols-3">
        <Kpi
          icon={Trophy}
          value={totalPoints}
          label={`Pontos ${dayLabel.toLowerCase()}`}
          tooltip={dayTooltip}
          variant="primary"
        />
        <Kpi
          icon={TrendingUp}
          value={pointsWeek}
          label="Semana"
          tooltip={weekTooltip}
          border
        />
        <Kpi
          icon={CalendarDays}
          value={pointsMonth}
          label="Mês"
          tooltip={monthTooltip}
          border
        />
      </div>

      {/* Helper text */}
      <p className="text-center text-[10px] text-gray-400 dark:text-gray-500">
        Pontos vêm de metas concluídas (+10) e bônus de sequência.
      </p>
    </header>
  );
}

interface KpiProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  tooltip?: string;
  variant?: "primary" | "secondary";
  border?: boolean;
}

function Kpi({
  icon: Icon,
  value,
  label,
  tooltip,
  variant = "secondary",
  border = false,
}: KpiProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-0.5 py-1",
        border && "border-l border-gray-200 dark:border-gray-800"
      )}
      title={tooltip}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          isPrimary
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-gray-400 dark:text-gray-500"
        )}
      />
      <span
        className={cn(
          "text-lg font-bold leading-none tabular-nums",
          isPrimary
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-gray-900 dark:text-white"
        )}
      >
        {value === 0 ? "—" : value}
      </span>
      <span
        className={cn(
          "text-[10px] font-medium leading-none",
          isPrimary
            ? "text-indigo-500/70 dark:text-indigo-400/60"
            : "text-gray-400 dark:text-gray-500"
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function TodayHeaderSkeleton() {
  return (
    <header className="animate-pulse space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="grid grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-1 py-1",
              i > 0 && "border-l border-gray-200 dark:border-gray-800"
            )}
          >
            <div className="h-3.5 w-3.5 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="h-5 w-10 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-2.5 w-12 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </header>
  );
}
