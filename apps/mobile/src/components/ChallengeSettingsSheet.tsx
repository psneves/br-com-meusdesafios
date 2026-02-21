import { View, Text, Switch, Pressable, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TrackableCategory } from "@meusdesafios/shared";
import { useSettingsStore } from "../stores/settings.store";
import { getCategoryStyle } from "../theme/category";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const CATEGORIES: TrackableCategory[] = [
  "WATER",
  "DIET_CONTROL",
  "PHYSICAL_EXERCISE",
  "SLEEP",
];

const STEP: Record<TrackableCategory, number> = {
  WATER: 250,
  DIET_CONTROL: 1,
  PHYSICAL_EXERCISE: 15,
  SLEEP: 30,
};

const UNIT_LABEL: Record<TrackableCategory, string> = {
  WATER: "ml",
  DIET_CONTROL: "refeições",
  PHYSICAL_EXERCISE: "min",
  SLEEP: "min",
};

interface ChallengeSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function ChallengeSettingsSheet({
  visible,
  onClose,
}: ChallengeSettingsSheetProps) {
  const { settings, toggleActive, updateTarget } = useSettingsStore();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray[600]} />
          </Pressable>
        </View>

        {CATEGORIES.map((cat) => {
          const catStyle = getCategoryStyle(cat);
          const setting = settings[cat];
          return (
            <View key={cat} style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons
                  name={catStyle.icon as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={catStyle.color}
                />
                <Text style={styles.categoryName}>{catStyle.label}</Text>
              </View>

              <Switch
                value={setting.active}
                onValueChange={() => toggleActive(cat)}
                trackColor={{
                  false: colors.gray[300],
                  true: catStyle.color,
                }}
              />

              {setting.active && (
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() =>
                      updateTarget(cat, Math.max(STEP[cat], setting.target - STEP[cat]))
                    }
                    style={styles.stepButton}
                  >
                    <Ionicons name="remove" size={18} color={colors.gray[600]} />
                  </Pressable>
                  <Text style={styles.targetValue}>
                    {setting.target} {UNIT_LABEL[cat]}
                  </Text>
                  <Pressable
                    onPress={() => updateTarget(cat, setting.target + STEP[cat])}
                    style={styles.stepButton}
                  >
                    <Ionicons name="add" size={18} color={colors.gray[600]} />
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.phi4,
    paddingTop: spacing.phi5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.phi5,
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.phi3,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    gap: spacing.phi3,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi2,
    flex: 1,
  },
  categoryName: {
    ...typography.body,
    color: colors.gray[800],
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi2,
  },
  stepButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  targetValue: {
    ...typography.bodySmall,
    color: colors.gray[700],
    minWidth: 70,
    textAlign: "center",
  },
});
