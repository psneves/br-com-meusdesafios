import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "fire" | "muted";
  size?: "sm" | "md";
  className?: string;
}

const variantClasses = {
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  success: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  warning: "bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
  fire: "bg-sky-500 text-white dark:bg-sky-600",
  muted: "bg-gray-50 text-gray-500 dark:bg-gray-900 dark:text-gray-500",
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
