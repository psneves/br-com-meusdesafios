import { useEffect } from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
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
  // Haptic on show + auto-dismiss after 3 seconds
  useEffect(() => {
    if (!feedback) return;
    if (feedback.milestone || feedback.streakUpdated) {
      haptics.medium();
    } else if (feedback.goalMet) {
      haptics.light();
    }
    if (feedback.streakUpdated && feedback.streakUpdated.to >= 7) {
      setTimeout(() => maybePromptReview(feedback.streakUpdated!.to), 2000);
    }
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [feedback, onDismiss]);

  if (!feedback) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={!!feedback}
      onRequestClose={onDismiss}
      accessibilityViewIsModal
    >
      <Pressable
        style={styles.overlay}
        onPress={onDismiss}
        accessibilityLabel="Fechar"
        accessibilityRole="button"
      >
        <View style={styles.content}>
          {feedback.goalMet && (
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={colors.success}
            />
          )}

          <Text style={styles.message}>{feedback.message}</Text>

          {feedback.pointsEarned > 0 && (
            <Text style={styles.points}>+{feedback.pointsEarned} XP</Text>
          )}

          {feedback.streakUpdated && (
            <Text style={styles.streak}>
              Sequência: {feedback.streakUpdated.from} → {feedback.streakUpdated.to} dias
            </Text>
          )}

          {feedback.milestone && (
            <Text style={styles.milestone}>
              Marco de {feedback.milestone.day} dias! +{feedback.milestone.bonus} XP bônus
            </Text>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.phi5,
    alignItems: "center",
    marginHorizontal: spacing.phi5,
    minWidth: 260,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  message: {
    ...typography.body,
    color: colors.gray[800],
    textAlign: "center",
    marginTop: spacing.phi3,
  },
  points: {
    ...typography.h2,
    color: colors.primary[500],
    marginTop: spacing.phi2,
  },
  streak: {
    ...typography.bodySmall,
    color: colors.gray[600],
    marginTop: spacing.phi2,
  },
  milestone: {
    ...typography.bodySmall,
    color: colors.warning,
    fontWeight: "600",
    marginTop: spacing.phi2,
  },
});
