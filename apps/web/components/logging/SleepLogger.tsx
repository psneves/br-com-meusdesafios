"use client";

import { useState, useEffect } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SleepLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (durationMin: number) => void;
  targetMin?: number;
}

const DURATION_PRESETS = [
  { label: "6h", value: 360 },
  { label: "6.5h", value: 390 },
  { label: "7h", value: 420 },
  { label: "7.5h", value: 450 },
  { label: "8h", value: 480 },
  { label: "8.5h", value: 510 },
];

export function SleepLogger({
  isOpen,
  onClose,
  onLog,
  targetMin = 420,
}: SleepLoggerProps) {
  const [duration, setDuration] = useState(420);
  const [isLogging, setIsLogging] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDuration(targetMin);
      setIsLogging(false);
    }
  }, [isOpen, targetMin]);

  const handleSubmit = async () => {
    setIsLogging(true);
    try {
      await onLog(duration);
      onClose();
    } finally {
      setIsLogging(false);
    }
  };

  const formatDuration = (mins: number): string => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const willMeetGoal = duration >= targetMin;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registar Sono">
      {/* Meta */}
      <div className="mb-4 rounded-lg bg-violet-50 p-3 dark:bg-violet-900/20">
        <p className="text-sm text-violet-700 dark:text-violet-300">
          Meta: <strong>{formatDuration(targetMin)}</strong> por noite
        </p>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantas horas você dormiu?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setDuration(preset.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                duration === preset.value
                  ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-900/30 dark:text-violet-300"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">4h</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatDuration(duration)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">10h</span>
        </div>
        <input
          type="range"
          min={240}
          max={600}
          step={15}
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
          className="mt-2 w-full accent-violet-500"
        />
      </div>

      {/* Preview */}
      {willMeetGoal && (
        <div className="mb-4 rounded-lg bg-violet-50 p-3 dark:bg-violet-900/20">
          <p className="text-sm text-violet-600 dark:text-violet-400">
            <strong>{formatDuration(duration)}</strong> — Meta cumprida!
          </p>
        </div>
      )}

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLogging}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} isLoading={isLogging}>
          Registar {formatDuration(duration)}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
