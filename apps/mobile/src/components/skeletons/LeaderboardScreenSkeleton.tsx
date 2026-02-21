import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../Skeleton";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function LeaderboardScreenSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Filter controls */}
      <View style={styles.filters}>
        <Skeleton width="48%" height={34} borderRadius={8} />
        <Skeleton width="48%" height={34} borderRadius={8} />
      </View>
      <View
        style={{
          paddingHorizontal: spacing.phi4,
          paddingTop: spacing.phi2,
        }}
      >
        <Skeleton width="100%" height={34} borderRadius={8} />
      </View>

      <View style={styles.listContent}>
        {/* My rank card */}
        <View style={styles.rankCard}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Skeleton width={80} height={28} borderRadius={6} />
            <Skeleton width={60} height={28} borderRadius={6} />
          </View>
          <View style={{ marginTop: spacing.phi3, gap: spacing.phi2 }}>
            <Skeleton width="100%" height={14} borderRadius={4} />
            <Skeleton width="100%" height={14} borderRadius={4} />
          </View>
        </View>

        {/* Participant rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.participantRow}>
            <Skeleton width={28} height={16} borderRadius={4} />
            <Skeleton width={32} height={32} borderRadius={16} />
            <View style={{ flex: 1 }}>
              <Skeleton width={100} height={14} borderRadius={4} />
              <Skeleton
                width={70}
                height={10}
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
            <Skeleton width={50} height={14} borderRadius={4} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  filters: {
    flexDirection: "row",
    gap: spacing.phi3,
    paddingHorizontal: spacing.phi4,
    paddingTop: spacing.phi3,
  },
  listContent: { padding: spacing.phi4 },
  rankCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi4,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.phi3,
    marginBottom: spacing.phi2,
    gap: spacing.phi3,
  },
});
