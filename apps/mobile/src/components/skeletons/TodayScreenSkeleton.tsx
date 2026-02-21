import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../Skeleton";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function TodayScreenSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header: avatar + user info + settings gear */}
        <View style={styles.header}>
          <View style={styles.userSection}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ gap: 4 }}>
              <Skeleton width={130} height={16} borderRadius={4} />
              <Skeleton width={80} height={12} borderRadius={4} />
              <Skeleton width={100} height={12} borderRadius={4} />
            </View>
          </View>
          <Skeleton width={20} height={20} borderRadius={10} />
        </View>

        {/* Day nav pill */}
        <View style={styles.dayNavRow}>
          <Skeleton width={160} height={36} borderRadius={18} />
        </View>

        {/* XP Summary Bar */}
        <View style={styles.xpBar}>
          <View style={{ flex: 1.618 }}>
            <Skeleton width="100%" height={64} borderRadius={14} />
          </View>
          <View style={{ flex: 1 }}>
            <Skeleton width="100%" height={64} borderRadius={14} />
          </View>
          <View style={{ flex: 1 }}>
            <Skeleton width="100%" height={64} borderRadius={14} />
          </View>
        </View>

        {/* Challenge card placeholders (3-column layout) */}
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardRow}>
              <Skeleton width={40} height={40} borderRadius={10} />
              <View style={{ flex: 1, gap: 4 }}>
                <Skeleton width={140} height={14} borderRadius={4} />
                <Skeleton width={100} height={10} borderRadius={3} />
                <Skeleton width="100%" height={6} borderRadius={3} />
              </View>
              <Skeleton width={40} height={40} borderRadius={20} />
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.phi4 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi3,
  },
  dayNavRow: {
    alignItems: "center",
    marginTop: spacing.phi3,
    marginBottom: spacing.phi3,
  },
  xpBar: {
    flexDirection: "row",
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: spacing.phi2,
    gap: spacing.phi2,
    marginBottom: spacing.phi4,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[200],
    padding: spacing.phi3,
    marginBottom: spacing.phi3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi3,
  },
});
