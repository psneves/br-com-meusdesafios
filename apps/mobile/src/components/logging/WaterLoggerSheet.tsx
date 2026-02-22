import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const PRESETS = [100, 200, 250, 300, 500, 750, 1000];

interface WaterLoggerSheetProps {
  visible: boolean;
  currentProgress: number;
  target: number | undefined;
  onLog: (amount: number) => void;
  onClose: () => void;
}

export function WaterLoggerSheet({
  visible,
  currentProgress,
  target = 2500,
  onLog,
  onClose,
}: WaterLoggerSheetProps) {
  const [selected, setSelected] = useState<number | null>(250);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (visible) {
      setSelected(250);
      setCustom("");
    }
  }, [visible]);

  const amount = custom ? parseInt(custom, 10) || 0 : selected ?? 0;
  const newTotal = currentProgress + amount;
  const willMeetGoal = newTotal >= target;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.sheetWrap}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handle} />
            <Text style={s.title}>Registrar Água</Text>

            {/* Current progress */}
            <View style={s.infoBox}>
              <Ionicons name="water" size={16} color="#3b82f6" />
              <Text style={s.infoText}>
                {currentProgress.toLocaleString("pt-BR")} / {target.toLocaleString("pt-BR")} ml
              </Text>
            </View>

            {/* Preset amounts */}
            <View style={s.grid}>
              {PRESETS.map((ml) => (
                <Pressable
                  key={ml}
                  style={[s.presetBtn, !custom && selected === ml && s.presetBtnActive]}
                  onPress={() => { setSelected(ml); setCustom(""); }}
                >
                  <Text style={[s.presetText, !custom && selected === ml && s.presetTextActive]}>
                    {ml} ml
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Custom input */}
            <View style={s.customRow}>
              <TextInput
                style={s.customInput}
                placeholder="Outro valor (ml)"
                placeholderTextColor={colors.gray[400]}
                keyboardType="number-pad"
                value={custom}
                onChangeText={(t) => { setCustom(t.replace(/\D/g, "")); setSelected(null); }}
              />
            </View>

            {/* Preview */}
            {amount > 0 && (
              <View style={[s.preview, willMeetGoal && s.previewSuccess]}>
                <Text style={[s.previewText, willMeetGoal && s.previewTextSuccess]}>
                  Novo total: {newTotal.toLocaleString("pt-BR")} ml
                  {willMeetGoal ? " — Meta cumprida!" : ""}
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={s.actions}>
              <Pressable style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[s.logBtn, amount <= 0 && s.logBtnDisabled]}
                onPress={() => { if (amount > 0) { onLog(amount); onClose(); } }}
                disabled={amount <= 0}
              >
                <Text style={s.logBtnText}>Registrar {amount} ml</Text>
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
  infoBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#eff6ff", borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  infoText: { fontSize: 14, fontWeight: "500", color: "#1d4ed8" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.phi2, marginBottom: spacing.phi3 },
  presetBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.gray[100] },
  presetBtnActive: { backgroundColor: "#dbeafe" },
  presetText: { fontSize: 14, fontWeight: "500", color: colors.gray[600] },
  presetTextActive: { color: "#1d4ed8" },
  customRow: { marginBottom: spacing.phi3 },
  customInput: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.gray[900] },
  preview: { backgroundColor: colors.gray[50], borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  previewSuccess: { backgroundColor: "#eff6ff" },
  previewText: { fontSize: 13, fontWeight: "500", color: colors.gray[600], textAlign: "center" },
  previewTextSuccess: { color: "#1d4ed8" },
  actions: { flexDirection: "row", gap: spacing.phi3 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: colors.gray[100] },
  cancelText: { fontSize: 15, fontWeight: "600", color: colors.gray[600] },
  logBtn: { flex: 2, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: "#3b82f6" },
  logBtnDisabled: { opacity: 0.4 },
  logBtnText: { fontSize: 15, fontWeight: "600", color: colors.white },
});
