import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserAvatar } from "./UserAvatar";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface TodayHeaderProps {
  userName: string;
  userHandle: string;
  avatarUrl: string | null;
  friendsCount: number;
  selectedDate: Date;
  isToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onOpenSettings: () => void;
}

function getDayLabel(selected: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sel = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate()
  );
  const diffMs = today.getTime() - sel.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays <= 6) {
    const wd = sel.toLocaleDateString("pt-BR", { weekday: "long" });
    return wd.charAt(0).toUpperCase() + wd.slice(1).split("-")[0];
  }
  return `${sel.getDate()}/${sel.getMonth() + 1}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

export function TodayHeader({
  userName,
  userHandle,
  avatarUrl,
  friendsCount,
  selectedDate,
  isToday,
  onPrevDay,
  onNextDay,
  onOpenSettings,
}: TodayHeaderProps) {
  const dayLabel = getDayLabel(selectedDate);

  return (
    <View style={styles.container}>
      {/* Row 1: User info + settings */}
      <View style={styles.topRow}>
        <View style={styles.userSection}>
          <UserAvatar
            avatarUrl={avatarUrl}
            displayName={userName}
            size="md"
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {userName}
            </Text>
            {userHandle ? (
              <Text style={styles.userHandle} numberOfLines={1}>
                @{userHandle}
              </Text>
            ) : null}
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Text style={styles.friendsText}>
              <Text style={styles.friendsCount}>{friendsCount}</Text>{" "}
              {friendsCount === 1 ? "amigo" : "amigos"}
            </Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Pressable
            onPress={onOpenSettings}
            hitSlop={8}
            accessibilityLabel="Abrir configurações"
            accessibilityRole="button"
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={colors.gray[400]}
            />
          </Pressable>
        </View>
      </View>

      {/* Row 2: Day navigator */}
      <View style={styles.dayNav}>
        <Pressable
          onPress={onPrevDay}
          style={styles.dayNavBtn}
          hitSlop={4}
          accessibilityLabel="Dia anterior"
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={colors.gray[600]}
          />
        </Pressable>

        <Text style={styles.dayLabel}>{dayLabel}</Text>

        <Pressable
          onPress={onNextDay}
          style={[styles.dayNavBtn, isToday && styles.dayNavBtnDisabled]}
          disabled={isToday}
          hitSlop={4}
          accessibilityLabel="Dia seguinte"
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isToday ? colors.gray[300] : colors.gray[600]}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.phi3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.phi3,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h3,
    color: colors.gray[900],
  },
  userHandle: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 1,
  },
  dateText: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 1,
  },
  friendsText: {
    ...typography.caption,
    color: colors.gray[400],
    marginTop: 1,
  },
  friendsCount: {
    fontWeight: "600",
    color: colors.gray[600],
  },
  rightSection: {
    paddingTop: 2,
  },
  dayNav: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: spacing.phi1,
    paddingVertical: spacing.phi1,
    marginTop: spacing.phi3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNavBtnDisabled: {
    opacity: 0.3,
  },
  dayLabel: {
    ...typography.bodySmall,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 100,
    color: colors.gray[800],
  },
});
