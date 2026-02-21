import { useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLeaderboard } from "../../src/hooks/use-leaderboard";
import { useLocation } from "../../src/hooks/use-location";
import { UserAvatar } from "../../src/components/UserAvatar";
import { getCategoryStyle } from "../../src/theme/category";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";
import type {
  Period,
  Scope,
  Radius,
  LeaderboardView,
  ChallengeRank,
  ParticipantRow,
} from "@meusdesafios/shared";

export default function LeaderboardScreen() {
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

  const { hasPermission, isRequesting, requestAndSendLocation } =
    useLocation();
  const [locationSent, setLocationSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
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
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const participants =
    view === "all"
      ? data?.participantsPage?.items ?? []
      : [
          ...(data?.participantsStandard?.top ?? []),
          ...(data?.participantsStandard?.aroundMe ?? []),
        ];

  // Dedup (aroundMe might overlap with top)
  const seen = new Set<string>();
  const dedupedParticipants = participants.filter((p) => {
    if (seen.has(p.user.id)) return false;
    seen.add(p.user.id);
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Filters */}
      <View style={styles.filters}>
        <SegmentedControl<Period>
          options={[
            { label: "Semana", value: "week" },
            { label: "Mês", value: "month" },
          ]}
          selected={period}
          onSelect={setPeriod}
        />
        <SegmentedControl<Scope>
          options={[
            { label: "Amigos", value: "friends" },
            { label: "Perto", value: "nearby" },
          ]}
          selected={scope}
          onSelect={handleScopeChange}
        />
      </View>

      {scope === "nearby" && (
        <View style={styles.radiusRow}>
          {([50, 100, 500] as Radius[]).map((r) => (
            <Pressable
              key={r}
              style={[
                styles.radiusPill,
                radius === r && styles.radiusPillActive,
              ]}
              onPress={() => setRadius(r)}
            >
              <Text
                style={[
                  styles.radiusPillText,
                  radius === r && styles.radiusPillTextActive,
                ]}
              >
                {r} km
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.viewToggle}>
        <SegmentedControl<LeaderboardView>
          options={[
            { label: "Padrão", value: "standard" },
            { label: "Todos", value: "all" },
          ]}
          selected={view}
          onSelect={setView}
        />
      </View>

      {scope === "nearby" && !locationSent && hasPermission === false && (
        <View style={styles.locationPrompt}>
          <Ionicons
            name="location-outline"
            size={40}
            color={colors.gray[400]}
          />
          <Text style={styles.locationPromptText}>
            Para ver o ranking perto de você, permita o acesso à sua
            localização.
          </Text>
          <Pressable
            style={styles.locationButton}
            onPress={async () => {
              const ok = await requestAndSendLocation();
              if (ok) {
                setLocationSent(true);
                refresh();
              }
            }}
          >
            <Text style={styles.locationButtonText}>
              Permitir localização
            </Text>
          </Pressable>
        </View>
      )}

      {isRequesting && (
        <View style={styles.locationLoading}>
          <ActivityIndicator size="small" color={colors.primary[500]} />
          <Text style={styles.locationLoadingText}>
            Obtendo localização...
          </Text>
        </View>
      )}

      {error && <Text style={styles.error}>{error.message}</Text>}

      <FlatList
        data={dedupedParticipants}
        keyExtractor={(item) => item.user.id}
        renderItem={({ item }) => <ParticipantCard participant={item} />}
        ListHeaderComponent={
          data ? (
            <MyRankCard
              rank={data.overall.rank}
              score={data.overall.score}
              cohortSize={data.overall.cohortSize}
              challengeRanks={data.challengeRanks}
            />
          ) : null
        }
        ListEmptyComponent={
          data?.overall.rankStatus === "no_location" ? (
            <Text style={styles.emptyText}>
              Ative sua localização para ver o ranking perto de você.
            </Text>
          ) : (
            <Text style={styles.emptyText}>
              Nenhum participante encontrado
            </Text>
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary[500]}
              style={styles.footerLoader}
            />
          ) : null
        }
        onEndReached={hasNextPage ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
          />
        }
      />
    </SafeAreaView>
  );
}

function MyRankCard({
  rank,
  score,
  cohortSize,
  challengeRanks,
}: {
  rank: number | null;
  score: number;
  cohortSize: number;
  challengeRanks: ChallengeRank[];
}) {
  return (
    <View style={styles.rankCard}>
      <View style={styles.rankHeader}>
        <View style={styles.rankPosition}>
          <Ionicons name="trophy" size={20} color={colors.primary[500]} />
          <Text style={styles.rankNumber}>
            {rank != null ? `#${rank}` : "-"}
          </Text>
        </View>
        <View style={styles.rankStats}>
          <Text style={styles.rankScore}>{score} pts</Text>
          <Text style={styles.rankCohort}>de {cohortSize}</Text>
        </View>
      </View>

      {challengeRanks.length > 0 && (
        <View style={styles.challengeBreakdown}>
          {challengeRanks.map((cr) => {
            const catStyle = getCategoryStyle(cr.category);
            return (
              <View key={cr.category} style={styles.challengeRankRow}>
                <Ionicons
                  name={catStyle.icon as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color={catStyle.color}
                />
                <Text style={styles.challengeRankName}>{cr.name}</Text>
                <Text style={styles.challengeRankValue}>
                  {cr.rank != null ? `#${cr.rank}` : "-"} ({cr.score} pts)
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ParticipantCard({ participant }: { participant: ParticipantRow }) {
  const { user, rank, score } = participant;
  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <View style={styles.participantRow}>
      <Text style={styles.participantRank}>
        {medal ?? `${rank}`}
      </Text>
      <UserAvatar
        avatarUrl={user.avatarUrl}
        displayName={user.displayName}
        size="sm"
      />
      <View style={styles.participantInfo}>
        <Text style={styles.participantName} numberOfLines={1}>
          {user.displayName}
        </Text>
        <Text style={styles.participantHandle}>@{user.handle}</Text>
      </View>
      <Text style={styles.participantScore}>{score} pts</Text>
    </View>
  );
}

function SegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[
            styles.segmentedItem,
            selected === opt.value && styles.segmentedItemActive,
          ]}
          onPress={() => onSelect(opt.value)}
        >
          <Text
            style={[
              styles.segmentedText,
              selected === opt.value && styles.segmentedTextActive,
            ]}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
  },
  filters: {
    flexDirection: "row",
    gap: spacing.phi3,
    paddingHorizontal: spacing.phi4,
    paddingTop: spacing.phi3,
  },
  viewToggle: {
    paddingHorizontal: spacing.phi4,
    paddingTop: spacing.phi2,
    paddingBottom: spacing.phi3,
  },
  radiusRow: {
    flexDirection: "row",
    gap: spacing.phi2,
    paddingHorizontal: spacing.phi4,
    paddingTop: spacing.phi2,
  },
  radiusPill: {
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi1,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
  },
  radiusPillActive: {
    backgroundColor: colors.primary[500],
  },
  radiusPillText: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: "600",
  },
  radiusPillTextActive: {
    color: colors.white,
  },
  locationPrompt: {
    alignItems: "center",
    paddingVertical: spacing.phi5,
    paddingHorizontal: spacing.phi5,
    gap: spacing.phi3,
  },
  locationPromptText: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: "center",
  },
  locationButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.phi4,
    paddingVertical: spacing.phi3,
    borderRadius: 10,
  },
  locationButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  locationLoading: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.phi2,
    paddingVertical: spacing.phi3,
  },
  locationLoadingText: {
    ...typography.caption,
    color: colors.gray[500],
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: "center",
    paddingHorizontal: spacing.phi4,
    marginBottom: spacing.phi3,
  },
  listContent: {
    paddingHorizontal: spacing.phi4,
    paddingBottom: spacing.phi7,
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
  // My rank card
  rankCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi4,
  },
  rankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankPosition: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi2,
  },
  rankNumber: {
    ...typography.h2,
    color: colors.primary[600],
  },
  rankStats: {
    alignItems: "flex-end",
  },
  rankScore: {
    ...typography.h3,
    color: colors.gray[900],
  },
  rankCohort: {
    ...typography.caption,
    color: colors.gray[500],
  },
  challengeBreakdown: {
    marginTop: spacing.phi3,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    paddingTop: spacing.phi3,
    gap: spacing.phi2,
  },
  challengeRankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi2,
  },
  challengeRankName: {
    ...typography.caption,
    color: colors.gray[700],
    flex: 1,
  },
  challengeRankValue: {
    ...typography.caption,
    color: colors.gray[500],
  },
  // Participant row
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.phi3,
    marginBottom: spacing.phi2,
    gap: spacing.phi3,
  },
  participantRank: {
    ...typography.body,
    color: colors.gray[600],
    fontWeight: "700",
    width: 28,
    textAlign: "center",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    ...typography.body,
    color: colors.gray[900],
    fontWeight: "600",
  },
  participantHandle: {
    ...typography.caption,
    color: colors.gray[500],
  },
  participantScore: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: "700",
  },
  // Segmented control
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    padding: 2,
    flex: 1,
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: spacing.phi2,
    alignItems: "center",
    borderRadius: 6,
  },
  segmentedItemActive: {
    backgroundColor: colors.white,
  },
  segmentedText: {
    ...typography.caption,
    color: colors.gray[500],
    fontWeight: "600",
  },
  segmentedTextActive: {
    color: colors.primary[600],
  },
});
