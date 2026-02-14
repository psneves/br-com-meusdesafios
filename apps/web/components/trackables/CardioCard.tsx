"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { StreakBadge } from "./StreakBadge";
import { PointsChip } from "./PointsChip";
import { QuickActionRow } from "./QuickActionRow";
import { TrackableProgress } from "./TrackableProgress";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getCategoryConfig, cardioConfig } from "@/lib/category-config";
import { HeartPulse } from "lucide-react";
import type { TodayCard } from "@/lib/types/today";
import { cn } from "@/lib/utils";

interface CardioCardProps {
  cards: TodayCard[];
  onQuickAction: (cardId: string, actionId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function CardioCard({
  cards,
  onQuickAction,
  isLoading = false,
  className,
}: CardioCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [summaryPeriod, setSummaryPeriod] = useState<"today" | "7d" | "30d">("today");
  const activeCard = cards[activeIndex];

  if (!activeCard) return null;

  const totalPoints = cards.reduce((sum, c) => sum + c.pointsToday, 0);
  const allMet = cards.every((c) => c.progress.met);
  const anyMet = cards.some((c) => c.progress.met);
  const metCount = cards.filter((c) => c.progress.met).length;
  const activeCfg = getCategoryConfig(activeCard.category);

  const formatVal = (v: number) =>
    v >= 1000 ? v.toLocaleString() : v % 1 !== 0 ? v.toFixed(1) : v.toString();

  return (
    <>
      {/* Mobile cardio card */}
      <div
        className={cn(
          "flex flex-col rounded-xl border border-gray-200 border-l-[3px] bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:hidden",
          cardioConfig.borderAccent,
          anyMet && cn(cardioConfig.bgLight, cardioConfig.bgDark),
          className
        )}
      >
        {/* Header: title + summary badge */}
        <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
          <div className="flex items-center gap-1.5">
            <HeartPulse className={cn("h-4 w-4", cardioConfig.color)} />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Cardio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              allMet
                ? cn(cardioConfig.activeBg, cardioConfig.metText, cardioConfig.activeBgDark, cardioConfig.metTextDark)
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {metCount}/{cards.length}
            </span>
            <PointsChip points={totalPoints} showZero size="sm" />
          </div>
        </div>

        {/* All 3 activities – mini rows */}
        <div className="flex flex-col gap-1 px-3 pb-1">
          {cards.map((card, i) => {
            const cfg = getCategoryConfig(card.category);
            const CardIcon = cfg.icon;
            return (
              <button
                key={card.userTrackableId}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors",
                  i === activeIndex
                    ? cn(cfg.activeBg, cfg.activeBgDark)
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                <CardIcon className={cn("h-3.5 w-3.5", cfg.color)} />
                <div className="flex-1">
                  <ProgressBar
                    value={card.progress.percentage}
                    max={100}
                    size="sm"
                    variant={card.progress.met ? "success" : "default"}
                    accentColor={cn(cfg.barColor, cfg.barColorDark)}
                  />
                </div>
                <span className="text-right text-[10px] text-gray-500 dark:text-gray-400">
                  <span className={cn("font-semibold", card.progress.met ? cn(cfg.metText, cfg.metTextDark) : "text-gray-700 dark:text-gray-300")}>
                    {formatVal(card.progress.value)}
                  </span>
                  /{formatVal(card.goal.target || 0)}
                </span>
                <StreakBadge current={card.streak.current} />
              </button>
            );
          })}
        </div>

        {/* Action row for active card */}
        <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2 dark:border-gray-800">
          <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            {(() => { const Icon = activeCfg.icon; return <Icon className={cn("h-3 w-3", activeCfg.color)} />; })()}
            {activeCard.name}
          </span>
          <button
            onClick={() =>
              onQuickAction(
                activeCard.userTrackableId,
                activeCard.quickActions[0]?.id || ""
              )
            }
            disabled={isLoading}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors active:scale-95",
              activeCfg.btnBg, activeCfg.btnHover, activeCfg.btnBgDark, activeCfg.btnHoverDark
            )}
          >
            {activeCard.quickActions[0]?.label || "Registar"}
          </button>
        </div>
      </div>

      {/* Desktop full cardio card (spans 2 rows) */}
      <Card
        hover
        className={cn(
          "hidden border-l-[3px] md:block md:row-span-2",
          cardioConfig.borderAccent,
          anyMet && cn(cardioConfig.bgLight, cardioConfig.bgDark),
          className
        )}
      >
        {/* Header */}
        <CardHeader>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <HeartPulse className={cn("h-5 w-5", cardioConfig.color)} />
            Cardio
          </h3>
          <div className="flex items-center gap-2">
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              allMet
                ? cn(cardioConfig.activeBg, cardioConfig.metText, cardioConfig.activeBgDark, cardioConfig.metTextDark)
                : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            )}>
              {metCount}/{cards.length}
            </span>
            <PointsChip points={totalPoints} showZero />
          </div>
        </CardHeader>

        {/* Tabs — icon only */}
        <div className="mx-4 mt-2 flex gap-1 border-b border-gray-100 dark:border-gray-800">
          {cards.map((card, i) => {
            const cfg = getCategoryConfig(card.category);
            const TabIcon = cfg.icon;
            return (
              <button
                key={card.userTrackableId}
                onClick={() => setActiveIndex(i)}
                title={card.name}
                className={cn(
                  "flex items-center gap-1.5 rounded-t-lg px-3 py-2 transition-colors",
                  i === activeIndex
                    ? cn("border-b-2", cfg.activeBorder, cfg.activeBg, cfg.activeBgDark)
                    : "opacity-50 hover:opacity-80"
                )}
              >
                <TabIcon className={cn("h-4 w-4", cfg.color)} />
                {card.progress.met && (
                  <span className={cn("text-xs", cfg.metText, cfg.metTextDark)}>&#10003;</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active tab content */}
        <CardContent>
          <div className="flex items-center justify-between">
            <TrackableProgress
              goal={activeCard.goal}
              progress={activeCard.progress}
              className="flex-1"
              accentColor={cn(activeCfg.barColor, activeCfg.barColorDark)}
              metTextClass={cn(activeCfg.metText, activeCfg.metTextDark)}
            />
            <StreakBadge
              current={activeCard.streak.current}
              best={activeCard.streak.best}
              showBest={
                activeCard.streak.current > 0 &&
                activeCard.streak.current < activeCard.streak.best
              }
              className="ml-4"
            />
          </div>

          <div className="mt-4">
            <QuickActionRow
              actions={activeCard.quickActions}
              onAction={(actionId) =>
                onQuickAction(activeCard.userTrackableId, actionId)
              }
              loadingActionId={isLoading ? "loading" : null}
              categoryAccent={activeCfg}
            />
          </div>
        </CardContent>

        {/* Overview of all 3 activities with period tabs */}
        <div className="mx-4 mt-2 flex flex-col rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between border-b border-gray-200/60 px-3 pt-2.5 pb-1.5 dark:border-gray-700/40">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Resumo
            </p>
            <div className="flex gap-1">
              {(["today", "7d", "30d"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSummaryPeriod(period)}
                  className={cn(
                    "rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors",
                    summaryPeriod === period
                      ? cn(cardioConfig.activeBg, cardioConfig.metText, cardioConfig.activeBgDark, cardioConfig.metTextDark)
                      : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  )}
                >
                  {period === "today" ? "Hoje" : period === "7d" ? "7 dias" : "30 dias"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 p-3">
            {cards.map((card) => {
              const cfg = getCategoryConfig(card.category);
              const RowIcon = cfg.icon;
              const periodData =
                summaryPeriod === "7d"
                  ? card.period7d
                  : summaryPeriod === "30d"
                    ? card.period30d
                    : null;

              const value = periodData ? periodData.value : card.progress.value;
              const target = periodData
                ? (card.goal.target || 0) * (summaryPeriod === "7d" ? 7 : 30)
                : card.goal.target || 0;
              const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;
              const unit = card.goal.unit || "";

              return (
                <div key={card.userTrackableId} className="flex items-center gap-2">
                  <RowIcon className={cn("h-3.5 w-3.5", cfg.color)} />
                  <div className="flex-1">
                    <ProgressBar
                      value={pct}
                      max={100}
                      size="sm"
                      variant={pct >= 100 ? "success" : "default"}
                      accentColor={cn(cfg.barColor, cfg.barColorDark)}
                    />
                  </div>
                  <span className="min-w-[4.5rem] text-right text-[10px] text-gray-500 dark:text-gray-400">
                    {formatVal(value)}/{formatVal(target)} {unit}
                  </span>
                </div>
              );
            })}
            {summaryPeriod !== "today" && (
              <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                {cards.reduce((s, c) => {
                  const p = summaryPeriod === "7d" ? c.period7d : c.period30d;
                  return s + (p?.count || 0);
                }, 0)} sessões no total
              </p>
            )}
          </div>
        </div>

        <CardFooter>
          <PointsChip points={activeCard.pointsToday} showZero />
          {allMet && (
            <span className={cn("text-xs", cardioConfig.metText, cardioConfig.metTextDark)}>
              Todo o cardio cumprido!
            </span>
          )}
          {!allMet && anyMet && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {metCount}/{cards.length} cumpridas
            </span>
          )}
        </CardFooter>
      </Card>
    </>
  );
}
