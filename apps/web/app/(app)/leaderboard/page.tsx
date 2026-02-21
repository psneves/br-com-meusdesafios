"use client";

import { useCallback, useMemo, useState } from "react";
import { Trophy, Users, MapPin, Loader2, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/category-config";
import { DefaultAvatar } from "@/components/ui/DefaultAvatar";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { useSession } from "@/lib/hooks/use-session";
import { encodeGeohash, LOCATION_CELL_PRECISION } from "@/lib/location/geohash";
import type { ParticipantRow, Radius } from "@/lib/types/leaderboard";

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

// ── Participant Row ──────────────────────────────────────

function ParticipantCard({ row, me }: { row: ParticipantRow; me: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-phi-3 rounded-lg px-phi-3 py-phi-3 transition-colors",
        me
          ? "bg-indigo-50/80 ring-1 ring-indigo-200 dark:bg-indigo-950/25 dark:ring-indigo-800"
          : "bg-gray-50 dark:bg-gray-800/40"
      )}
    >
      {/* Rank */}
      <span className="w-7 text-center text-sm font-bold tabular-nums text-gray-400 dark:text-gray-500">
        {row.rank}º
      </span>

      <DefaultAvatar
        name={row.user.displayName}
        avatarUrl={row.user.avatarUrl}
      />

      {/* Name + handle + active challenges */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {row.user.displayName}
        </p>
        {row.user.handle && (
          <p className="truncate text-[11px] text-gray-400 dark:text-gray-500">@{row.user.handle}</p>
        )}
        <div className="mt-0.5 flex items-center gap-1">
          {row.goals.targets.map((goal) => {
            const cfg = getCategoryConfig(goal.category);
            const Icon = cfg.icon;
            return (
              <Icon
                key={goal.category}
                className={cn("h-3 w-3", cfg.color)}
                aria-label={goal.category}
              />
            );
          })}
          <span className="ml-0.5 text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
            {row.accomplishedTotal} concluída{row.accomplishedTotal !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <span className="text-lg font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
          {row.score}
        </span>
        <span className="ml-0.5 text-[10px] font-bold text-indigo-500/70 dark:text-indigo-400/60">
          XP
        </span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────

export default function LeaderboardPage() {
  const leaderboard = useLeaderboard();
  const session = useSession();
  const [isActivatingLocation, setIsActivatingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showPointsInfo, setShowPointsInfo] = useState(false);

  const activateLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError("Seu navegador não suporta geolocalização.");
      return;
    }

    setIsActivatingLocation(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 15000,
        });
      });

      const cellId = encodeGeohash(
        position.coords.latitude,
        position.coords.longitude,
        LOCATION_CELL_PRECISION
      );

      const res = await fetch("/api/profile/location", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellId }),
      });

      if (!res.ok) throw new Error("Falha ao salvar localização");
      leaderboard.refresh();
    } catch (err: unknown) {
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

  const rankData = leaderboard.data?.overall;
  const challengeRanks = leaderboard.data?.challengeRanks ?? [];
  const participantsStandard = leaderboard.data?.participantsStandard;
  const participantsPage = leaderboard.data?.participantsPage;

  const isNearby = leaderboard.scope === "nearby";
  const noLocation = rankData?.rankStatus === "no_location";
  const percentileLabel = useMemo(() => {
    if (rankData?.percentile == null) return null;
    return `Top ${Math.max(1, Math.round((1 - rankData.percentile) * 100))}%`;
  }, [rankData?.percentile]);

  const scopePillClass = (active: boolean) =>
    cn(
      "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
      active
        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
        : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
    );

  const viewTabClass = (active: boolean) =>
    cn(
      "flex-1 py-2 text-center text-xs font-medium transition-colors",
      active
        ? "border-b-2 border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
        : "border-b-2 border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
    );

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
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Erro ao carregar ranking</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Não foi possível buscar os dados do grupo.
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

  return (
    <div className="space-y-phi-4 md:space-y-phi-5">
      {/* Page title */}
      <div className="flex items-center gap-phi-3 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/30">
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Ranking</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Compare seu desempenho com o grupo
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

      {/* Scope pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => leaderboard.setScope("friends")}
          className={scopePillClass(leaderboard.scope === "friends")}
        >
          <Users className="h-3.5 w-3.5" />
          Amigos
          <span
            className={cn(
              "ml-0.5 tabular-nums",
              leaderboard.scope === "friends"
                ? "text-white/70 dark:text-gray-900/60"
                : "text-gray-400 dark:text-gray-500"
            )}
          >
            {session.user?.friendsCount ?? 0}
          </span>
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
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Ative sua localização</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Usamos apenas célula aproximada (~5 km), sem salvar coordenadas precisas.
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
            {locationError && (
              <p className="text-xs text-red-500 dark:text-red-400">{locationError}</p>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Main rank card */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-phi-4 p-phi-4">
              <DefaultAvatar
                name={session.user?.displayName || "?"}
                avatarUrl={session.user?.avatarUrl}
                size="lg"
                className="ring-2 ring-gray-200 dark:ring-gray-700"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {session.user?.displayName || "—"}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {session.user?.handle ? `@${session.user.handle}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="text-right">
                  <span className="text-3xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
                    {rankData?.score ?? 0}
                  </span>
                  <span className="ml-1 text-sm font-bold text-indigo-500/70 dark:text-indigo-400/60">XP</span>
                </div>
                <button
                  onClick={() => setShowPointsInfo(true)}
                  aria-label="Como funciona o XP"
                  className="rounded-full p-1 text-gray-300 hover:bg-gray-100 hover:text-gray-500 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-400"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800">
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800">
                <div className="flex flex-col items-center py-4">
                  <span className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                    {rankData?.rank ?? 1}º
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">Posição</span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="text-2xl font-extrabold tabular-nums text-amber-500 dark:text-amber-400">
                    {percentileLabel ?? "—"}
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">Percentil</span>
                </div>
                <div className="flex flex-col items-center py-4">
                  <span className="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
                    {rankData?.cohortSize ?? 0}
                  </span>
                  <span className="mt-0.5 text-[11px] font-medium text-gray-400 dark:text-gray-500">Participantes</span>
                </div>
              </div>
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
                    ? `Top ${Math.max(1, Math.round((1 - ch.percentile) * 100))}%`
                    : "—";

                return (
                  <div key={ch.category} className="flex items-center gap-phi-3 px-phi-4 py-phi-3">
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{ch.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{ch.score} XP</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold tabular-nums text-gray-900 dark:text-white">
                        {ch.rank ?? "—"}
                        {ch.rank != null ? "º" : ""}
                      </span>
                      <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{pctLabel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Participants — view tabs are contextual within this section */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            {/* View tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => leaderboard.setView("standard")}
                className={viewTabClass(leaderboard.view === "standard")}
              >
                Destaques
              </button>
              <button
                onClick={() => leaderboard.setView("all")}
                className={viewTabClass(leaderboard.view === "all")}
              >
                Ranking completo
              </button>
            </div>

            <div className="p-phi-4">
              {leaderboard.view === "standard" ? (
                <div className="space-y-phi-4">
                  {/* Top */}
                  <div>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Melhores
                    </h3>
                    <div className="space-y-1.5">
                      {(participantsStandard?.top ?? []).map((row) => (
                        <ParticipantCard
                          key={`top-${row.user.id}`}
                          row={row}
                          me={row.user.id === session.user?.id}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Around me */}
                  {(participantsStandard?.aroundMe ?? []).length > 0 && (
                    <div>
                      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        Sua região no ranking
                      </h3>
                      <div className="space-y-1.5">
                        {(participantsStandard?.aroundMe ?? []).map((row) => (
                          <ParticipantCard
                            key={`around-${row.user.id}`}
                            row={row}
                            me={row.user.id === session.user?.id}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-phi-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Todos os participantes
                    </span>
                    <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500">
                      {participantsPage?.items.length ?? 0} de {participantsPage?.totalItems ?? 0}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {(participantsPage?.items ?? []).map((row) => (
                      <ParticipantCard
                        key={`all-${row.user.id}`}
                        row={row}
                        me={row.user.id === session.user?.id}
                      />
                    ))}
                  </div>

                  {leaderboard.hasNextPage && (
                    <button
                      onClick={leaderboard.loadMore}
                      disabled={leaderboard.isLoadingMore}
                      className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      {leaderboard.isLoadingMore ? "Carregando..." : "Carregar mais"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* XP rules modal */}
      <Modal
        isOpen={showPointsInfo}
        onClose={() => setShowPointsInfo(false)}
        title="Como funciona o XP"
      >
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              XP diário
            </h3>
            <p>
              Cada meta diária atingida em qualquer desafio vale{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Dia perfeito
            </h3>
            <p>
              Cumprir <em>todos</em> os 4 desafios no mesmo dia rende{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>{" "}
              extra.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Meta semanal
            </h3>
            <p>
              Completar 7/7 dias de um desafio (Seg–Dom) vale{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>{" "}
              por desafio.
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
              Semana perfeita
            </h3>
            <p>
              Bater <em>todas</em> as metas em <em>todos</em> os 7 dias da semana rende mais{" "}
              <strong className="text-indigo-600 dark:text-indigo-400">+10 XP</strong>{" "}
              de bônus.
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            A semana conta de segunda a domingo. Os XP acumulados determinam a posição no ranking.
          </p>
        </div>
      </Modal>
    </div>
  );
}
