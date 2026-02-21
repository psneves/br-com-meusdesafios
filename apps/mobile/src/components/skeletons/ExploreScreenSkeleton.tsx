import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../Skeleton";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function ExploreScreenSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Search bar */}
        <Skeleton width="100%" height={40} borderRadius={10} />

        {/* Section title */}
        <Skeleton
          width={140}
          height={18}
          borderRadius={4}
          style={{ marginTop: spacing.phi4, marginBottom: spacing.phi3 }}
        />

        {/* User rows */}
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.userRow}>
            <Skeleton width={44} height={44} borderRadius={22} />
            <View style={{ flex: 1, marginLeft: spacing.phi3 }}>
              <Skeleton width={120} height={16} borderRadius={4} />
              <Skeleton
                width={80}
                height={12}
                borderRadius={4}
                style={{ marginTop: 4 }}
              />
            </View>
            <Skeleton width={80} height={30} borderRadius={8} />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.phi4 },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: spacing.phi3,
    marginBottom: spacing.phi2,
  },
});
