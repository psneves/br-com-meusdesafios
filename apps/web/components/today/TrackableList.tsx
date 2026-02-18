"use client";

import { TrackableCard, TrackableCardSkeleton } from "@/components/trackables/TrackableCard";
import { EmptyState, CustomizeCTA } from "./EmptyState";
import type { TodayCard } from "@/lib/types/today";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: Record<string, number> = {
  WATER: 0,
  PHYSICAL_EXERCISE: 1,
  DIET_CONTROL: 2,
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

  return (
    <div className={cn("grid grid-cols-1 gap-phi-2", className)}>
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

export function TrackableListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-phi-2">
      {Array.from({ length: count }).map((_, i) => (
        <TrackableCardSkeleton key={i} />
      ))}
    </div>
  );
}
