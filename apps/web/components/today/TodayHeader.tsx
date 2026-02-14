import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, Flame } from "lucide-react";

interface TodayHeaderProps {
  greeting: string;
  date: string;
  totalPoints: number;
  points30d: number;
  bestStreak: number;
  className?: string;
}

export function TodayHeader({
  greeting,
  date,
  totalPoints,
  points30d,
  bestStreak,
  className,
}: TodayHeaderProps) {
  return (
    <header className={cn("space-y-2", className)}>
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white md:text-2xl">
          {greeting}!
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">{date}</p>
      </div>

      {/* Summary strip — compact row on desktop, 2-row grid on mobile */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        <SummaryChip
          icon={Trophy}
          value={totalPoints}
          suffix=" pts"
          label="Hoje"
          variant="primary"
          helperText="Ganhe +10 pts ao cumprir uma meta hoje."
          className="col-span-2 md:col-span-1"
        />
        <SummaryChip
          icon={TrendingUp}
          value={points30d}
          suffix=" pts"
          label="30 dias"
          variant="secondary"
        />
        <SummaryChip
          icon={Flame}
          value={bestStreak}
          suffix=" dias"
          label="Melhor sequência"
          variant="secondary"
        />
      </div>
    </header>
  );
}

interface SummaryChipProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  suffix: string;
  label: string;
  variant: "primary" | "secondary";
  helperText?: string;
  className?: string;
}

function SummaryChip({
  icon: Icon,
  value,
  suffix,
  label,
  variant,
  helperText,
  className,
}: SummaryChipProps) {
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "flex min-h-[44px] items-center gap-2 rounded-xl border px-3 py-2",
        isPrimary
          ? "border-indigo-200 bg-indigo-50 dark:border-indigo-800/50 dark:bg-indigo-950/30"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900",
        className
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          isPrimary
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-gray-400 dark:text-gray-500"
        )}
      />
      <div className="min-w-0">
        <p
          className={cn(
            "text-sm font-bold leading-tight",
            isPrimary
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-gray-900 dark:text-white"
          )}
        >
          {value.toLocaleString()}
          {suffix}
        </p>
        <p className="truncate text-[10px] leading-tight text-gray-500 dark:text-gray-400">
          {label}
        </p>
        {helperText && (
          <p className="mt-0.5 text-[9px] leading-tight text-indigo-500/70 dark:text-indigo-400/60 md:text-[10px]">
            {helperText}
          </p>
        )}
      </div>
    </div>
  );
}

export function TodayHeaderSkeleton() {
  return (
    <header className="animate-pulse space-y-2">
      <div>
        <div className="h-6 w-36 rounded bg-gray-200 dark:bg-gray-800 md:h-8 md:w-48" />
        <div className="mt-1 h-4 w-28 rounded bg-gray-200 dark:bg-gray-800 md:w-32" />
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        <div className="col-span-2 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 md:col-span-1" />
        <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
        <div className="h-12 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    </header>
  );
}
