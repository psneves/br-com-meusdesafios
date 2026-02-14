"use client";

import { Loader2 } from "lucide-react";
import type { QuickAction } from "@/lib/types/today";
import type { CategoryConfig } from "@/lib/category-config";
import { cn } from "@/lib/utils";

interface QuickActionRowProps {
  actions: QuickAction[];
  onAction: (actionId: string) => void;
  loadingActionId?: string | null;
  disabled?: boolean;
  className?: string;
  categoryAccent?: CategoryConfig;
}

export function QuickActionRow({
  actions,
  onAction,
  loadingActionId = null,
  disabled = false,
  className,
  categoryAccent,
}: QuickActionRowProps) {
  if (actions.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2",
        actions.length === 1 && "grid-cols-1",
        actions.length === 2 && "grid-cols-2",
        actions.length === 3 && "grid-cols-3",
        actions.length >= 4 && "grid-cols-2 md:grid-cols-4",
        className
      )}
    >
      {actions.map((action) => {
        const isLoading = loadingActionId === action.id;
        const isToggle = action.type === "toggle";
        const isLog = action.type === "log";
        const isAdd = action.type === "add";

        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={disabled || !!loadingActionId}
            aria-label={getAriaLabel(action)}
            className={cn(
              "inline-flex min-h-[44px] items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
              isLog && categoryAccent && cn(
                "text-white",
                categoryAccent.btnBg,
                categoryAccent.btnHover,
                categoryAccent.btnBgDark,
                categoryAccent.btnHoverDark,
                "focus-visible:ring-gray-400"
              ),
              isLog && !categoryAccent && "bg-sky-500 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 focus-visible:ring-sky-500",
              isAdd && categoryAccent && cn(
                "border",
                categoryAccent.activeBg,
                categoryAccent.metText,
                categoryAccent.activeBgDark,
                categoryAccent.metTextDark,
                "border-current/20 hover:opacity-80 focus-visible:ring-gray-400"
              ),
              isAdd && !categoryAccent && "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus-visible:ring-gray-400",
              isToggle && "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 focus-visible:ring-gray-400",
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              action.label
            )}
          </button>
        );
      })}
    </div>
  );
}

function getAriaLabel(action: QuickAction): string {
  if (action.type === "add" && action.amount && action.unit) {
    return `Adicionar ${action.amount} ${action.unit === "ml" ? "mililitros" : action.unit}`;
  }
  return action.label;
}

interface ToggleActionProps {
  label: string;
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  categoryAccent?: CategoryConfig;
}

export function ToggleAction({
  label,
  isActive,
  onToggle,
  disabled = false,
  isLoading = false,
  className,
  categoryAccent,
}: ToggleActionProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled || isLoading}
      aria-label={isActive ? "Desfazer meta cumprida" : "Marcar meta como cumprida"}
      aria-pressed={isActive}
      className={cn(
        "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400",
        isActive && categoryAccent
          ? cn(
              "text-white",
              categoryAccent.btnBg,
              categoryAccent.btnHover,
              categoryAccent.btnBgDark,
              categoryAccent.btnHoverDark,
              `border-transparent`
            )
          : isActive
            ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 dark:border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        (disabled || isLoading) && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {isActive && (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
          {label}
        </>
      )}
    </button>
  );
}
