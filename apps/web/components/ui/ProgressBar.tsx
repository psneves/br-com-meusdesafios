import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning";
  accentColor?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  showPercentage = false,
  size = "md",
  variant = "default",
  accentColor,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isComplete = percentage >= 100;

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const barColor = accentColor
    ? accentColor
    : isComplete || variant === "success"
      ? "bg-sky-500 dark:bg-sky-400"
      : variant === "warning"
        ? "bg-sky-300 dark:bg-sky-600"
        : "bg-sky-500/70 dark:bg-sky-500/60";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full rounded-full bg-gray-200 dark:bg-gray-800",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            sizeClasses[size],
            barColor
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showPercentage && (
        <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
