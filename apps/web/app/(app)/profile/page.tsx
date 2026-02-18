"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Minus, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import type { TrackableCategory } from "@meusdesafios/shared";

interface ChallengeGoal {
  category: TrackableCategory;
  label: string;
  value: number;
  unit: string;
  step: number;
  min: number;
}

const initialGoals: ChallengeGoal[] = [
  { category: "WATER", label: "Água", value: 2500, unit: "ml", step: 250, min: 250 },
  { category: "DIET_CONTROL", label: "Dieta", value: 5, unit: "refeições", step: 1, min: 1 },
  { category: "PHYSICAL_EXERCISE", label: "Exercício", value: 60, unit: "min", step: 15, min: 15 },
  { category: "SLEEP", label: "Sono", value: 7, unit: "h", step: 0.5, min: 0.5 },
];

export default function ProfilePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState(initialGoals);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function updateGoal(category: TrackableCategory, delta: number) {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.category !== category) return g;
        const next = Math.round((g.value + delta) * 100) / 100;
        return next >= g.min ? { ...g, value: next } : g;
      })
    );
  }

  function formatValue(goal: ChallengeGoal): string {
    if (goal.step % 1 !== 0) return goal.value.toFixed(1);
    return String(goal.value);
  }

  return (
    <div className="space-y-phi-4 md:space-y-phi-5">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 pt-4 pb-2">
        <Image
          src="/profile/profile.png"
          alt="Foto de perfil"
          width={80}
          height={80}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
        />
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Paulo Neves
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">@psneves</p>
        </div>
      </div>

      {/* Aparência */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Aparência
        </h2>
        {mounted ? (
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-l-lg px-4 py-2.5 text-sm font-medium transition-colors",
                !isDark
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <Sun className="h-4 w-4" />
              Claro
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-r-lg px-4 py-2.5 text-sm font-medium transition-colors",
                isDark
                  ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
              )}
            >
              <Moon className="h-4 w-4" />
              Escuro
            </button>
          </div>
        ) : (
          <div className="h-[42px] rounded-lg bg-gray-100 animate-pulse dark:bg-gray-800" />
        )}
      </section>

      {/* Personalizar Desafios */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Personalizar Desafios
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {goals.map((goal) => {
            const config = getCategoryConfig(goal.category);
            const Icon = config.icon;
            return (
              <div
                key={goal.category}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      config.bgLight,
                      config.bgDark
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {goal.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateGoal(goal.category, -goal.step)}
                    disabled={goal.value <= goal.min}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-16 text-center text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                    {formatValue(goal)} {goal.unit}
                  </span>
                  <button
                    onClick={() => updateGoal(goal.category, goal.step)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Conta */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Conta
        </h2>
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20">
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </section>
    </div>
  );
}
