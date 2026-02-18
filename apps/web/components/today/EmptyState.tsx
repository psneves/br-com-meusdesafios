import { Button } from "@/components/ui/Button";
import { Compass, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = "Nenhum desafio ativo",
  description = "Começa a tua jornada ativando alguns desafios para acompanhar o teu progresso.",
  actionLabel = "Explorar desafios",
  actionHref = "/trackables/activate",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/50">
      <Compass className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
      <Link href={actionHref}>
        <Button variant="primary" size="lg">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
}

export function CustomizeCTA() {
  return (
    <Link
      href="/profile"
      className="flex items-center gap-phi-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-phi-3 transition-colors hover:bg-gray-100/50 dark:border-gray-700 dark:bg-gray-800/20 dark:hover:bg-gray-800/40"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <Settings className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Personalizar hoje
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Ajustar metas
        </p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600" />
    </Link>
  );
}
