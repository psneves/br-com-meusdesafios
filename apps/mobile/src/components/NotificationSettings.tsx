import { View, Text, Switch, Pressable, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationPreferences } from "../hooks/use-notification-preferences";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

const TIME_OPTIONS = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "18:00",
  "20:00",
  "21:00",
];

export function NotificationSettings() {
  const { prefs, isLoading, update } = useNotificationPreferences();
  const [showTimePicker, setShowTimePicker] = useState(false);

  if (isLoading || !prefs) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Notificações</Text>

      <View style={styles.row}>
        <View style={styles.rowLabel}>
          <Ionicons
            name="notifications-outline"
            size={20}
            color={colors.gray[600]}
          />
          <Text style={styles.rowText}>Lembrete diário</Text>
        </View>
        <Switch
          value={prefs.dailyReminderEnabled}
          onValueChange={(val) => update({ dailyReminderEnabled: val })}
          trackColor={{
            false: colors.gray[200],
            true: colors.primary[300],
          }}
          thumbColor={
            prefs.dailyReminderEnabled
              ? colors.primary[500]
              : colors.gray[400]
          }
          accessibilityLabel="Lembrete diário"
        />
      </View>

      {prefs.dailyReminderEnabled && (
        <>
          <Pressable
            style={styles.row}
            onPress={() => setShowTimePicker(!showTimePicker)}
          >
            <View style={styles.rowLabel}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.gray[600]}
              />
              <Text style={styles.rowText}>Horário do lembrete</Text>
            </View>
            <Text style={styles.timeValue}>
              {prefs.reminderTimeLocal ?? "Não definido"}
            </Text>
          </Pressable>

          {showTimePicker && (
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((time) => (
                <Pressable
                  key={time}
                  style={[
                    styles.timePill,
                    prefs.reminderTimeLocal === time && styles.timePillActive,
                  ]}
                  onPress={() => {
                    update({ reminderTimeLocal: time });
                    setShowTimePicker(false);
                  }}
                  accessibilityLabel={`Definir horário para ${time}`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.timePillText,
                      prefs.reminderTimeLocal === time &&
                        styles.timePillTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi4,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.gray[900],
    marginBottom: spacing.phi3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.phi2,
  },
  rowLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi2,
  },
  rowText: {
    ...typography.body,
    color: colors.gray[700],
  },
  timeValue: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: "600",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.phi2,
    marginTop: spacing.phi2,
    paddingTop: spacing.phi2,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  timePill: {
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi2,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  timePillActive: {
    backgroundColor: colors.primary[500],
  },
  timePillText: {
    ...typography.caption,
    color: colors.gray[600],
    fontWeight: "600",
  },
  timePillTextActive: {
    color: colors.white,
  },
});
