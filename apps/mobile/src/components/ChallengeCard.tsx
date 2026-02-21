import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TodayCard } from "@meusdesafios/shared";
import { getCategoryStyle } from "../theme/category";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { QuickActionButton } from "./QuickActionButton";

interface ChallengeCardProps {
  card: TodayCard;
  onQuickAction: (cardId: string, actionId: string) => void;
}

export function ChallengeCard({ card, onQuickAction }: ChallengeCardProps) {
  const style = getCategoryStyle(card.category);

  return (
    <View style={[styles.container, { borderLeftColor: style.color }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: style.lightBg }]}>
          <Ionicons
            name={style.icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={style.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{card.name}</Text>
          <Text style={styles.streak}>
            {card.streak.current > 0 ? `🔥 ${card.streak.current} dias` : ""}
          </Text>
        </View>
        {card.pointsToday > 0 && (
          <Text style={styles.points}>+{card.pointsToday} XP</Text>
        )}
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, card.progress.percentage)}%`,
                backgroundColor: style.color,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressValue}>
            {card.progress.value}
            {card.progress.unit ? ` ${card.progress.unit}` : ""}
          </Text>
          {card.goal.target != null && (
            <Text style={styles.progressTarget}>
              / {card.goal.target} {card.goal.unit || ""}
            </Text>
          )}
          {card.progress.met && (
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.success}
              style={styles.metIcon}
            />
          )}
        </View>
      </View>

      {card.quickActions.length > 0 && (
        <View style={styles.actions}>
          {card.quickActions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              categoryColor={style.color}
              onPress={() => onQuickAction(card.userTrackableId, action.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: spacing.phi4,
    marginBottom: spacing.phi3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.phi3,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.phi3,
  },
  name: {
    ...typography.h3,
    color: colors.gray[900],
  },
  streak: {
    ...typography.caption,
    color: colors.gray[500],
  },
  points: {
    ...typography.label,
    color: colors.primary[500],
  },
  progressSection: {
    marginBottom: spacing.phi3,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[100],
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.phi1,
  },
  progressValue: {
    ...typography.bodySmall,
    fontWeight: "600",
    color: colors.gray[800],
  },
  progressTarget: {
    ...typography.bodySmall,
    color: colors.gray[400],
    marginLeft: 2,
  },
  metIcon: {
    marginLeft: spacing.phi2,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.phi2,
  },
});
