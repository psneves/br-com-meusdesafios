import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useProfile } from "../../src/hooks/use-profile";
import { useAuthStore } from "../../src/stores/auth.store";
import { api, ApiError } from "../../src/api/client";
import { AvatarPicker } from "../../src/components/AvatarPicker";
import { NotificationSettings } from "../../src/components/NotificationSettings";
import { ProfileScreenSkeleton } from "../../src/components/skeletons/ProfileScreenSkeleton";
import { colors } from "../../src/theme/colors";
import { spacing } from "../../src/theme/spacing";
import { typography } from "../../src/theme/typography";

export default function ProfileScreen() {
  const {
    profile,
    isLoading,
    isSaving,
    error,
    updateProfile,
    uploadAvatar,
    isUploadingAvatar,
    checkHandle,
    handleAvailable,
    isCheckingHandle,
  } = useProfile();

  const logout = useAuthStore((s) => s.logout);
  const setDateOfBirth = useAuthStore((s) => s.setDateOfBirth);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handle, setHandle] = useState("");
  const [editing, setEditing] = useState(false);

  const [showDobPicker, setShowDobPicker] = useState(false);
  const [isSavingDob, setIsSavingDob] = useState(false);

  const startEditing = () => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setHandle(profile.handle);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    const success = await updateProfile({ firstName, lastName, handle });
    if (success) {
      setEditing(false);
    }
  };

  const handleHandleChange = (text: string) => {
    setHandle(text);
    checkHandle(text);
  };

  const handleDobChange = async (
    _event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowDobPicker(false);
    }
    if (!selectedDate) return;

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dob = `${y}-${m}-${d}`;

    setIsSavingDob(true);
    try {
      await api.post("/api/profile/dob", { dateOfBirth: dob });
      setDateOfBirth(dob);
      setShowDobPicker(false);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        Alert.alert("Erro", "Data de nascimento inválida.");
      } else {
        Alert.alert("Erro", "Não foi possível salvar. Tente novamente.");
      }
    } finally {
      setIsSavingDob(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta? Todos os seus dados serão apagados permanentemente. Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete("/api/profile");
              await logout();
            } catch {
              Alert.alert("Erro", "Não foi possível excluir a conta. Tente novamente.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <ProfileScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <AvatarPicker
            avatarUrl={profile?.avatarUrl ?? null}
            isUploading={isUploadingAvatar}
            onPick={uploadAvatar}
          />
          <Text style={styles.displayName}>{profile?.displayName}</Text>
          <Text style={styles.handleText}>@{profile?.handle}</Text>
        </View>

        {/* Error */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Profile Form */}
        {editing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Nome"
              accessibilityLabel="Nome"
            />

            <Text style={styles.label}>Sobrenome</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Sobrenome"
              accessibilityLabel="Sobrenome"
            />

            <Text style={styles.label}>Handle</Text>
            <View style={styles.handleRow}>
              <TextInput
                style={[styles.input, styles.handleInput]}
                value={handle}
                onChangeText={handleHandleChange}
                placeholder="handle"
                autoCapitalize="none"
                accessibilityLabel="Handle"
              />
              {isCheckingHandle && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary[500]}
                  style={styles.handleStatus}
                />
              )}
              {!isCheckingHandle && handleAvailable === true && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                  style={styles.handleStatus}
                />
              )}
              {!isCheckingHandle && handleAvailable === false && (
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.error}
                  style={styles.handleStatus}
                />
              )}
            </View>

            <View style={styles.formButtons}>
              <Pressable style={styles.cancelButton} onPress={cancelEditing} accessibilityRole="button" accessibilityLabel="Cancelar edição">
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Salvar perfil"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.editButton} onPress={startEditing} accessibilityRole="button" accessibilityLabel="Editar perfil">
            <Ionicons
              name="create-outline"
              size={18}
              color={colors.primary[500]}
            />
            <Text style={styles.editButtonText}>Editar perfil</Text>
          </Pressable>
        )}

        {/* Date of Birth */}
        {profile?.dateOfBirth && (
          <View style={styles.dobSection}>
            <Text style={styles.dobLabel}>Data de nascimento</Text>
            <Pressable
              style={styles.dobRow}
              onPress={() => setShowDobPicker(true)}
              disabled={isSavingDob}
              accessibilityRole="button"
              accessibilityLabel="Alterar data de nascimento"
            >
              <Text style={styles.dobValue}>
                {new Date(
                  profile.dateOfBirth + "T00:00:00"
                ).toLocaleDateString("pt-BR")}
              </Text>
              {isSavingDob ? (
                <ActivityIndicator size="small" color={colors.primary[500]} />
              ) : (
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.gray[400]}
                />
              )}
            </Pressable>
            {showDobPicker && (
              <DateTimePicker
                value={
                  new Date(profile.dateOfBirth + "T00:00:00")
                }
                mode="date"
                display="spinner"
                onChange={handleDobChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                locale="pt-BR"
              />
            )}
          </View>
        )}

        {/* Notification Preferences */}
        <NotificationSettings />

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout} accessibilityRole="button" accessibilityLabel="Sair da conta">
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.error}
          />
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>

        {/* Delete Account */}
        <Pressable style={styles.deleteButton} onPress={handleDeleteAccount} accessibilityRole="button" accessibilityLabel="Excluir conta">
          <Ionicons
            name="trash-outline"
            size={20}
            color={colors.gray[400]}
          />
          <Text style={styles.deleteText}>Excluir conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: spacing.phi4,
    paddingBottom: spacing.phi7,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.phi5,
  },
  displayName: {
    ...typography.h2,
    color: colors.gray[900],
    marginTop: spacing.phi3,
  },
  handleText: {
    ...typography.body,
    color: colors.gray[500],
    marginTop: spacing.phi1,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: "center",
    marginBottom: spacing.phi3,
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi4,
  },
  label: {
    ...typography.label,
    color: colors.gray[600],
    marginBottom: spacing.phi1,
    marginTop: spacing.phi3,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    paddingHorizontal: spacing.phi3,
    paddingVertical: spacing.phi3,
    ...typography.body,
    color: colors.gray[900],
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  handleInput: {
    flex: 1,
  },
  handleStatus: {
    marginLeft: spacing.phi2,
  },
  formButtons: {
    flexDirection: "row",
    gap: spacing.phi3,
    marginTop: spacing.phi4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.phi3,
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
  saveButton: {
    flex: 1,
    paddingVertical: spacing.phi3,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.phi2,
    paddingVertical: spacing.phi3,
    marginBottom: spacing.phi4,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  editButtonText: {
    ...typography.body,
    color: colors.primary[500],
    fontWeight: "600",
  },
  dobSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.phi4,
    marginBottom: spacing.phi4,
  },
  dobLabel: {
    ...typography.label,
    color: colors.gray[600],
    marginBottom: spacing.phi1,
  },
  dobRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dobValue: {
    ...typography.body,
    color: colors.gray[900],
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.phi2,
    paddingVertical: spacing.phi4,
    marginTop: spacing.phi5,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: "600",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.phi2,
    paddingVertical: spacing.phi3,
    marginTop: spacing.phi2,
  },
  deleteText: {
    ...typography.bodySmall,
    color: colors.gray[400],
  },
});
