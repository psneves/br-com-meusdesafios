import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface PointsChipProps {
  points: number;
  showZero?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function getPointsTooltip(points: number): React.ReactNode {
  if (points <= 0) {
    return "Bata a meta do dia para ganhar +10 XP";
  }

  return (
    <div className="space-y-0.5">
      <div className="font-semibold">+{points} XP ganhos hoje</div>
      <div className="text-gray-400">Meta do dia batida = +10 XP</div>
    </div>
  );
}

export function PointsChip({
  points,
  showZero = false,
  size = "sm",
  className,
}: PointsChipProps) {
  if (points === 0 && !showZero) {
    return null;
  }

  const isPositive = points > 0;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
  };

  return (
    <Tooltip content={getPointsTooltip(points)}>
      <span
        className={cn(
          "inline-flex items-center rounded-md font-medium",
          isPositive
            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-400"
            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
          sizeClasses[size],
          className
        )}
      >
        {isPositive && "+"}
        {points} XP
      </span>
    </Tooltip>
  );
}

interface TotalPointsProps {
  points: number;
  className?: string;
}

export function TotalPoints({ points, className }: TotalPointsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {points.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">XP hoje</p>
      </div>
    </div>
  );
}
