import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StreakBadgeProps {
  current: number;
}

const TIERS = [
  { min: 30, bg: "#f97316", text: "#ffffff" },
  { min: 14, bg: "#fed7aa", text: "#9a3412" },
  { min: 7, bg: "#ffedd5", text: "#c2410c" },
  { min: 3, bg: "#fef3c7", text: "#b45309" },
  { min: 1, bg: "#fffbeb", text: "#d97706" },
] as const;

function getTier(streak: number) {
  for (const t of TIERS) {
    if (streak >= t.min) return t;
  }
  return TIERS[TIERS.length - 1];
}

export function StreakBadge({ current }: StreakBadgeProps) {
  if (current <= 0) return null;

  const tier = getTier(current);

  return (
    <View style={[styles.container, { backgroundColor: tier.bg }]}>
      <Ionicons name="flame" size={12} color={tier.text} />
      <Text style={[styles.text, { color: tier.text }]}>
        {current} {current === 1 ? "dia" : "dias"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
