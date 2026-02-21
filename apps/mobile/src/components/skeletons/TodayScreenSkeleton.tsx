import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../Skeleton";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function TodayScreenSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Header: greeting + settings icon */}
        <View style={styles.header}>
          <View>
            <Skeleton width={180} height={24} borderRadius={6} />
            <View style={styles.pillsRow}>
              <Skeleton width={60} height={32} borderRadius={12} />
              <Skeleton width={60} height={32} borderRadius={12} />
              <Skeleton width={60} height={32} borderRadius={12} />
            </View>
          </View>
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>

        {/* Challenge card placeholders */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHeader}>
              <Skeleton width={36} height={36} borderRadius={8} />
              <View style={{ flex: 1, marginLeft: spacing.phi3 }}>
                <Skeleton width={120} height={18} borderRadius={4} />
                <Skeleton
                  width={80}
                  height={12}
                  borderRadius={4}
                  style={{ marginTop: 4 }}
                />
              </View>
            </View>
            <Skeleton
              width="100%"
              height={8}
              borderRadius={4}
              style={{ marginVertical: spacing.phi3 }}
            />
            <View style={styles.actionsRow}>
              <Skeleton width={70} height={28} borderRadius={20} />
              <Skeleton width={70} height={28} borderRadius={20} />
              <Skeleton width={70} height={28} borderRadius={20} />
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
    marginBottom: spacing.phi4,
  },
  pillsRow: {
    flexDirection: "row",
    gap: spacing.phi3,
    marginTop: spacing.phi2,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.gray[200],
    padding: spacing.phi4,
    marginBottom: spacing.phi3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  actionsRow: { flexDirection: "row", gap: spacing.phi2 },
});
