import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { MonthlySummary } from "@meusdesafios/shared";
import { getCategoryStyle } from "../theme/category";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {MONTH_NAMES[summary.month]} {summary.year}
      </Text>

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
            <Text style={styles.challengeName}>{ch.name}</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, ch.percentMet)}%`,
                    backgroundColor: style.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.percentText}>
              {Math.round(ch.percentMet)}%
            </Text>
          </View>
        );
      })}

      {/* Stats */}
      <View style={styles.stats}>
        <StatPill label="XP" value={String(summary.totalXP)} />
        <StatPill label="Dias perfeitos" value={String(summary.perfectDays)} />
        <StatPill label="Melhor sequência" value={String(summary.bestStreak)} />
      </View>
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
  challengeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.phi2,
    gap: spacing.phi2,
  },
  challengeName: {
    ...typography.bodySmall,
    color: colors.gray[700],
    width: 90,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[100],
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  percentText: {
    ...typography.caption,
    color: colors.gray[600],
    width: 35,
    textAlign: "right",
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.phi3,
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
});
