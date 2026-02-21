"use client";

import { useState, useCallback } from "react";
import { Trophy, Users, UserCheck, MapPin, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { useSession } from "@/lib/hooks/use-session";
import type { Radius } from "@/lib/types/leaderboard";

const RADIUS_OPTIONS: Radius[] = [50, 100, 500];

// ── Loading Skeleton ─────────────────────────────────────

function LeaderboardSkeleton() {
  return (
    <div className="space-y-phi-4 md:space-y-phi-5 animate-pulse">
      <div className="flex items-center gap-phi-3 pt-2">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="h-10 rounded-lg bg-gray-200 dark:bg-gray-800" />
      <div className="h-8 w-48 rounded-full bg-gray-200 dark:bg-gray-800" />
      <div className="h-40 rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-56 rounded-xl bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function LeaderboardPage() {
  const leaderboard = useLeaderboard();
  const session = useSession();
  const [isActivatingLocation, setIsActivatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const activateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Seu navegador não suporta geolocalização.");
      return;
    }

    setIsActivatingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 15000,
          });
        }
      );

      const res = await fetch("/api/profile/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      if (!res.ok) throw new Error("Falha ao salvar localização");

      leaderboard.refresh();
    } catch (err: unknown) {
      // GeolocationPositionError has a numeric .code property
      const geoErr = err as { code?: number };
      if (typeof geoErr.code === "number" && geoErr.code >= 1 && geoErr.code <= 3) {
        setLocationError(
          geoErr.code === 1
            ? "Permissão de localização negada. Ative nas configurações do navegador."
            : geoErr.code === 3
              ? "Tempo esgotado ao buscar localização. Tente novamente."
              : "Não foi possível obter sua localização. Tente novamente."
        );
      } else {
        setLocationError("Erro ao ativar localização. Tente novamente.");
      }
      console.error("[activateLocation]", err);
    } finally {
      setIsActivatingLocation(false);
    }
  }, [leaderboard]);

  if (leaderboard.isLoading || session.isLoading) {
    return <LeaderboardSkeleton />;
  }

  if (leaderboard.error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <Trophy className="h-7 w-7 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Erro ao carregar ranking
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Não foi possível buscar seus dados. Verifique sua conexão.
          </p>
        </div>
        <button
          onClick={leaderboard.refresh}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const rankData = leaderboard.data?.overall;
  const challengeRanks = leaderboard.data?.challengeRanks ?? [];
  const isNearby = leaderboard.scope === "nearby";
  const noLocation = rankData?.rankStatus === "no_location";

  const percentileLabel =
    rankData?.percentile != null
      ? `Top ${Math.round((1 - rankData.percentile) * 100)}%`
      : null;

  const scopePillClass = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
      active
        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
    );

  return (
    <div className="space-y-phi-4 md:space-y-phi-5">
      {/* Page title */}
      <div className="flex items-center gap-phi-3 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Sua Posição
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Compare seu desempenho com suas conexões
          </p>
        </div>
      </div>

      {/* Period toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => leaderboard.setPeriod("week")}
          className={cn(
            "flex flex-1 items-center justify-center rounded-l-lg px-4 py-2.5 text-sm font-medium transition-colors",
            leaderboard.period === "week"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
          )}
        >
          Semana
        </button>
        <button
          onClick={() => leaderboard.setPeriod("month")}
          className={cn(
            "flex flex-1 items-center justify-center rounded-r-lg px-4 py-2.5 text-sm font-medium transition-colors",
            leaderboard.period === "month"
              ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
              : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50"
          )}
        >
          Mês
        </button>
      </div>

      {/* Scope tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => leaderboard.setScope("following")}
          className={scopePillClass(leaderboard.scope === "following")}
        >
          <Users className="h-3.5 w-3.5" />
          Seguindo
        </button>
        <button
          onClick={() => leaderboard.setScope("followers")}
          className={scopePillClass(leaderboard.scope === "followers")}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Seguidores
        </button>
        <button
          onClick={() => leaderboard.setScope("nearby")}
          className={scopePillClass(isNearby)}
        >
          <MapPin className="h-3.5 w-3.5" />
          Perto de mim
        </button>
      </div>

      {/* Radius sub-pills (only when nearby) */}
      {isNearby && !noLocation && (
        <div className="flex gap-1.5">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => leaderboard.setRadius(r)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                leaderboard.radius === r
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-gray-700"
              )}
            >
              {r} km
            </button>
          ))}
        </div>
      )}

      {/* No-location CTA */}
      {isNearby && noLocation ? (
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-3 px-phi-4 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
              <MapPin className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Ative sua localização
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Para ver seu ranking regional, precisamos da sua localização aproximada.
              </p>
            </div>
            <button
              onClick={activateLocation}
              disabled={isActivatingLocation}
              className="mt-1 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isActivatingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Obtendo localização...
                </>
              ) : (
                "Ativar localização"
              )}
            </button>
            {isActivatingLocation && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500">
                Permita o acesso à localização no seu navegador.
              </p>
            )}
            {locationError && (
              <p className="text-xs text-red-500 dark:text-red-400">
                {locationError}
              </p>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Main rank card */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-phi-4 p-phi-4">
              <DefaultAvatar
                name={session.user?.displayName ?? ""}
                avatarUrl={session.user?.avatarUrl}
                size="lg"
                className="ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {session.user?.displayName ?? "—"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  @{session.user?.handle ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
                  {rankData?.score ?? 0}
                </span>
                <span className="ml-1 text-sm font-bold text-indigo-500/70 dark:text-indigo-400/60">
                  XP
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800">
              {rankData?.rankStatus === "available" && rankData.rank != null ? (
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
                  <span>
                    {isNearby
                      ? `Menos de 5 usuários encontrados em ${leaderboard.radius} km. Tente um raio maior.`
                      : "Adicione pelo menos 4 conexões para desbloquear seu ranking."}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Per-challenge ranks */}
          <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <h2 className="px-phi-4 pt-phi-4 pb-phi-2 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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
                    className="flex items-center gap-phi-3 px-phi-4 py-phi-3"
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
        </>
      )}

      {/* Privacy notice */}
      <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-phi-3 py-phi-3 dark:bg-gray-800/40">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
        <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500">
          Seu ranking é privado. Apenas sua posição e pontuação são visíveis
          para você — ninguém mais tem acesso a esses dados.
        </p>
      </div>
    </div>
  );
}
