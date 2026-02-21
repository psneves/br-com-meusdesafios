import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { WeeklySummary } from "@meusdesafios/shared";
import { getCategoryStyle } from "../theme/category";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo da Semana</Text>

      {/* Day dots */}
      <View style={styles.dayRow}>
        {summary.days.map((day) => {
          const ratio = day.total > 0 ? day.metCount / day.total : 0;
          const dotColor = day.isFuture
            ? colors.gray[200]
            : ratio === 1
              ? colors.success
              : ratio > 0
                ? colors.warning
                : colors.gray[300];
          return (
            <View key={day.date} style={styles.dayColumn}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={styles.dayLabel}>{day.dayOfMonth}</Text>
            </View>
          );
        })}
      </View>

      {/* Per-challenge rows */}
      {summary.challenges.map((ch) => {
        const style = getCategoryStyle(ch.category);
        return (
          <View key={ch.category} style={styles.challengeRow}>
            <Ionicons
              name={style.icon as keyof typeof Ionicons.glyphMap}
              size={16}
              color={style.color}
            />
            <View style={styles.challengeDots}>
              {ch.daysMet.map((met, i) => (
                <View
                  key={i}
                  style={[
                    styles.smallDot,
                    {
                      backgroundColor: met
                        ? style.color
                        : colors.gray[200],
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.metCount}>
              {ch.metCount}/{ch.totalDays}
            </Text>
          </View>
        );
      })}

      {/* Stats */}
      <View style={styles.stats}>
        <StatPill label="XP" value={String(summary.totalXP)} />
        <StatPill label="Dias perfeitos" value={String(summary.perfectDays)} />
        <StatPill
          label="Meta"
          value={`${Math.round(summary.percentMet)}%`}
        />
      </View>

      {(summary.weeklyGoalBonusXP > 0 || summary.perfectWeekBonusXP > 0) && (
        <Text style={styles.bonus}>
          {summary.weeklyGoalBonusXP > 0 &&
            `Bônus semanal: +${summary.weeklyGoalBonusXP} XP  `}
          {summary.perfectWeekBonusXP > 0 &&
            `Semana perfeita: +${summary.perfectWeekBonusXP} XP`}
        </Text>
      )}
    </View>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  title: {
    ...typography.h3,
    color: colors.gray[900],
    marginBottom: spacing.phi3,
  },
  dayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: spacing.phi3,
  },
  dayColumn: {
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dayLabel: {
    ...typography.caption,
    color: colors.gray[500],
  },
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.phi2,
    gap: spacing.phi2,
  },
  challengeDots: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  smallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metCount: {
    ...typography.caption,
    color: colors.gray[600],
    width: 30,
    textAlign: "right",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.phi3,
    marginBottom: spacing.phi2,
  },
  statPill: {
    alignItems: "center",
  },
  statValue: {
    ...typography.h3,
    color: colors.primary[500],
  },
  statLabel: {
    ...typography.caption,
    color: colors.gray[500],
  },
  bonus: {
    ...typography.caption,
    color: colors.warning,
    textAlign: "center",
    fontWeight: "600",
  },
});
