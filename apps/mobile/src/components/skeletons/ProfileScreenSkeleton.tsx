import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Skeleton } from "../Skeleton";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

export function ProfileScreenSkeleton() {
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <Skeleton width={100} height={100} borderRadius={50} />
          <Skeleton
            width={140}
            height={22}
            borderRadius={6}
            style={{ marginTop: spacing.phi3 }}
          />
          <Skeleton
            width={100}
            height={16}
            borderRadius={4}
            style={{ marginTop: spacing.phi1 }}
          />
        </View>

        {/* Edit button */}
        <Skeleton
          width="100%"
          height={44}
          borderRadius={12}
          style={{ marginBottom: spacing.phi4 }}
        />

        {/* Notification settings block */}
        <View style={styles.settingsBlock}>
          <Skeleton
            width={120}
            height={18}
            borderRadius={4}
            style={{ marginBottom: spacing.phi3 }}
          />
          <Skeleton width="100%" height={40} borderRadius={8} />
          <Skeleton
            width="100%"
            height={40}
            borderRadius={8}
            style={{ marginTop: spacing.phi2 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray[50] },
  content: { padding: spacing.phi4 },
  avatarSection: { alignItems: "center", marginBottom: spacing.phi5 },
  settingsBlock: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
  },
});
