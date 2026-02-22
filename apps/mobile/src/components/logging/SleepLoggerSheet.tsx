import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

const DURATION_PRESETS = [
  { label: "6h", value: 360 },
  { label: "6.5h", value: 390 },
  { label: "7h", value: 420 },
  { label: "7.5h", value: 450 },
  { label: "8h", value: 480 },
  { label: "8.5h", value: 510 },
];

interface SleepLoggerSheetProps {
  visible: boolean;
  targetMin: number | undefined;
  onLog: (durationMin: number) => void;
  onClose: () => void;
}

function formatDuration(mins: number): string {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function SleepLoggerSheet({
  visible,
  targetMin = 420,
  onLog,
  onClose,
}: SleepLoggerSheetProps) {
  const [duration, setDuration] = useState(420);

  useEffect(() => {
    if (visible) {
      setDuration(targetMin);
    }
  }, [visible, targetMin]);

  const willMeetGoal = duration >= targetMin;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.sheetWrap}
        >
          <Pressable style={s.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.handle} />
            <Text style={s.title}>Registrar Sono</Text>

            {/* Meta */}
            <View style={s.infoBox}>
              <Ionicons name="moon" size={16} color="#8b5cf6" />
              <Text style={s.infoText}>
                Meta: {formatDuration(targetMin)} por noite
              </Text>
            </View>

            {/* Label */}
            <Text style={s.label}>Quantas horas você dormiu?</Text>

            {/* Preset durations */}
            <View style={s.grid}>
              {DURATION_PRESETS.map((preset) => (
                <Pressable
                  key={preset.value}
                  style={[s.presetBtn, duration === preset.value && s.presetBtnActive]}
                  onPress={() => setDuration(preset.value)}
                >
                  <Text style={[s.presetText, duration === preset.value && s.presetTextActive]}>
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Slider */}
            <View style={s.sliderContainer}>
              <View style={s.sliderLabels}>
                <Text style={s.sliderEdge}>4h</Text>
                <Text style={s.sliderValue}>{formatDuration(duration)}</Text>
                <Text style={s.sliderEdge}>10h</Text>
              </View>
              <Slider
                style={s.slider}
                minimumValue={240}
                maximumValue={600}
                step={15}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor="#8b5cf6"
                maximumTrackTintColor={colors.gray[200]}
                thumbTintColor="#8b5cf6"
              />
            </View>

            {/* Preview */}
            {willMeetGoal && (
              <View style={s.preview}>
                <Text style={s.previewText}>
                  {formatDuration(duration)} — Meta cumprida!
                </Text>
              </View>
            )}

            {/* Actions */}
            <View style={s.actions}>
              <Pressable style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={s.logBtn}
                onPress={() => { onLog(duration); onClose(); }}
              >
                <Text style={s.logBtnText}>Registrar {formatDuration(duration)}</Text>
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
  infoBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f5f3ff", borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  infoText: { fontSize: 14, fontWeight: "500", color: "#6d28d9" },
  label: { fontSize: 14, fontWeight: "500", color: colors.gray[700], marginBottom: spacing.phi2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.phi2, marginBottom: spacing.phi3 },
  presetBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.gray[100] },
  presetBtnActive: { backgroundColor: "#ede9fe" },
  presetText: { fontSize: 14, fontWeight: "500", color: colors.gray[600] },
  presetTextActive: { color: "#6d28d9" },
  sliderContainer: { marginBottom: spacing.phi3 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.phi1 },
  sliderEdge: { fontSize: 12, color: colors.gray[400] },
  sliderValue: { fontSize: 18, fontWeight: "600", color: colors.gray[900] },
  slider: { width: "100%", height: 40 },
  preview: { backgroundColor: "#f5f3ff", borderRadius: 10, padding: spacing.phi3, marginBottom: spacing.phi3 },
  previewText: { fontSize: 13, fontWeight: "500", color: "#6d28d9", textAlign: "center" },
  actions: { flexDirection: "row", gap: spacing.phi3 },
  cancelBtn: { flex: 1, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: colors.gray[100] },
  cancelText: { fontSize: 15, fontWeight: "600", color: colors.gray[600] },
  logBtn: { flex: 2, paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: "#8b5cf6" },
  logBtnText: { fontSize: 15, fontWeight: "600", color: colors.white },
});
