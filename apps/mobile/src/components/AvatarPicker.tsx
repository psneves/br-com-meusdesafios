import { Pressable, Image, View, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../theme/colors";

interface AvatarPickerProps {
  avatarUrl: string | null;
  size?: number;
  isUploading: boolean;
  onPick: (uri: string) => void;
}

export function AvatarPicker({
  avatarUrl,
  size = 100,
  isUploading,
  onPick,
}: AvatarPickerProps) {
  const handlePress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onPick(result.assets[0].uri);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isUploading}
      accessibilityRole="button"
      accessibilityLabel="Alterar foto de perfil"
    >
      <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          />
        ) : (
          <Ionicons name="person" size={size * 0.5} color={colors.gray[400]} />
        )}
        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.white} />
          </View>
        )}
        <View style={styles.editBadge}>
          <Ionicons name="camera" size={14} color={colors.white} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    resizeMode: "cover",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary[500],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
});
