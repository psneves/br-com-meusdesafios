"use client";

import { useState } from "react";
import { Modal, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface WaterLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: (amount: number) => void;
  currentProgress?: number;
  target?: number;
}

const QUICK_AMOUNTS = [100, 200, 250, 300, 500, 750, 1000];

export function WaterLogger({
  isOpen,
  onClose,
  onLog,
  currentProgress = 0,
  target = 2500,
}: WaterLoggerProps) {
  const [customAmount, setCustomAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  const handleQuickSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (value: string) => {
    const numValue = value.replace(/\D/g, "");
    setCustomAmount(numValue);
    setSelectedAmount(null);
  };

  const getAmount = (): number => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) return parseInt(customAmount, 10);
    return 0;
  };

  const handleSubmit = async () => {
    const amount = getAmount();
    if (amount <= 0) return;

    setIsLogging(true);
    try {
      await onLog(amount);
      onClose();
      setSelectedAmount(null);
      setCustomAmount("");
    } finally {
      setIsLogging(false);
    }
  };

  const amount = getAmount();
  const newTotal = currentProgress + amount;
  const willMeetGoal = newTotal >= target && currentProgress < target;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registar Água">
      {/* Progresso atual */}
      <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Atual: <strong>{currentProgress.toLocaleString()} ml</strong> / {target.toLocaleString()} ml
        </p>
      </div>

      {/* Botões rápidos */}
      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Adicionar rápido
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => handleQuickSelect(amt)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                selectedAmount === amt
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              {amt}ml
            </button>
          ))}
        </div>
      </div>

      {/* Quantidade personalizada */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantidade personalizada (ml)
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="Introduzir quantidade..."
            className={cn(
              "w-full rounded-lg border px-4 py-3 pr-12 text-lg",
              "border-gray-200 bg-white text-gray-900 placeholder-gray-400",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            ml
          </span>
        </div>
      </div>

      {/* Pré-visualização */}
      {amount > 0 && (
        <div
          className={cn(
            "mb-4 rounded-lg p-3",
            willMeetGoal
              ? "bg-blue-50 dark:bg-blue-900/20"
              : "bg-gray-50 dark:bg-gray-800"
          )}
        >
          <p
            className={cn(
              "text-sm",
              willMeetGoal
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            Adicionar <strong>{amount} ml</strong> → Novo total:{" "}
            <strong>{newTotal.toLocaleString()} ml</strong>
            {willMeetGoal && (
              <span className="ml-1 inline-flex items-center gap-1">
                <Trophy className="inline h-4 w-4" /> Meta cumprida!
              </span>
            )}
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
          disabled={amount <= 0}
        >
          Registar {amount > 0 ? `${amount} ml` : "Água"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
