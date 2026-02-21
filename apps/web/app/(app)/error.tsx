"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Algo deu errado
        </h2>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
      </div>
      <button
        onClick={reset}
        className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
