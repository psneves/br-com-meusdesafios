"use client";

import { Star } from "lucide-react";
import { TrackableCard, TrackableCardSkeleton } from "@/components/trackables/TrackableCard";
import { EmptyState, CustomizeCTA } from "./EmptyState";
import type { TodayCard } from "@/lib/types/today";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: Record<string, number> = {
  WATER: 0,
  DIET_CONTROL: 1,
  PHYSICAL_EXERCISE: 2,
  SLEEP: 3,
};

interface TrackableListProps {
  cards: TodayCard[];
  onRegister: (cardId: string) => void;
  className?: string;
}

export function TrackableList({
  cards,
  onRegister,
  className,
}: TrackableListProps) {
  if (cards.length === 0) {
    return <EmptyState />;
  }

  const sortedCards = [...cards].sort(
    (a, b) => (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)
  );

  const isPerfectDay = cards.length >= 4 && cards.every((c) => c.progress.met);

  return (
    <div className={cn("grid grid-cols-1 gap-phi-2", className)}>
      {isPerfectDay && <PerfectDayBanner />}
      {sortedCards.map((card) => (
        <TrackableCard
          key={card.userTrackableId}
          card={card}
          onRegister={() => onRegister(card.userTrackableId)}
        />
      ))}
      {cards.length > 0 && cards.length < 4 && <CustomizeCTA />}
    </div>
  );
}

function PerfectDayBanner() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-2.5 dark:border-amber-500/20 dark:bg-amber-900/15">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
        Dia Perfeito!
      </span>
      <span className="text-xs text-amber-600/80 dark:text-amber-400/70">
        Todos os desafios concluídos
      </span>
    </div>
  );
}

export function TrackableListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-phi-2">
      {Array.from({ length: count }).map((_, i) => (
        <TrackableCardSkeleton key={i} />
      ))}
    </div>
  );
}
