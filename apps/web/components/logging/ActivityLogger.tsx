"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getCategoryConfig } from "@/lib/category-config";
import { cn } from "@/lib/utils";
import type { TrackableCategory } from "@meusdesafios/shared";

interface ActivityLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (value: number, unit: string) => void;
  category: TrackableCategory;
  name: string;
  icon: string;
  currentProgress?: number;
  target?: number;
  unit?: string;
}

const PRESETS: Record<string, { label: string; value: number }[]> = {
  RUN: [
    { label: "2 km", value: 2 },
    { label: "3 km", value: 3 },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
  ],
  BIKE: [
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "20 km", value: 20 },
    { label: "30 km", value: 30 },
  ],
  SWIM: [
    { label: "0.5 km", value: 0.5 },
    { label: "1 km", value: 1 },
    { label: "1.5 km", value: 1.5 },
    { label: "2 km", value: 2 },
  ],
  GYM: [
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
  ],
};

export function ActivityLogger({
  isOpen,
  onClose,
  onLog,
  category,
  name,
  icon,
  currentProgress = 0,
  target = 0,
  unit = "km",
}: ActivityLoggerProps) {
  const [value, setValue] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const cfg = getCategoryConfig(category);
  const Icon = cfg.icon;
  const presets = PRESETS[category] || [];

  const handlePresetSelect = (presetValue: number) => {
    setSelectedPreset(presetValue);
    setValue("");
  };

  const handleValueChange = (inputValue: string) => {
    const cleaned = inputValue.replace(/[^\d.]/g, "");
    setValue(cleaned);
    setSelectedPreset(null);
  };

  const getNumericValue = (): number => {
    if (selectedPreset) return selectedPreset;
    if (value) return parseFloat(value) || 0;
    return 0;
  };

  const handleSubmit = async () => {
    const numValue = getNumericValue();
    if (numValue <= 0) return;

    setIsLogging(true);
    try {
      await onLog(numValue, unit);
      onClose();
      setValue("");
      setSelectedPreset(null);
    } finally {
      setIsLogging(false);
    }
  };

  const numValue = getNumericValue();
  const newTotal = currentProgress + numValue;
  const willMeetGoal = target > 0 && newTotal >= target && currentProgress < target;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Icon className={cn("h-5 w-5", cfg.color)} /> Registar {name}
        </span>
      }
    >
      {/* Progresso atual */}
      {target > 0 && (
        <div className={cn("mb-4 rounded-lg p-3", cfg.activeBg, cfg.activeBgDark)}>
          <p className={cn("text-sm", cfg.metText, cfg.metTextDark)}>
            Atual: <strong>{currentProgress} {unit}</strong> / {target} {unit}
          </p>
        </div>
      )}

      {/* Seleção rápida */}
      {presets.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleção rápida
          </p>
          <div className="grid grid-cols-4 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  selectedPreset === preset.value
                    ? cn("border-current", cfg.activeBg, cfg.metText, cfg.activeBgDark, cfg.metTextDark)
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Valor personalizado */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          {category === "GYM" ? "Duração" : "Distância"}
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder="Introduzir valor..."
            className={cn(
              "w-full rounded-lg border px-4 py-3 pr-12 text-lg",
              "border-gray-200 bg-white text-gray-900 placeholder-gray-400",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500",
              "focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {unit}
          </span>
        </div>
      </div>

      {/* Pré-visualização */}
      {numValue > 0 && (
        <div
          className={cn(
            "mb-4 rounded-lg p-3",
            willMeetGoal
              ? cn(cfg.activeBg, cfg.activeBgDark)
              : "bg-gray-50 dark:bg-gray-800"
          )}
        >
          <p
            className={cn(
              "text-sm",
              willMeetGoal
                ? cn(cfg.metText, cfg.metTextDark)
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            Adicionar <strong>{numValue} {unit}</strong>
            {target > 0 && (
              <>
                {" "}→ Novo total: <strong>{newTotal} {unit}</strong>
              </>
            )}
            {willMeetGoal && " Meta cumprida!"}
          </p>
        </div>
      )}

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLogging}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={isLogging}
          disabled={numValue <= 0}
        >
          Registar {numValue > 0 ? `${numValue} ${unit}` : name}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
