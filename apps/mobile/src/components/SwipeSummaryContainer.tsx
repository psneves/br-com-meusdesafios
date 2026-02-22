import { useRef, useMemo } from "react";
import { View, PanResponder, StyleSheet } from "react-native";

interface SwipeSummaryContainerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}

const SWIPE_THRESHOLD = 50;

/**
 * Wraps children with horizontal swipe detection.
 * Swipe right (dx > 0) → go to previous period (onSwipeRight).
 * Swipe left  (dx < 0) → go to next period (onSwipeLeft).
 */
export function SwipeSummaryContainer({
  onSwipeLeft,
  onSwipeRight,
  children,
}: SwipeSummaryContainerProps) {
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight });
  callbacksRef.current = { onSwipeLeft, onSwipeRight };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, { dx, dy }) =>
          Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20,
        onPanResponderRelease: (_, { dx }) => {
          if (dx < -SWIPE_THRESHOLD) callbacksRef.current.onSwipeLeft?.();
          else if (dx > SWIPE_THRESHOLD) callbacksRef.current.onSwipeRight?.();
        },
      }),
    [],
  );

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});
