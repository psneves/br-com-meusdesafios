"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Sun, Moon, Minus, Plus, LogOut, FileText, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import { useChallengeSettings } from "@/lib/hooks/use-challenge-settings";
import type { TrackableCategory } from "@meusdesafios/shared";

interface ChallengeGoalDef {
  category: TrackableCategory;
  label: string;
  unit: string;
  displayUnit: string;
  step: number;
  min: number;
  /** Convert internal value to display value */
  toDisplay: (v: number) => number;
  /** Convert display value to internal value */
  toInternal: (v: number) => number;
  /** Format the display value */
  format: (v: number) => string;
}

const CHALLENGE_DEFS: ChallengeGoalDef[] = [
  {
    category: "WATER",
    label: "Água",
    unit: "ml",
    displayUnit: "ml",
    step: 250,
    min: 250,
    toDisplay: (v) => v,
    toInternal: (v) => v,
    format: (v) => String(v),
  },
  {
    category: "DIET_CONTROL",
    label: "Dieta",
    unit: "refeições",
    displayUnit: "refeições",
    step: 1,
    min: 1,
    toDisplay: (v) => v,
    toInternal: (v) => v,
    format: (v) => String(v),
  },
  {
    category: "PHYSICAL_EXERCISE",
    label: "Exercício",
    unit: "min",
    displayUnit: "min",
    step: 15,
    min: 15,
    toDisplay: (v) => v,
    toInternal: (v) => v,
    format: (v) => String(v),
  },
  {
    category: "SLEEP",
    label: "Sono",
    unit: "min",
    displayUnit: "h",
    step: 30,
    min: 30,
    toDisplay: (v) => v / 60,
    toInternal: (v) => v * 60,
    format: (v) => (v / 60).toFixed(1),
  },
];

export default function ProfilePage() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { settings, toggleActive, updateTarget } = useChallengeSettings();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleTargetChange(def: ChallengeGoalDef, delta: number) {
    const current = settings[def.category].target;
    const next = Math.round((current + delta) * 100) / 100;
    if (next >= def.min) {
      updateTarget(def.category, next);
    }
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
          {CHALLENGE_DEFS.map((def) => {
            const config = getCategoryConfig(def.category);
            const Icon = config.icon;
            const setting = settings[def.category];
            const isActive = setting.active;
            const displayValue = def.format(setting.target);

            return (
              <div
                key={def.category}
                className={cn(
                  "flex items-center justify-between py-3 first:pt-0 last:pb-0 transition-opacity",
                  !isActive && "opacity-50"
                )}
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
                    {def.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle switch */}
                  <button
                    role="switch"
                    aria-checked={isActive}
                    aria-label={`${isActive ? "Desativar" : "Ativar"} ${def.label}`}
                    onClick={() => toggleActive(def.category)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      isActive
                        ? "bg-primary-600 dark:bg-primary-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                        isActive ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>

                  {/* Target controls — always reserve space, invisible when inactive */}
                  <div className={cn("flex items-center gap-2", !isActive && "invisible")}>
                      <button
                        onClick={() => handleTargetChange(def, -def.step)}
                        disabled={setting.target <= def.min}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-20 text-center text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                        {displayValue} {def.displayUnit}
                      </span>
                      <button
                        onClick={() => handleTargetChange(def, def.step)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sobre */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Sobre
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <Link
            href="/terms"
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            Termos de Uso
            <ChevronRight className="ml-auto h-4 w-4 text-gray-300 dark:text-gray-600" />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/50"
          >
            <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            Política de Privacidade
            <ChevronRight className="ml-auto h-4 w-4 text-gray-300 dark:text-gray-600" />
          </Link>
        </div>
      </section>

      {/* Conta */}
      <section className="rounded-xl border border-gray-200 bg-white p-phi-4 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-phi-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Conta
        </h2>
        <button
          onClick={() => { window.location.href = "/api/auth/logout"; }}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </section>
    </div>
  );
}
