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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../../src/hooks/use-profile";
import { useAuthStore } from "../../src/stores/auth.store";
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

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [handle, setHandle] = useState("");
  const [editing, setEditing] = useState(false);

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

  const handleLogout = () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
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
});
