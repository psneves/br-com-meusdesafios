import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { ProgressBreakdown } from "@meusdesafios/shared";

type MealState = "neutral" | "success" | "fail";

const MEAL_LABELS_BY_COUNT: Record<number, string[]> = {
  3: ["Café da manhã", "Almoço", "Jantar"],
  4: ["Café da manhã", "Almoço", "Lanche", "Jantar"],
  5: ["Café da manhã", "Lanche 1", "Almoço", "Lanche 2", "Jantar"],
  6: ["Café da manhã", "Lanche 1", "Almoço", "Lanche 2", "Jantar", "Ceia"],
  7: ["Café da manhã", "Lanche 1", "Almoço", "Lanche 2", "Lanche 3", "Jantar", "Ceia"],
};

function getMealLabels(count: number): string[] {
  return (
    MEAL_LABELS_BY_COUNT[count] ??
    Array.from({ length: count }, (_, i) => `Refeição ${i + 1}`)
  );
}

function breakdownToMeals(
  target: number,
  breakdown?: ProgressBreakdown[],
  currentProgress = 0
): MealState[] {
  if (breakdown?.length === target) {
    return breakdown.map((b) => {
      if (b.value === 1) return "success";
      if (b.value === -1) return "fail";
      return "neutral";
    });
  }
  const successCount = Math.min(Math.max(0, currentProgress), target);
  return Array.from({ length: target }, (_, i) =>
    i < successCount ? "success" : "neutral"
  );
}

interface DietLoggerSheetProps {
  visible: boolean;
  currentProgress: number;
  currentBreakdown?: ProgressBreakdown[];
  target: number | undefined;
  onLog: (successCount: number) => void;
  onClose: () => void;
}

export function DietLoggerSheet({
  visible,
  currentProgress,
  currentBreakdown,
  target = 5,
  onLog,
  onClose,
}: DietLoggerSheetProps) {
  const mealLabels = getMealLabels(target);
  const [meals, setMeals] = useState<MealState[]>(() =>
    breakdownToMeals(target, currentBreakdown, currentProgress)
  );

  useEffect(() => {
    if (visible) {
      setMeals(breakdownToMeals(target, currentBreakdown, currentProgress));
    }
  }, [visible, target, currentBreakdown, currentProgress]);

  const cycleMeal = (index: number) => {
    setMeals((prev) => {
      const updated = [...prev];
      const current = updated[index];
      if (current === "neutral") updated[index] = "success";
      else if (current === "success") updated[index] = "fail";
      else updated[index] = "neutral";
      return updated;
    });
  };

  const successCount = meals.filter((m) => m === "success").length;
  const willMeetGoal = successCount >= target;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.sheetWrap}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handle} />
            <Text style={s.title}>Registrar Dieta</Text>

            {/* Meta */}
            <View style={s.infoBox}>
              <Ionicons name="restaurant" size={16} color="#10b981" />
              <Text style={s.infoText}>
                Meta: cumprir o plano nas {target} refeições do dia
              </Text>
            </View>

            {/* Instructions + legend */}
            <Text style={s.label}>Toque para alterar o estado de cada refeição</Text>
            <View style={s.legend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#10b981" }]} />
                <Text style={s.legendText}>Conforme o plano</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#ef4444" }]} />
                <Text style={s.legendText}>Fora do plano</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: colors.gray[400] }]} />
                <Text style={s.legendText}>Não realizada</Text>
              </View>
            </View>

            {/* Meal rows */}
            <ScrollView style={s.mealList} bounces={false}>
              {mealLabels.map((label, i) => (
                <Pressable
                  key={label}
                  style={[
                    s.mealRow,
                    meals[i] === "success" && s.mealRowSuccess,
                    meals[i] === "fail" && s.mealRowFail,
                  ]}
                  onPress={() => cycleMeal(i)}
                >
                  <View
                    style={[
                      s.mealCircle,
                      meals[i] === "neutral" && s.mealCircleNeutral,
                      meals[i] === "success" && s.mealCircleSuccess,
                      meals[i] === "fail" && s.mealCircleFail,
                    ]}
                  >
                    {meals[i] === "neutral" && (
                      <Text style={s.mealCircleNum}>{i + 1}</Text>
                    )}
                    {meals[i] === "success" && (
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                    )}
                    {meals[i] === "fail" && (
                      <Ionicons name="close" size={16} color="#ef4444" />
                    )}
                  </View>
                  <Text
                    style={[
                      s.mealLabel,
                      meals[i] === "success" && s.mealLabelSuccess,
                      meals[i] === "fail" && s.mealLabelFail,
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[
                      s.mealStatus,
                      meals[i] === "success" && s.mealStatusSuccess,
                      meals[i] === "fail" && s.mealStatusFail,
                    ]}
                  >
                    {meals[i] === "neutral" && "Não registado"}
                    {meals[i] === "success" && "Conforme"}
                    {meals[i] === "fail" && "Fora do plano"}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Summary */}
            <View style={[s.summary, willMeetGoal && s.summarySuccess]}>
              <Text style={[s.summaryText, willMeetGoal && s.summaryTextSuccess]}>
                {successCount} de {target} refeições conforme o plano
                {willMeetGoal ? " — Meta cumprida!" : ""}
              </Text>
            </View>

            {/* Actions */}
            <View style={s.actions}>
              <Pressable style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={s.logBtn}
                onPress={() => { onLog(successCount); onClose(); }}
              >
                <Text style={s.logBtnText}>Registrar Dieta</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheetWrap: { justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.phi4, paddingBottom: spacing.phi6 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.gray[300], alignSelf: "center", marginBottom: spacing.phi3 },
  title: { fontSize: 18, fontWeight: "700", color: colors.gray[900], marginBottom: spacing.phi3 },
  infoBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#ecfdf5", borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  infoText: { fontSize: 14, fontWeight: "500", color: "#047857" },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginBottom: spacing.phi1 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: spacing.phi3 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.gray[500] },
  mealList: { maxHeight: 280, marginBottom: spacing.phi3 },
  mealRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.gray[200], backgroundColor: colors.white, marginBottom: spacing.phi2 },
  mealRowSuccess: { borderColor: "#6ee7b7", backgroundColor: "#ecfdf5" },
  mealRowFail: { borderColor: "#fca5a5", backgroundColor: "#fef2f2" },
  mealCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  mealCircleNeutral: { borderWidth: 2, borderStyle: "dashed", borderColor: colors.gray[300] },
  mealCircleSuccess: { backgroundColor: "#10b981" },
  mealCircleFail: { backgroundColor: "#fee2e2" },
  mealCircleNum: { fontSize: 11, fontWeight: "500", color: colors.gray[400] },
  mealLabel: { flex: 1, fontSize: 14, fontWeight: "500", color: colors.gray[700] },
  mealLabelSuccess: { color: "#047857" },
  mealLabelFail: { color: "#b91c1c" },
  mealStatus: { fontSize: 12, color: colors.gray[400] },
  mealStatusSuccess: { color: "#059669" },
  mealStatusFail: { color: "#ef4444" },
  summary: { backgroundColor: colors.gray[50], borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  summarySuccess: { backgroundColor: "#ecfdf5" },
  summaryText: { fontSize: 13, fontWeight: "500", color: colors.gray[600], textAlign: "center" },
  summaryTextSuccess: { color: "#047857" },
  actions: { flexDirection: "row", gap: spacing.phi3 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: colors.gray[100] },
  cancelText: { fontSize: 15, fontWeight: "600", color: colors.gray[600] },
  logBtn: { flex: 2, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: "#10b981" },
  logBtnText: { fontSize: 15, fontWeight: "600", color: colors.white },
});
