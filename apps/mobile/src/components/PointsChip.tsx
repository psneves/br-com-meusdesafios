import { View, Text, StyleSheet } from "react-native";

interface PointsChipProps {
  points: number;
}

export function PointsChip({ points }: PointsChipProps) {
  if (points <= 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>+{points} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fffbeb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: "500",
    color: "#b45309",
  },
});
