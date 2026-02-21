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
import type { ExerciseModality } from "@meusdesafios/shared";

const MODALITIES: { key: ExerciseModality; label: string; icon: string }[] = [
  { key: "GYM", label: "Musculação", icon: "barbell-outline" },
  { key: "RUN", label: "Corrida", icon: "walk-outline" },
  { key: "CYCLING", label: "Ciclismo", icon: "bicycle-outline" },
  { key: "SWIM", label: "Natação", icon: "water-outline" },
];

const MODALITY_PRESETS: Record<ExerciseModality, { label: string; value: number }[]> = {
  GYM: [
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
  ],
  RUN: [
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
  ],
  CYCLING: [
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
    { label: "90 min", value: 90 },
  ],
  SWIM: [
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 },
    { label: "60 min", value: 60 },
  ],
};

interface ActivityLoggerSheetProps {
  visible: boolean;
  currentProgress: number;
  target: number | undefined;
  onLog: (value: number, modality: ExerciseModality) => void;
  onClose: () => void;
}

export function ActivityLoggerSheet({
  visible,
  currentProgress,
  target = 45,
  onLog,
  onClose,
}: ActivityLoggerSheetProps) {
  const [selectedModality, setSelectedModality] = useState<ExerciseModality | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (visible) {
      setSelectedModality(null);
      setSelectedPreset(null);
      setCustom("");
    }
  }, [visible]);

  const presets = selectedModality ? MODALITY_PRESETS[selectedModality] : [];

  const getValue = (): number => {
    if (custom) return parseInt(custom, 10) || 0;
    return selectedPreset ?? 0;
  };

  const amount = getValue();
  const newTotal = currentProgress + amount;
  const willMeetGoal = target > 0 && newTotal >= target && currentProgress < target;

  const handleModalitySelect = (mod: ExerciseModality) => {
    setSelectedModality(mod);
    setSelectedPreset(null);
    setCustom("");
  };

  const handlePresetSelect = (value: number) => {
    setSelectedPreset(value);
    setCustom("");
  };

  const canSubmit = amount > 0 && selectedModality !== null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.sheetWrap}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handle} />
            <Text style={s.title}>Registrar Exercício</Text>

            {/* Current progress */}
            {target > 0 && (
              <View style={s.infoBox}>
                <Ionicons name="fitness" size={16} color="#f43f5e" />
                <Text style={s.infoText}>
                  Atual: {currentProgress} min / {target} min
                </Text>
              </View>
            )}

            {/* Modality selection */}
            <Text style={s.label}>Modalidade</Text>
            <View style={s.modalityGrid}>
              {MODALITIES.map((mod) => (
                <Pressable
                  key={mod.key}
                  style={[s.modalityBtn, selectedModality === mod.key && s.modalityBtnActive]}
                  onPress={() => handleModalitySelect(mod.key)}
                >
                  <Ionicons
                    name={mod.icon as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={selectedModality === mod.key ? "#be123c" : colors.gray[500]}
                  />
                  <Text style={[s.modalityText, selectedModality === mod.key && s.modalityTextActive]}>
                    {mod.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Presets + custom (only after modality selected) */}
            {selectedModality && (
              <>
                <Text style={s.label}>Seleção rápida</Text>
                <View style={s.grid}>
                  {presets.map((p) => (
                    <Pressable
                      key={p.value}
                      style={[s.presetBtn, !custom && selectedPreset === p.value && s.presetBtnActive]}
                      onPress={() => handlePresetSelect(p.value)}
                    >
                      <Text style={[s.presetText, !custom && selectedPreset === p.value && s.presetTextActive]}>
                        {p.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Custom input */}
                <View style={s.customRow}>
                  <TextInput
                    style={s.customInput}
                    placeholder="Duração personalizada (min)"
                    placeholderTextColor={colors.gray[400]}
                    keyboardType="number-pad"
                    value={custom}
                    onChangeText={(t) => { setCustom(t.replace(/\D/g, "")); setSelectedPreset(null); }}
                  />
                </View>
              </>
            )}

            {/* Preview */}
            {amount > 0 && selectedModality && (
              <View style={[s.preview, willMeetGoal && s.previewSuccess]}>
                <Text style={[s.previewText, willMeetGoal && s.previewTextSuccess]}>
                  {amount} min ({MODALITIES.find((m) => m.key === selectedModality)?.label})
                  {target > 0 ? ` → Novo total: ${newTotal} min` : ""}
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
                style={[s.logBtn, !canSubmit && s.logBtnDisabled]}
                onPress={() => { if (canSubmit) { onLog(amount, selectedModality!); onClose(); } }}
                disabled={!canSubmit}
              >
                <Text style={s.logBtnText}>
                  {canSubmit ? `Registrar ${amount} min` : "Registrar"}
                </Text>
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
  infoBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff1f2", borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  infoText: { fontSize: 14, fontWeight: "500", color: "#be123c" },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginBottom: spacing.phi2 },
  modalityGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.phi2, marginBottom: spacing.phi3 },
  modalityBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.gray[100], borderWidth: 1, borderColor: colors.gray[200] },
  modalityBtnActive: { backgroundColor: "#ffe4e6", borderColor: "#fda4af" },
  modalityText: { fontSize: 14, fontWeight: "500", color: colors.gray[600] },
  modalityTextActive: { color: "#be123c" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.phi2, marginBottom: spacing.phi3 },
  presetBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.gray[100] },
  presetBtnActive: { backgroundColor: "#ffe4e6" },
  presetText: { fontSize: 14, fontWeight: "500", color: colors.gray[600] },
  presetTextActive: { color: "#be123c" },
  customRow: { marginBottom: spacing.phi3 },
  customInput: { borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.gray[900] },
  preview: { backgroundColor: colors.gray[50], borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  previewSuccess: { backgroundColor: "#fff1f2" },
  previewText: { fontSize: 13, fontWeight: "500", color: colors.gray[600], textAlign: "center" },
  previewTextSuccess: { color: "#be123c" },
  actions: { flexDirection: "row", gap: spacing.phi3 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: colors.gray[100] },
  cancelText: { fontSize: 15, fontWeight: "600", color: colors.gray[600] },
  logBtn: { flex: 2, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: "#f43f5e" },
  logBtnDisabled: { opacity: 0.4 },
  logBtnText: { fontSize: 15, fontWeight: "600", color: colors.white },
});
