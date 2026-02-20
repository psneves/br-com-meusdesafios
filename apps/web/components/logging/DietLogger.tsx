"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getCategoryConfig } from "@/lib/category-config";
import { cn } from "@/lib/utils";
import type { ProgressBreakdown } from "@/lib/types/today";

type MealState = "neutral" | "success" | "fail";

const MEAL_LABELS_BY_COUNT: Record<number, string[]> = {
  3: ["Café da manhã", "Almoço", "Jantar"],
  4: ["Café da manhã", "Almoço", "Lanche", "Jantar"],
  5: ["Café da manhã", "Lanche 1", "Almoço", "Lanche 2", "Jantar"],
  6: ["Café da manhã", "Lanche 1", "Almoço", "Lanche 2", "Jantar", "Ceia"],
  7: ["Café da manhã", "Lanche 1", "Almoço", "Lanche 2", "Lanche 3", "Jantar", "Ceia"],
};

function getMealLabels(count: number): string[] {
  return (
    MEAL_LABELS_BY_COUNT[count] ??
    Array.from({ length: count }, (_, i) => `Refeição ${i + 1}`)
  );
}

interface DietLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (successCount: number) => void;
  currentProgress?: number;
  currentBreakdown?: ProgressBreakdown[];
  target?: number;
}

function breakdownToMeals(
  target: number,
  breakdown?: ProgressBreakdown[],
  currentProgress = 0
): MealState[] {
  if (breakdown?.length === target) {
    return breakdown.map((b) => {
      if (b.value === 1) return "success";
      if (b.value === -1) return "fail";
      return "neutral";
    });
  }
  const successCount = Math.min(Math.max(0, currentProgress), target);
  return Array.from({ length: target }, (_, i) =>
    i < successCount ? "success" : "neutral"
  );
}

export function DietLogger({
  isOpen,
  onClose,
  onLog,
  currentProgress = 0,
  currentBreakdown,
  target = 5,
}: DietLoggerProps) {
  const mealLabels = getMealLabels(target);
  const [meals, setMeals] = useState<MealState[]>(() =>
    breakdownToMeals(target, currentBreakdown, currentProgress)
  );
  const [isLogging, setIsLogging] = useState(false);

  const cfg = getCategoryConfig("DIET_CONTROL");

  const cycleMeal = (index: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (current === "neutral") updated[index] = "success";
      else if (current === "success") updated[index] = "fail";
      else updated[index] = "neutral";
      return updated;
    });
  };

  const successCount = meals.filter((m) => m === "success").length;

  const handleSubmit = async () => {
    setIsLogging(true);
    try {
      await onLog(successCount);
      onClose();
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registar Dieta">
      {/* Progresso atual */}
      <div className="mb-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Meta: cumprir o plano nas <strong>{target} refeições</strong> do dia
        </p>
      </div>

      {/* Meal rows */}
      <div className="mb-4 space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Toque para alterar o estado de cada refeição
        </p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-gray-500 dark:text-gray-400">
          <span><span className="text-emerald-500">●</span> Conforme o plano</span>
          <span><span className="text-red-500">●</span> Fora do plano</span>
          <span><span className="text-gray-400">●</span> Não realizada</span>
        </div>
        {mealLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => cycleMeal(i)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
              meals[i] === "neutral" &&
                "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750",
              meals[i] === "success" &&
                "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/30",
              meals[i] === "fail" &&
                "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/30"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                meals[i] === "neutral" &&
                  "border-2 border-dashed border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500",
                meals[i] === "success" &&
                  cn("text-white shadow-sm", cfg.btnBg, cfg.btnBgDark),
                meals[i] === "fail" &&
                  "bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400"
              )}
            >
              {meals[i] === "neutral" && (
                <span className="text-[11px] font-medium">{i + 1}</span>
              )}
              {meals[i] === "success" && (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              )}
              {meals[i] === "fail" && (
                <X className="h-4 w-4" strokeWidth={2.5} />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                meals[i] === "neutral" &&
                  "text-gray-700 dark:text-gray-300",
                meals[i] === "success" &&
                  "text-emerald-700 dark:text-emerald-300",
                meals[i] === "fail" &&
                  "text-red-700 dark:text-red-300"
              )}
            >
              {label}
            </span>
            <span
              className={cn(
                "ml-auto text-xs",
                meals[i] === "neutral" && "text-gray-400 dark:text-gray-500",
                meals[i] === "success" && "text-emerald-600 dark:text-emerald-400",
                meals[i] === "fail" && "text-red-500 dark:text-red-400"
              )}
            >
              {meals[i] === "neutral" && "Não registado"}
              {meals[i] === "success" && "Conforme o plano"}
              {meals[i] === "fail" && "Fora do plano"}
            </span>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div
        className={cn(
          "mb-4 rounded-lg p-3",
          successCount >= target
            ? "bg-emerald-50 dark:bg-emerald-900/20"
            : "bg-gray-50 dark:bg-gray-800"
        )}
      >
        <p
          className={cn(
            "text-sm",
            successCount >= target
              ? "text-emerald-700 dark:text-emerald-300"
              : "text-gray-600 dark:text-gray-400"
          )}
        >
          <strong>{successCount} de {target}</strong> refeições conforme o plano
          {successCount >= target && " — Meta cumprida!"}
        </p>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLogging}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLogging}>
          Registar Dieta
        </Button>
      </ModalFooter>
    </Modal>
  );
}
