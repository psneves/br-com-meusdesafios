"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Users, UserCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import type { TrackableCategory } from "@meusdesafios/shared";

// ── Mock data ────────────────────────────────────────────

interface RankData {
  scope: "following" | "followers";
  rank: number | null;
  score: number;
  cohortSize: number;
  percentile: number | null;
  rankStatus: "available" | "insufficient_cohort";
}

interface ChallengeRank {
  category: TrackableCategory;
  name: string;
  rank: number | null;
  score: number;
  cohortSize: number;
  percentile: number | null;
}

const mockWeekFollowing: RankData = {
  scope: "following",
  rank: 12,
  score: 210,
  cohortSize: 47,
  percentile: 0.74,
  rankStatus: "available",
};

const mockWeekFollowers: RankData = {
  scope: "followers",
  rank: 8,
  score: 210,
  cohortSize: 31,
  percentile: 0.74,
  rankStatus: "available",
};

const mockMonthFollowing: RankData = {
  scope: "following",
  rank: 15,
  score: 460,
  cohortSize: 47,
  percentile: 0.68,
  rankStatus: "available",
};

const mockMonthFollowers: RankData = {
  scope: "followers",
  rank: 5,
  score: 460,
  cohortSize: 31,
  percentile: 0.84,
  rankStatus: "available",
};

const mockChallengeRanks: Record<string, ChallengeRank[]> = {
  "week-following": [
    { category: "WATER", name: "Água", rank: 8, score: 60, cohortSize: 47, percentile: 0.83 },
    { category: "DIET_CONTROL", name: "Dieta", rank: 14, score: 40, cohortSize: 47, percentile: 0.7 },
    { category: "PHYSICAL_EXERCISE", name: "Exercício", rank: 6, score: 50, cohortSize: 47, percentile: 0.87 },
    { category: "SLEEP", name: "Sono", rank: 18, score: 60, cohortSize: 47, percentile: 0.62 },
  ],
  "week-followers": [
    { category: "WATER", name: "Água", rank: 3, score: 60, cohortSize: 31, percentile: 0.9 },
    { category: "DIET_CONTROL", name: "Dieta", rank: 10, score: 40, cohortSize: 31, percentile: 0.68 },
    { category: "PHYSICAL_EXERCISE", name: "Exercício", rank: 2, score: 50, cohortSize: 31, percentile: 0.94 },
    { category: "SLEEP", name: "Sono", rank: 12, score: 60, cohortSize: 31, percentile: 0.61 },
  ],
  "month-following": [
    { category: "WATER", name: "Água", rank: 10, score: 120, cohortSize: 47, percentile: 0.79 },
    { category: "DIET_CONTROL", name: "Dieta", rank: 20, score: 100, cohortSize: 47, percentile: 0.57 },
    { category: "PHYSICAL_EXERCISE", name: "Exercício", rank: 9, score: 110, cohortSize: 47, percentile: 0.81 },
    { category: "SLEEP", name: "Sono", rank: 22, score: 130, cohortSize: 47, percentile: 0.53 },
  ],
  "month-followers": [
    { category: "WATER", name: "Água", rank: 4, score: 120, cohortSize: 31, percentile: 0.87 },
    { category: "DIET_CONTROL", name: "Dieta", rank: 8, score: 100, cohortSize: 31, percentile: 0.74 },
    { category: "PHYSICAL_EXERCISE", name: "Exercício", rank: 3, score: 110, cohortSize: 31, percentile: 0.9 },
    { category: "SLEEP", name: "Sono", rank: 11, score: 130, cohortSize: 31, percentile: 0.65 },
  ],
};

// ── Page ─────────────────────────────────────────────────

type Period = "week" | "month";
type Scope = "following" | "followers";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week");
  const [scope, setScope] = useState<Scope>("following");

  const rankData =
    period === "week"
      ? scope === "following"
        ? mockWeekFollowing
        : mockWeekFollowers
      : scope === "following"
        ? mockMonthFollowing
        : mockMonthFollowers;

  const challengeRanks = mockChallengeRanks[`${period}-${scope}`] ?? [];

  const percentileLabel =
    rankData.percentile != null
      ? `Top ${Math.round((1 - rankData.percentile) * 100)}%`
      : null;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page title */}
      <div className="flex items-center gap-2.5 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Sua Posição
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Ranking privado entre conexões
          </p>
        </div>
      </div>

      {/* Period toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setPeriod("week")}
          className={cn(
            "flex flex-1 items-center justify-center rounded-l-lg px-4 py-2.5 text-sm font-medium transition-colors",
            period === "week"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
          )}
        >
          Semana
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={cn(
            "flex flex-1 items-center justify-center rounded-r-lg px-4 py-2.5 text-sm font-medium transition-colors",
            period === "month"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
          )}
        >
          Mês
        </button>
      </div>

      {/* Scope tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setScope("following")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            scope === "following"
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Seguindo
        </button>
        <button
          onClick={() => setScope("followers")}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            scope === "followers"
              ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
          )}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Seguidores
        </button>
      </div>

      {/* Main rank card */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-4 p-5">
          <Image
            src="/profile/profile.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Paulo Neves</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {rankData.cohortSize} {rankData.cohortSize === 1 ? "participante" : "participantes"}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
              {rankData.score}
            </span>
            <span className="ml-1 text-sm font-bold text-indigo-500/70 dark:text-indigo-400/60">XP</span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800">
          {rankData.rankStatus === "available" && rankData.rank != null ? (
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
              <div className="flex flex-col items-center py-4">
                <span className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                  {rankData.rank}º
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  Posição
                </span>
              </div>
              <div className="flex flex-col items-center py-4">
                <span className="text-2xl font-extrabold tabular-nums text-amber-500 dark:text-amber-400">
                  {percentileLabel}
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  Percentil
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-400 dark:text-gray-500">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Ranking indisponível: poucos participantes no grupo.</span>
            </div>
          )}
        </div>
      </section>

      {/* Per-challenge ranks */}
      <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <h2 className="px-4 pt-4 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Por desafio
        </h2>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {challengeRanks.map((ch) => {
            const cfg = getCategoryConfig(ch.category);
            const Icon = cfg.icon;
            const pctLabel =
              ch.percentile != null
                ? `Top ${Math.round((1 - ch.percentile) * 100)}%`
                : "—";

            return (
              <div
                key={ch.category}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    cfg.activeBg,
                    cfg.activeBgDark
                  )}
                >
                  <Icon className={cn("h-4 w-4", cfg.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ch.name}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    {ch.score} XP
                  </p>
                </div>
                <div className="text-right">
                  {ch.rank != null ? (
                    <>
                      <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                        {ch.rank}º
                      </span>
                      <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                        {pctLabel}
                      </p>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy notice */}
      <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-800/40">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
        <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          Seu ranking é privado. Apenas sua posição é mostrada — nenhum dado de outros participantes é exposto.
        </p>
      </div>
    </div>
  );
}
