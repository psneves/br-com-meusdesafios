"use client";

import { useState, useEffect, useCallback } from "react";
import { HeartPulse, Droplets, Utensils, Moon, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import { Modal } from "@/components/ui/Modal";

const ONBOARDING_KEY = "meusdesafios-onboarding-done";

const DIET_OPTIONS = [3, 4, 5, 6, 7];

const EXERCISE_OPTIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "75 min", value: 75 },
  { label: "90 min", value: 90 },
];

const SLEEP_OPTIONS = [
  { label: "6h", value: 360 },
  { label: "6.5h", value: 390 },
  { label: "7h", value: 420 },
  { label: "7.5h", value: 450 },
  { label: "8h", value: 480 },
  { label: "8.5h", value: 510 },
  { label: "9h", value: 540 },
];

// ── Section components ──────────────────────────────────────

function WaterSection({
  weight,
  onWeightChange,
}: {
  weight: number;
  onWeightChange: (w: number) => void;
}) {
  const cfg = getCategoryConfig("WATER");
  const Icon = cfg.icon;
  const waterMl = weight * 30;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", cfg.color)} />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Água</span>
      </div>
      <label className="block text-xs text-gray-500 dark:text-gray-400">
        Qual é o seu peso?
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={40}
          max={150}
          step={1}
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-blue-500 dark:bg-gray-700"
        />
        <span className="w-14 shrink-0 text-right text-sm font-semibold text-gray-900 dark:text-white">
          {weight} kg
        </span>
      </div>
      <p className={cn("text-xs font-medium", cfg.metText, cfg.metTextDark)}>
        Sua meta: {waterMl.toLocaleString("pt-BR")} ml/dia
      </p>
    </div>
  );
}

function DietSection({
  target,
  onTargetChange,
}: {
  target: number;
  onTargetChange: (t: number) => void;
}) {
  const cfg = getCategoryConfig("DIET_CONTROL");
  const Icon = cfg.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", cfg.color)} />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Dieta</span>
      </div>
      <label className="block text-xs text-gray-500 dark:text-gray-400">
        Quantas refeições por dia?
      </label>
      <div className="flex gap-2">
        {DIET_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onTargetChange(n)}
            className={cn(
              "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors",
              target === n
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ExerciseSection({
  target,
  onTargetChange,
}: {
  target: number;
  onTargetChange: (t: number) => void;
}) {
  const cfg = getCategoryConfig("PHYSICAL_EXERCISE");
  const Icon = cfg.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", cfg.color)} />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Exercício Físico</span>
      </div>
      <label className="block text-xs text-gray-500 dark:text-gray-400">
        Meta diária de exercício
      </label>
      <div className="grid grid-cols-3 gap-2">
        {EXERCISE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTargetChange(opt.value)}
            className={cn(
              "rounded-lg border py-2 text-sm font-medium transition-colors",
              target === opt.value
                ? "border-rose-500 bg-rose-50 text-rose-700 dark:border-rose-400 dark:bg-rose-900/30 dark:text-rose-300"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SleepSection({
  target,
  onTargetChange,
}: {
  target: number;
  onTargetChange: (t: number) => void;
}) {
  const cfg = getCategoryConfig("SLEEP");
  const Icon = cfg.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-5 w-5", cfg.color)} />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Sono</span>
      </div>
      <label className="block text-xs text-gray-500 dark:text-gray-400">
        Horas de sono por noite
      </label>
      <div className="flex gap-1.5">
        {SLEEP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTargetChange(opt.value)}
            className={cn(
              "flex-1 rounded-lg border py-2 text-xs font-medium transition-colors",
              target === opt.value
                ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-900/30 dark:text-violet-300"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Step indicator ──────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current
              ? "w-6 bg-indigo-500"
              : i < current
                ? "w-1.5 bg-indigo-300 dark:bg-indigo-700"
                : "w-1.5 bg-gray-200 dark:bg-gray-700"
          )}
        />
      ))}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────

interface OnboardingModalProps {
  onComplete?: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0); // 0=welcome, 1=configure
  const [isSaving, setIsSaving] = useState(false);

  // Challenge targets
  const [weight, setWeight] = useState(70);
  const [dietTarget, setDietTarget] = useState(5);
  const [exerciseTarget, setExerciseTarget] = useState(45);
  const [sleepTarget, setSleepTarget] = useState(420);

  const waterTarget = weight * 30;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setVisible(true);
  }, []);

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "1");
    setVisible(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        fetch("/api/trackables/goal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "WATER", target: waterTarget }),
        }),
        fetch("/api/trackables/goal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "DIET_CONTROL", target: dietTarget }),
        }),
        fetch("/api/trackables/goal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "PHYSICAL_EXERCISE", target: exerciseTarget }),
        }),
        fetch("/api/trackables/goal", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "SLEEP", target: sleepTarget }),
        }),
      ]);
    } catch {
      // Silent fail — defaults were already provisioned
    } finally {
      localStorage.setItem(ONBOARDING_KEY, "1");
      setIsSaving(false);
      setVisible(false);
      onComplete?.();
    }
  }, [waterTarget, dietTarget, exerciseTarget, sleepTarget, onComplete]);

  return (
    <Modal
      isOpen={visible}
      onClose={handleSkip}
      className="max-w-sm"
    >
      <StepDots current={step} total={2} />

      {step === 0 && (
        <>
          {/* Welcome */}
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="mb-3 flex gap-2">
              <Droplets className="h-6 w-6 text-blue-500" />
              <Utensils className="h-6 w-6 text-emerald-500" />
              <Moon className="h-6 w-6 text-violet-500" />
              <HeartPulse className="h-6 w-6 text-rose-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Bem-vindo ao Meus Desafios!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              Vamos personalizar os seus 4 desafios para que se adaptem ao seu estilo de vida.
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Usar padrões
            </button>
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Personalizar <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          {/* Configure all 4 challenges */}
          <h2 className="mt-4 text-center text-base font-bold text-gray-900 dark:text-white">
            Configure os seus desafios
          </h2>

          <div className="mt-4 max-h-[60vh] space-y-5 overflow-y-auto">
            <WaterSection weight={weight} onWeightChange={setWeight} />
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <DietSection target={dietTarget} onTargetChange={setDietTarget} />
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <ExerciseSection target={exerciseTarget} onTargetChange={setExerciseTarget} />
            <div className="border-t border-gray-100 dark:border-gray-800" />
            <SleepSection target={sleepTarget} onTargetChange={setSleepTarget} />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              onClick={() => setStep(0)}
              className="text-sm font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              Voltar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  Salvando <Loader2 className="h-4 w-4 animate-spin" />
                </>
              ) : (
                <>
                  Começar <Check className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
