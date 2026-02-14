import { Button } from "@/components/ui/Button";
import { Compass } from "lucide-react";
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
