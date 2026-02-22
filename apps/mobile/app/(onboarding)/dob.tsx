import { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useAuthStore } from "../../src/stores/auth.store";
import { api, ApiError } from "../../src/api/client";
import { colors } from "../../src/theme/colors";
import { typography } from "../../src/theme/typography";
import { spacing } from "../../src/theme/spacing";

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DobScreen() {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAndroidPicker, setShowAndroidPicker] = useState(false);
  const { setDateOfBirth, logout } = useAuthStore();

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowAndroidPicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleContinue = async () => {
    setError(null);

    const age = calculateAge(date);
    if (age < 13) {
      setBlocked(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const dob = formatDateString(date);
      await api.post("/api/profile/dob", { dateOfBirth: dob });
      setDateOfBirth(dob);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        setBlocked(true);
      } else {
        setError("Erro ao salvar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (blocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.topSpacer} />

          <View style={styles.hero}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              accessible={false}
            />
            <Text style={styles.title}>Acesso indisponível</Text>
            <Text style={styles.blockedMessage}>
              Infelizmente, você não pode usar o Meus Desafios no momento.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.exitButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={logout}
            accessibilityRole="button"
            accessibilityLabel="Sair"
          >
            <Text style={styles.exitButtonText}>Sair</Text>
          </Pressable>

          <View style={styles.footer} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topSpacer} />

        <View style={styles.hero}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.logo}
            accessible={false}
          />
          <Text style={styles.title}>Qual a sua data de nascimento?</Text>
          <Text style={styles.subtitle}>
            Precisamos dessa informação para continuar.
          </Text>
        </View>

        <View style={styles.pickerContainer}>
          {Platform.OS === "ios" ? (
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              locale="pt-BR"
              style={styles.picker}
            />
          ) : (
            <>
              <Pressable
                style={styles.androidDateButton}
                onPress={() => setShowAndroidPicker(true)}
                accessibilityRole="button"
                accessibilityLabel="Selecionar data de nascimento"
              >
                <Text style={styles.androidDateText}>
                  {date.toLocaleDateString("pt-BR")}
                </Text>
              </Pressable>
              {showAndroidPicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </>
          )}
        </View>

        <View style={styles.bottomSpacer} />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.continueButton,
            isSubmitting && styles.buttonDisabled,
            pressed && !isSubmitting && styles.buttonPressed,
          ]}
          onPress={handleContinue}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Continuar"
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.continueButtonText}>Continuar</Text>
          )}
        </Pressable>

        <View style={styles.footer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.phi5,
  },
  topSpacer: {
    flex: 1,
  },
  hero: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 22,
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
    marginTop: spacing.phi4,
    textAlign: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.phi2,
    textAlign: "center",
  },
  blockedMessage: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.phi3,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.phi4,
  },
  pickerContainer: {
    marginTop: spacing.phi5,
    alignItems: "center",
  },
  picker: {
    width: "100%",
    height: 180,
  },
  androidDateButton: {
    paddingVertical: spacing.phi3,
    paddingHorizontal: spacing.phi5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  androidDateText: {
    ...typography.h3,
    color: colors.gray[900],
    textAlign: "center",
  },
  bottomSpacer: {
    flex: 1,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.phi3,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  continueButton: {
    backgroundColor: colors.primary[500],
  },
  continueButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  exitButton: {
    backgroundColor: colors.gray[300],
  },
  exitButtonText: {
    ...typography.body,
    color: colors.gray[700],
    fontWeight: "600",
  },
  footer: {
    paddingTop: spacing.phi5,
    paddingBottom: spacing.phi4,
  },
});
