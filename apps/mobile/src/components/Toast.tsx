import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface ToastProps {
  message: string | null;
  variant?: "success" | "neutral";
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  variant = "neutral",
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) return;

    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onDismiss());
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss, opacity]);

  if (!message) return null;

  const bg = variant === "success" ? colors.success : colors.gray[700];

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: bg, opacity }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: spacing.phi5,
    left: spacing.phi4,
    right: spacing.phi4,
    paddingVertical: spacing.phi3,
    paddingHorizontal: spacing.phi4,
    borderRadius: 10,
    zIndex: 100,
    alignItems: "center",
  },
  text: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: "600",
  },
});
