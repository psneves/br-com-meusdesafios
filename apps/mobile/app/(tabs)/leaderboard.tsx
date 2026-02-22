import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../src/api/client";
import { useLeaderboard } from "../../src/hooks/use-leaderboard";
import { useLocation } from "../../src/hooks/use-location";
import { useAuthStore } from "../../src/stores/auth.store";
import { haptics } from "../../src/utils/haptics";
import { UserAvatar } from "../../src/components/UserAvatar";
import { getCategoryStyle } from "../../src/theme/category";
import { LeaderboardScreenSkeleton } from "../../src/components/skeletons/LeaderboardScreenSkeleton";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import type {
  Period,
  Scope,
  Radius,
  ParticipantRow,
} from "@meusdesafios/shared";

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    data,
    isLoading,
    isLoadingMore,
    hasNextPage,
    error,
    period,
    scope,
    radius,
    view,
    setPeriod,
    setScope,
    setRadius,
    setView,
    refresh,
    loadMore,
  } = useLeaderboard();

  const { isRequesting, requestAndSendLocation } = useLocation();
  const [locationSent, setLocationSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    haptics.light();
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleScopeChange = useCallback(
    async (s: Scope) => {
      if (s === "nearby" && !locationSent) {
        const ok = await requestAndSendLocation();
        if (ok) {
          setLocationSent(true);
          setScope("nearby");
        }
        return;
      }
      setScope(s);
    },
    [locationSent, requestAndSendLocation, setScope]
  );

  if (isLoading) {
    return <LeaderboardScreenSkeleton />;
  }

  const rankData = data?.overall;
  const challengeRanks = data?.challengeRanks ?? [];
  const isNearby = scope === "nearby";
  const noLocation = rankData?.rankStatus === "no_location";

  const percentileLabel = rankData?.percentile != null
    ? `Top ${Math.max(1, Math.round((1 - rankData.percentile) * 100))}%`
    : null;

  const participants =
    view === "all"
      ? data?.participantsPage?.items ?? []
      : [
          ...(data?.participantsStandard?.top ?? []),
          ...(data?.participantsStandard?.aroundMe ?? []),
        ];

  const seen = new Set<string>();
  const dedupedParticipants = participants.filter((p) => {
    if (seen.has(p.user.id)) return false;
    seen.add(p.user.id);
    return true;
  });

  // Split standard view into top + aroundMe for section headers
  const topParticipants = view === "standard"
    ? (data?.participantsStandard?.top ?? [])
    : [];
  const aroundMeParticipants = view === "standard"
    ? (data?.participantsStandard?.aroundMe ?? []).filter(
        (p) => !topParticipants.some((t) => t.user.id === p.user.id)
      )
    : [];

  const renderHeader = () => (
    <View>
      {/* Page title */}
      <View style={s.pageTitle}>
        <View style={s.pageTitleIcon}>
          <Ionicons name="trophy" size={20} color="#f59e0b" />
        </View>
        <View>
          <Text style={s.pageTitleText}>Ranking</Text>
          <Text style={s.pageTitleSub}>Compare seu desempenho com o grupo</Text>
        </View>
      </View>

      {/* Period toggle */}
      <View style={s.periodToggle}>
        {(["week", "month"] as Period[]).map((p) => (
          <Pressable
            key={p}
            style={[s.periodBtn, period === p && s.periodBtnActive]}
            onPress={() => setPeriod(p)}
            accessibilityRole="button"
            accessibilityState={{ selected: period === p }}
          >
            <Text style={[s.periodBtnText, period === p && s.periodBtnTextActive]}>
              {p === "week" ? "Semana" : "Mês"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Scope pills */}
      <View style={s.scopeRow}>
        <Pressable
          style={[s.scopePill, scope === "friends" && s.scopePillActive]}
          onPress={() => handleScopeChange("friends")}
          accessibilityRole="button"
          accessibilityState={{ selected: scope === "friends" }}
        >
          <Ionicons
            name="people-outline"
            size={14}
            color={scope === "friends" ? colors.white : colors.gray[500]}
          />
          <Text style={[s.scopePillText, scope === "friends" && s.scopePillTextActive]}>
            Amigos
          </Text>
          <Text style={[s.scopePillCount, scope === "friends" && s.scopePillCountActive]}>
            {user?.friendsCount ?? 0}
          </Text>
        </Pressable>

        <Pressable
          style={[s.scopePill, isNearby && s.scopePillActive]}
          onPress={() => handleScopeChange("nearby")}
          accessibilityRole="button"
          accessibilityState={{ selected: isNearby }}
        >
          <Ionicons
            name="location-outline"
            size={14}
            color={isNearby ? colors.white : colors.gray[500]}
          />
          <Text style={[s.scopePillText, isNearby && s.scopePillTextActive]}>
            Perto de mim
          </Text>
        </Pressable>
      </View>

      {/* Radius sub-pills */}
      {isNearby && !noLocation && (
        <View style={s.radiusRow}>
          {([50, 100, 500] as Radius[]).map((r) => (
            <Pressable
              key={r}
              style={[s.radiusPill, radius === r && s.radiusPillActive]}
              onPress={() => setRadius(r)}
              accessibilityRole="button"
              accessibilityState={{ selected: radius === r }}
            >
              <Text style={[s.radiusPillText, radius === r && s.radiusPillTextActive]}>
                {r} km
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Location prompt */}
      {isNearby && noLocation && (
        <View style={s.locationCard}>
          <View style={s.locationIconCircle}>
            <Ionicons name="location" size={24} color={colors.primary[500]} />
          </View>
          <Text style={s.locationTitle}>Ative sua localização</Text>
          <Text style={s.locationSub}>
            Usamos apenas localização aproximada (~5 km), sem salvar coordenadas precisas.
          </Text>
          <Pressable
            style={s.locationBtn}
            onPress={async () => {
              const ok = await requestAndSendLocation();
              if (ok) {
                setLocationSent(true);
                refresh();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Ativar localização"
          >
            {isRequesting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={s.locationBtnText}>Ativar localização</Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Main rank card */}
      {!noLocation && rankData && (
        <View style={s.rankCard}>
          {/* User row */}
          <View style={s.rankUserRow}>
            <UserAvatar
              avatarUrl={user?.avatarUrl ?? null}
              displayName={user?.displayName ?? "?"}
              size="md"
            />
            <View style={s.rankUserInfo}>
              <Text style={s.rankUserName} numberOfLines={1}>
                {user?.displayName ?? "—"}
              </Text>
              <Text style={s.rankUserHandle}>
                {user?.handle ? `@${user.handle}` : ""}
              </Text>
            </View>
            <View style={s.rankScoreBlock}>
              <Text style={s.rankScoreNumber}>{rankData.score}</Text>
              <Text style={s.rankScoreUnit}> XP</Text>
            </View>
          </View>

          {/* 3-stat grid */}
          <View style={s.statGrid}>
            <View style={s.statCell}>
              <Text style={s.statValue}>{rankData.rank ?? 1}º</Text>
              <Text style={s.statLabel}>Posição</Text>
            </View>
            <View style={[s.statCell, s.statCellBorder]}>
              <Text style={s.statValueHighlight}>
                {percentileLabel ?? "—"}
              </Text>
              <Text style={s.statLabel}>Percentil</Text>
            </View>
            <View style={s.statCell}>
              <Text style={s.statValue}>{rankData.cohortSize}</Text>
              <Text style={s.statLabel}>Participantes</Text>
            </View>
          </View>
        </View>
      )}

      {/* Per-challenge ranks */}
      {!noLocation && challengeRanks.length > 0 && (
        <View style={s.challengeCard}>
          <Text style={s.challengeCardTitle}>POR DESAFIO</Text>
          {challengeRanks.map((cr, i) => {
            const catStyle = getCategoryStyle(cr.category);
            const pctLabel =
              cr.percentile != null
                ? `Top ${Math.max(1, Math.round((1 - cr.percentile) * 100))}%`
                : "—";
            return (
              <View
                key={cr.category}
                style={[
                  s.challengeRankRow,
                  i < challengeRanks.length - 1 && s.challengeRankRowBorder,
                ]}
              >
                <View style={[s.challengeIconBox, { backgroundColor: catStyle.lightBg }]}>
                  <Ionicons
                    name={catStyle.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={catStyle.color}
                  />
                </View>
                <View style={s.challengeRankInfo}>
                  <Text style={s.challengeRankName}>{cr.name}</Text>
                  <Text style={s.challengeRankXP}>{cr.score} XP</Text>
                </View>
                <View style={s.challengeRankRight}>
                  <Text style={s.challengeRankPosition}>
                    {cr.rank != null ? `${cr.rank}º` : "—"}
                  </Text>
                  <Text style={s.challengeRankPct}>{pctLabel}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* View tabs */}
      {!noLocation && (
        <View style={s.viewTabs}>
          <Pressable
            style={[s.viewTab, view === "standard" && s.viewTabActive]}
            onPress={() => setView("standard")}
            accessibilityRole="button"
            accessibilityState={{ selected: view === "standard" }}
          >
            <Text style={[s.viewTabText, view === "standard" && s.viewTabTextActive]}>
              Destaques
            </Text>
          </Pressable>
          <Pressable
            style={[s.viewTab, view === "all" && s.viewTabActive]}
            onPress={() => setView("all")}
            accessibilityRole="button"
            accessibilityState={{ selected: view === "all" }}
          >
            <Text style={[s.viewTabText, view === "all" && s.viewTabTextActive]}>
              Ranking completo
            </Text>
          </Pressable>
        </View>
      )}

      {/* Section header for standard view */}
      {!noLocation && view === "standard" && topParticipants.length > 0 && (
        <Text style={s.sectionHeader}>MELHORES</Text>
      )}

      {/* Section header for all view */}
      {!noLocation && view === "all" && (
        <View style={s.allHeader}>
          <Text style={s.sectionHeader}>TODOS OS PARTICIPANTES</Text>
          {data?.participantsPage && (
            <Text style={s.allHeaderCount}>
              {data.participantsPage.items.length} de {data.participantsPage.totalItems}
            </Text>
          )}
        </View>
      )}

      {error && <Text style={s.error}>{error.message}</Text>}
    </View>
  );

  type ListItem =
    | { type: "participant"; data: ParticipantRow }
    | { type: "divider" };

  const listData: ListItem[] = view === "standard"
    ? [
        ...topParticipants.map((p): ListItem => ({ type: "participant", data: p })),
        ...(aroundMeParticipants.length > 0
          ? [{ type: "divider" } as ListItem]
          : []),
        ...aroundMeParticipants.map((p): ListItem => ({ type: "participant", data: p })),
      ]
    : dedupedParticipants.map((p): ListItem => ({ type: "participant", data: p }));

  return (
    <FlatList
      data={listData}
      keyExtractor={(item, index) => {
        if (item.type === "participant") return item.data.user.id;
        return `divider-${index}`;
      }}
      renderItem={({ item }) => {
        if (item.type === "divider") {
          return (
            <Text style={s.sectionHeader}>SUA REGIÃO NO RANKING</Text>
          );
        }
        const row = item.data;
        const isMe = row.user.id === user?.id;
        return (
          <ParticipantCard
            participant={row}
            isMe={isMe}
            isNearby={isNearby}
          />
        );
      }}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        noLocation ? null : (
          <Text style={s.emptyText}>Nenhum participante encontrado</Text>
        )
      }
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator
            size="small"
            color={colors.primary[500]}
            style={s.footerLoader}
          />
        ) : null
      }
      onEndReached={hasNextPage ? loadMore : undefined}
      onEndReachedThreshold={0.3}
      contentContainerStyle={s.listContent}
      style={s.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary[500]}
        />
      }
    />
  );
}

// ── Participant Card ──────────────────────────────────────

function ParticipantCard({
  participant,
  isMe,
  isNearby,
  onUnfriend,
}: {
  participant: ParticipantRow;
  isMe: boolean;
  isNearby: boolean;
  onUnfriend?: () => void;
}) {
  const { user: pUser, rank, score, goals, accomplishedTotal } = participant;
  const medal = RANK_MEDAL[rank];

  return (
    <View style={[s.pCard, isMe && s.pCardMe]}>
      {/* Rank */}
      <Text style={s.pRank}>{medal ?? `${rank}º`}</Text>

      <UserAvatar
        avatarUrl={pUser.avatarUrl}
        displayName={pUser.displayName}
        size="sm"
      />

      {/* Info */}
      <View style={s.pInfo}>
        <Text style={s.pName} numberOfLines={1}>
          {pUser.displayName}
          {pUser.handle ? (
            <Text style={s.pHandle}> @{pUser.handle}</Text>
          ) : null}
          {isMe ? <Text style={s.pMeTag}> você</Text> : null}
        </Text>
        <View style={s.pMeta}>
          {goals.targets.map((goal) => {
            const catStyle = getCategoryStyle(goal.category);
            return (
              <Ionicons
                key={goal.category}
                name={catStyle.icon as keyof typeof Ionicons.glyphMap}
                size={12}
                color={catStyle.color}
              />
            );
          })}
          <Text style={s.pAccomplished}>
            {accomplishedTotal} concluída{accomplishedTotal !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Score */}
      <View style={s.pScoreBlock}>
        <Text style={s.pScore}>{score}</Text>
        <Text style={s.pScoreUnit}> XP</Text>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  listContent: {
    padding: spacing.phi4,
    paddingBottom: spacing.phi7,
  },

  // Page title
  pageTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi3,
    marginBottom: spacing.phi4,
  },
  pageTitleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fffbeb",
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitleText: {
    ...typography.h3,
    color: colors.gray[900],
  },
  pageTitleSub: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 1,
  },

  // Period toggle
  periodToggle: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[200],
    overflow: "hidden",
    marginBottom: spacing.phi3,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: spacing.phi3,
    alignItems: "center",
  },
  periodBtnActive: {
    backgroundColor: colors.gray[100],
  },
  periodBtnText: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: colors.gray[500],
  },
  periodBtnTextActive: {
    color: colors.gray[900],
    fontWeight: "600",
  },

  // Scope pills
  scopeRow: {
    flexDirection: "row",
    gap: spacing.phi2,
    marginBottom: spacing.phi3,
  },
  scopePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  scopePillActive: {
    backgroundColor: colors.gray[900],
  },
  scopePillText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[500],
  },
  scopePillTextActive: {
    color: colors.white,
  },
  scopePillCount: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[400],
  },
  scopePillCountActive: {
    color: "rgba(255,255,255,0.7)",
  },

  // Radius sub-pills
  radiusRow: {
    flexDirection: "row",
    gap: spacing.phi2,
    marginBottom: spacing.phi3,
  },
  radiusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
  },
  radiusPillActive: {
    backgroundColor: "#e0e7ff",
  },
  radiusPillText: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.gray[400],
  },
  radiusPillTextActive: {
    color: "#4338ca",
  },

  // Location prompt
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi5,
    alignItems: "center",
    gap: spacing.phi3,
    marginBottom: spacing.phi4,
  },
  locationIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: "center",
    justifyContent: "center",
  },
  locationTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.gray[900],
  },
  locationSub: {
    fontSize: 12,
    color: colors.gray[400],
    textAlign: "center",
  },
  locationBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  locationBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
  },

  // Rank card
  rankCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: spacing.phi3,
  },
  rankUserRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.phi4,
    gap: spacing.phi3,
  },
  rankUserInfo: {
    flex: 1,
  },
  rankUserName: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.gray[900],
  },
  rankUserHandle: {
    fontSize: 12,
    color: colors.gray[400],
  },
  rankScoreBlock: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  rankScoreNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4f46e5",
  },
  rankScoreUnit: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(79,70,229,0.7)",
  },

  // 3-stat grid
  statGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.phi4,
  },
  statCellBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.gray[100],
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.gray[900],
  },
  statValueHighlight: {
    fontSize: 22,
    fontWeight: "800",
    color: "#f59e0b",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.gray[400],
    marginTop: 2,
  },

  // Challenge ranks card
  challengeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi3,
  },
  challengeCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.gray[500],
    marginBottom: spacing.phi3,
  },
  challengeRankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.phi3,
    gap: spacing.phi3,
  },
  challengeRankRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  challengeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeRankInfo: {
    flex: 1,
  },
  challengeRankName: {
    ...typography.bodySmall,
    fontWeight: "500",
    color: colors.gray[900],
  },
  challengeRankXP: {
    fontSize: 11,
    color: colors.gray[400],
  },
  challengeRankRight: {
    alignItems: "flex-end",
  },
  challengeRankPosition: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.gray[900],
  },
  challengeRankPct: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.gray[400],
  },

  // View tabs
  viewTabs: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: spacing.phi3,
  },
  viewTab: {
    flex: 1,
    paddingVertical: spacing.phi3,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  viewTabActive: {
    borderBottomColor: "#4f46e5",
  },
  viewTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray[400],
  },
  viewTabTextActive: {
    color: "#4f46e5",
    fontWeight: "600",
  },

  // Section headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: colors.gray[400],
    marginBottom: spacing.phi2,
    marginTop: spacing.phi2,
  },
  allHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.phi2,
    marginTop: spacing.phi2,
  },
  allHeaderCount: {
    fontSize: 11,
    color: colors.gray[400],
  },

  // Participant card
  pCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    borderRadius: 10,
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi3,
    marginBottom: 6,
    gap: spacing.phi3,
  },
  pCardMe: {
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  pRank: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.gray[400],
    width: 28,
    textAlign: "center",
  },
  pInfo: {
    flex: 1,
    minWidth: 0,
  },
  pName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  pHandle: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.gray[400],
  },
  pMeTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6366f1",
  },
  pMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  pAccomplished: {
    fontSize: 10,
    color: colors.gray[400],
  },
  pDot: {
    fontSize: 10,
    color: colors.gray[300],
  },
  pRemove: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.gray[400],
  },
  pScoreBlock: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  pScore: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4f46e5",
  },
  pScoreUnit: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(79,70,229,0.6)",
  },

  // Misc
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.phi3,
  },
  emptyText: {
    ...typography.body,
    color: colors.gray[400],
    textAlign: "center",
    paddingVertical: spacing.phi5,
  },
  footerLoader: {
    paddingVertical: spacing.phi4,
  },
});
