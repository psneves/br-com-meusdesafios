import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Flame, ChevronLeft, ChevronRight } from "lucide-react";

interface TodayHeaderProps {
  greeting: string;
  date: string;
  totalPoints: number;
  points30d: number;
  bestStreak: number;
  isToday?: boolean;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  className?: string;
}

export function TodayHeader({
  greeting,
  date,
  totalPoints,
  points30d,
  bestStreak,
  isToday = true,
  onPrevDay,
  onNextDay,
  className,
}: TodayHeaderProps) {
  return (
    <header className={cn("space-y-1", className)}>
      {/* Line 1: greeting + day nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {onPrevDay && (
            <button
              onClick={onPrevDay}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              aria-label="Dia anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {greeting}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-400 dark:text-gray-500">{date}</p>
          {onNextDay && (
            <button
              onClick={onNextDay}
              disabled={isToday}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                isToday
                  ? "cursor-not-allowed text-gray-200 dark:text-gray-700"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              )}
              aria-label="Dia seguinte"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Line 2: compact stat chips in a single row */}
      <div className="flex items-center gap-2">
        <StatChip
          icon={Trophy}
          value={totalPoints}
          suffix=" pts"
          label="Hoje"
          variant="primary"
        />
        <StatChip
          icon={TrendingUp}
          value={points30d}
          suffix=" pts"
          label="30d"
        />
        <StatChip
          icon={Flame}
          value={bestStreak}
          suffix="d"
          label="Melhor"
        />
      </div>
    </header>
  );
}

interface StatChipProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  variant?: "primary" | "secondary";
}

function StatChip({
  icon: Icon,
  value,
  suffix,
  label,
  variant = "secondary",
}: StatChipProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5",
        isPrimary
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/30"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          isPrimary
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-gray-400 dark:text-gray-500"
        )}
      />
      <div className="flex items-baseline gap-0.5">
        <span
          className={cn(
            "text-sm font-bold leading-none",
            isPrimary
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-900 dark:text-white"
          )}
        >
          {value.toLocaleString()}
          {suffix}
        </span>
        <span className="text-[10px] leading-none text-gray-400 dark:text-gray-500">
          {label}
        </span>
      </div>
    </div>
  );
}

export function TodayHeaderSkeleton() {
  return (
    <header className="animate-pulse space-y-1">
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    </header>
  );
}
