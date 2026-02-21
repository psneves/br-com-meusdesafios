import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface XpSummaryBarProps {
  totalPoints: number;
  pointsWeek: number;
  pointsMonth: number;
  dayLabel: string;
}

export function XpSummaryBar({
  totalPoints,
  pointsWeek,
  pointsMonth,
  dayLabel,
}: XpSummaryBarProps) {
  return (
    <View style={styles.container}>
      {/* Today — golden ratio wider */}
      <View style={[styles.cell, styles.cellPrimary]}>
        <View style={styles.valueRow}>
          <Text style={styles.valuePrimary}>{totalPoints}</Text>
          <Text style={styles.xpLabelPrimary}> XP</Text>
        </View>
        <Text style={styles.sublabelPrimary}>{dayLabel}</Text>
      </View>

      {/* Week */}
      <View style={[styles.cell, styles.cellSecondary]}>
        <View style={styles.valueRow}>
          <Text style={styles.valueSecondary}>{pointsWeek}</Text>
          <Text style={styles.xpLabelSecondary}> XP</Text>
        </View>
        <Text style={styles.sublabelSecondary}>Semana</Text>
      </View>

      {/* Month */}
      <View style={[styles.cell, styles.cellSecondary]}>
        <View style={styles.valueRow}>
          <Text style={styles.valueSecondary}>{pointsMonth}</Text>
          <Text style={styles.xpLabelSecondary}> XP</Text>
        </View>
        <Text style={styles.sublabelSecondary}>Mês</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: spacing.phi2,
    gap: spacing.phi2,
    marginBottom: spacing.phi4,
  },
  cell: {
    borderRadius: 14,
    paddingVertical: spacing.phi3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },
  cellPrimary: {
    flex: 1.618,
    backgroundColor: colors.primary[50],
  },
  cellSecondary: {
    flex: 1,
    backgroundColor: colors.white,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  valuePrimary: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.primary[600],
  },
  xpLabelPrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary[500],
  },
  sublabelPrimary: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.primary[500],
    marginTop: 2,
  },
  valueSecondary: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.gray[800],
  },
  xpLabelSecondary: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[400],
  },
  sublabelSecondary: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.gray[400],
    marginTop: 2,
  },
});
