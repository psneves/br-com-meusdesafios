import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import type { CardGoal, CardProgress } from "@/lib/types/today";

interface TrackableProgressProps {
  goal: CardGoal;
  progress: CardProgress;
  className?: string;
  accentColor?: string;
  metTextClass?: string;
}

export function TrackableProgress({
  goal,
  progress,
  className,
  accentColor,
  metTextClass,
}: TrackableProgressProps) {
  const metCls = metTextClass || "text-sky-600 dark:text-sky-400";

  // For target-type goals, show value labels flanking the bar
  if (goal.type === "target" && goal.target) {
    const target = goal.target;
    const unit = goal.unit || "";
    const current = progress.value;

    const formatValue = (val: number) => {
      if (val >= 1000) return val.toLocaleString();
      if (val % 1 !== 0) return val.toFixed(1);
      return val.toString();
    };

    return (
      <div className={cn("space-y-1", className)}>
        <ProgressBar
          value={progress.percentage}
          max={100}
          size="md"
          variant={progress.met ? "success" : "default"}
          accentColor={accentColor}
        />
        <div className="flex items-baseline justify-between">
          <span
            className={cn(
              "text-xs font-medium",
              progress.met ? metCls : "text-gray-700 dark:text-gray-300"
            )}
          >
            {formatValue(current)} {unit}
          </span>
          <span
            className={cn(
              "text-xs",
              progress.met ? metCls : "text-gray-500 dark:text-gray-400"
            )}
          >
            {progress.met ? "Completo" : `${formatValue(target)} ${unit}`}
          </span>
        </div>
      </div>
    );
  }

  // For binary / time_window, just show the bar
  return (
    <div className={cn("space-y-1", className)}>
      <ProgressBar
        value={progress.percentage}
        max={100}
        size="md"
        variant={progress.met ? "success" : "default"}
        accentColor={accentColor}
      />
      {progress.met && (
        <p className={cn("text-xs font-medium", metCls)}>Completo</p>
      )}
    </div>
  );
}

export function GoalDescription({ goal, className }: { goal: CardGoal; className?: string }) {
  let description = "";

  switch (goal.type) {
    case "binary":
      description = "Completar checklist diária";
      break;
    case "target":
      description = `Atingir ${goal.target} ${goal.unit || ""}`;
      break;
    case "range":
      description = "Manter dentro do intervalo";
      break;
    case "time_window":
      description = `Deitar até ${goal.timeWindowEnd}`;
      break;
  }

  return (
    <p className={cn("text-xs text-gray-500 dark:text-gray-400", className)}>
      {description}
    </p>
  );
}
