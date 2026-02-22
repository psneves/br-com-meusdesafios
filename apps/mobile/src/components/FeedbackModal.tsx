import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  Animated,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { LogFeedback } from "@meusdesafios/shared";
import { haptics } from "../utils/haptics";
import { maybePromptReview } from "../hooks/use-store-review";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface FeedbackModalProps {
  feedback: LogFeedback | null;
  onDismiss: () => void;
}

export function FeedbackModal({ feedback, onDismiss }: FeedbackModalProps) {
  if (!feedback) return null;

  // Simple log (goal not met) → lightweight inline toast
  // Goal met / perfect day → celebratory modal
  if (!feedback.goalMet) {
    return <InlineToast feedback={feedback} onDismiss={onDismiss} />;
  }

  return <CelebrationModal feedback={feedback} onDismiss={onDismiss} />;
}

// ── Inline Toast (simple log confirmation) ─────────────

function InlineToast({
  feedback,
  onDismiss,
}: {
  feedback: LogFeedback;
  onDismiss: () => void;
}) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    haptics.light();

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 20,
        stiffness: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => onDismiss());
    }, 2000);

    return () => clearTimeout(timer);
  }, [feedback, onDismiss, translateY, opacity]);

  return (
    <Animated.View
      style={[
        toastStyles.container,
        { transform: [{ translateY }], opacity },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View style={toastStyles.iconWrap}>
        <Ionicons name="checkmark" size={16} color={colors.white} />
      </View>
      <Text style={toastStyles.text}>{feedback.message}</Text>
      {feedback.pointsEarned > 0 && (
        <Text style={toastStyles.points}>+{feedback.pointsEarned} XP</Text>
      )}
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  container: {
    position: "absolute",
    top: spacing.phi4,
    left: spacing.phi4,
    right: spacing.phi4,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray[800],
    paddingVertical: spacing.phi3,
    paddingHorizontal: spacing.phi4,
    borderRadius: 12,
    zIndex: 100,
    gap: spacing.phi2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    ...typography.body,
    color: colors.white,
    flex: 1,
  },
  points: {
    ...typography.bodySmall,
    color: colors.primary[300],
    fontWeight: "700",
  },
});

// ── Celebration Modal (goal met / perfect day) ──────────

function CelebrationModal({
  feedback,
  onDismiss,
}: {
  feedback: LogFeedback;
  onDismiss: () => void;
}) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isPerfectDay = feedback.message.includes("perfeito");

  useEffect(() => {
    if (feedback.milestone || feedback.streakUpdated) {
      haptics.medium();
    } else {
      haptics.light();
    }

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (feedback.streakUpdated && feedback.streakUpdated.to >= 7) {
      setTimeout(() => maybePromptReview(feedback.streakUpdated!.to), 2000);
    }

    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss, scale, opacity]);

  return (
    <Modal
      transparent
      animationType="none"
      visible
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <Pressable
        style={modalStyles.overlay}
        onPress={onDismiss}
        accessibilityLabel="Fechar"
        accessibilityRole="button"
      >
        <Animated.View
          style={[
            modalStyles.content,
            { transform: [{ scale }], opacity },
          ]}
        >
          {/* Icon */}
          <View
            style={[
              modalStyles.iconCircle,
              isPerfectDay && modalStyles.iconCirclePerfect,
            ]}
          >
            <Ionicons
              name={isPerfectDay ? "star" : "checkmark-circle"}
              size={isPerfectDay ? 36 : 40}
              color={isPerfectDay ? colors.warning : colors.success}
            />
          </View>

          {/* Message */}
          <Text
            style={[
              modalStyles.message,
              isPerfectDay && modalStyles.messagePerfect,
            ]}
          >
            {feedback.message}
          </Text>

          {/* Points */}
          {feedback.pointsEarned > 0 && (
            <View style={modalStyles.pointsBadge}>
              <Ionicons name="flash" size={16} color={colors.primary[500]} />
              <Text style={modalStyles.pointsText}>
                +{feedback.pointsEarned} XP
              </Text>
            </View>
          )}

          {/* Streak */}
          {feedback.streakUpdated && (
            <View style={modalStyles.streakRow}>
              <Ionicons name="flame" size={16} color={colors.warning} />
              <Text style={modalStyles.streakText}>
                {feedback.streakUpdated.from} → {feedback.streakUpdated.to} dias
              </Text>
            </View>
          )}

          {/* Milestone */}
          {feedback.milestone && (
            <View style={modalStyles.milestoneRow}>
              <Ionicons name="trophy" size={16} color={colors.warning} />
              <Text style={modalStyles.milestoneText}>
                Marco de {feedback.milestone.day} dias! +
                {feedback.milestone.bonus} XP
              </Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.phi5,
    alignItems: "center",
    marginHorizontal: spacing.phi5,
    minWidth: 280,
    gap: spacing.phi2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.phi1,
  },
  iconCirclePerfect: {
    backgroundColor: "#FEF9C3",
  },
  message: {
    ...typography.h3,
    color: colors.gray[900],
    textAlign: "center",
  },
  messagePerfect: {
    color: colors.warning,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi1,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 20,
    marginTop: spacing.phi1,
  },
  pointsText: {
    ...typography.h3,
    color: colors.primary[600],
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi1,
    marginTop: spacing.phi1,
  },
  streakText: {
    ...typography.bodySmall,
    color: colors.gray[600],
  },
  milestoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi1,
    backgroundColor: "#FEF9C3",
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 10,
    marginTop: spacing.phi1,
  },
  milestoneText: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: "700",
  },
});
