import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

interface StreakBadgeProps {
  current: number;
  best?: number;
  showBest?: boolean;
  className?: string;
}

function getStreakVariant(days: number): {
  bgClass: string;
  textClass: string;
  iconClass: string;
} {
  if (days < 3) {
    return {
      bgClass: "bg-amber-50 dark:bg-amber-900/20",
      textClass: "text-amber-600 dark:text-amber-400",
      iconClass: "text-amber-400 dark:text-amber-500",
    };
  }
  if (days < 7) {
    return {
      bgClass: "bg-amber-100 dark:bg-amber-900/30",
      textClass: "text-amber-700 dark:text-amber-300",
      iconClass: "text-amber-500 dark:text-amber-400",
    };
  }
  if (days < 14) {
    return {
      bgClass: "bg-orange-100 dark:bg-orange-900/30",
      textClass: "text-orange-700 dark:text-orange-300",
      iconClass: "text-orange-500 dark:text-orange-400",
    };
  }
  if (days < 30) {
    return {
      bgClass: "bg-orange-200/70 dark:bg-orange-800/40",
      textClass: "text-orange-800 dark:text-orange-200",
      iconClass: "text-orange-600 dark:text-orange-300",
    };
  }
  // 30+ days
  return {
    bgClass: "bg-orange-500 dark:bg-orange-500",
    textClass: "text-white",
    iconClass: "text-orange-200",
  };
}

function getStreakTooltip(current: number, best?: number): React.ReactNode {
  return (
    <div className="space-y-0.5">
      <div className="font-semibold">
        {current} {current === 1 ? "dia" : "dias"} seguidos batendo a meta
      </div>
      {best !== undefined && best > current && (
        <div className="text-gray-400">Melhor: {best} dias</div>
      )}
    </div>
  );
}

export function StreakBadge({
  current,
  best,
  showBest = false,
  className,
}: StreakBadgeProps) {
  if (current === 0) return null;

  const { bgClass, textClass, iconClass } = getStreakVariant(current);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip content={getStreakTooltip(current, best)}>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
            bgClass,
            textClass
          )}
        >
          <Flame className={cn("h-3 w-3", iconClass)} />
          {current} {current === 1 ? "dia" : "dias"}
        </span>
      </Tooltip>
      {showBest && best !== undefined && best > current && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500">
          ({best})
        </span>
      )}
    </div>
  );
}
