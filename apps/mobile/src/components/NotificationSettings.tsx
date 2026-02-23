import { View, Text, Switch, Pressable, Platform, StyleSheet } from "react-native";
import { useState } from "react";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationPreferences } from "../hooks/use-notification-preferences";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

/** Parse "HH:MM" into a Date for the picker (today's date, given hour/minute). */
function timeStringToDate(time: string | null): Date {
  const d = new Date();
  if (time) {
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
  } else {
    d.setHours(18, 0, 0, 0);
  }
  return d;
}

/** Format a Date as "HH:MM". */
function dateToTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function NotificationSettings() {
  const { prefs, isLoading, update } = useNotificationPreferences();
  const [showPicker, setShowPicker] = useState(false);
  const [pendingTime, setPendingTime] = useState<Date | null>(null);

  if (isLoading || !prefs) return null;

  const displayTime = prefs.reminderTimeLocal
    ? prefs.reminderTimeLocal.slice(0, 5) // strip seconds if present
    : "18:00";

  const openPicker = () => {
    setPendingTime(timeStringToDate(prefs.reminderTimeLocal));
    setShowPicker(true);
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) {
      setPendingTime(date);
    }
  };

  const confirmTime = () => {
    if (pendingTime) {
      update({ reminderTimeLocal: dateToTimeString(pendingTime) });
    }
    setShowPicker(false);
    setPendingTime(null);
  };

  const cancelTime = () => {
    setShowPicker(false);
    setPendingTime(null);
  };

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
            onPress={showPicker ? undefined : openPicker}
            disabled={showPicker}
          >
            <View style={styles.rowLabel}>
              <Ionicons
                name="time-outline"
                size={20}
                color={colors.gray[600]}
              />
              <Text style={styles.rowText}>Horário do lembrete</Text>
            </View>
            <Text style={styles.timeValue}>{displayTime}</Text>
          </Pressable>

          {showPicker && pendingTime && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={pendingTime}
                mode="time"
                is24Hour
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
                minuteInterval={5}
                locale="pt-BR"
                style={Platform.OS === "ios" ? styles.iosPicker : undefined}
              />
              <View style={styles.pickerButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={cancelTime}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={styles.doneButton}
                  onPress={confirmTime}
                >
                  <Text style={styles.doneButtonText}>Salvar</Text>
                </Pressable>
              </View>
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
  pickerContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
    marginTop: spacing.phi2,
    paddingTop: spacing.phi2,
    alignItems: "center",
  },
  iosPicker: {
    height: 150,
    width: "100%",
  },
  pickerButtons: {
    flexDirection: "row",
    gap: spacing.phi3,
    marginTop: spacing.phi2,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.phi2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.gray[600],
    fontWeight: "600",
  },
  doneButton: {
    flex: 1,
    paddingVertical: spacing.phi2,
    backgroundColor: colors.primary[500],
    borderRadius: 8,
    alignItems: "center",
  },
  doneButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
