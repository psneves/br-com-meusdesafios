import { Pressable, Text, StyleSheet } from "react-native";
import type { QuickAction } from "@meusdesafios/shared";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface QuickActionButtonProps {
  action: QuickAction;
  categoryColor: string;
  onPress: () => void;
}

export function QuickActionButton({
  action,
  categoryColor,
  onPress,
}: QuickActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { borderColor: categoryColor },
        pressed && { backgroundColor: categoryColor, opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.label,
            { color: pressed ? colors.white : categoryColor },
          ]}
        >
          {action.label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: colors.white,
  },
  label: {
    ...typography.caption,
    fontWeight: "600",
  },
});
