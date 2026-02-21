import { View, Image, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const SIZES = {
  sm: 32,
  md: 44,
  lg: 56,
} as const;

interface UserAvatarProps {
  avatarUrl: string | null;
  displayName: string;
  size?: keyof typeof SIZES;
}

export function UserAvatar({
  avatarUrl,
  displayName,
  size = "md",
}: UserAvatarProps) {
  const px = SIZES[size];
  const fontSize = size === "sm" ? 12 : size === "md" ? 16 : 20;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={[styles.image, { width: px, height: px, borderRadius: px / 2 }]}
      />
    );
  }

  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <View
      style={[
        styles.fallback,
        { width: px, height: px, borderRadius: px / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.gray[200],
  },
  fallback: {
    backgroundColor: colors.gray[200],
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: colors.gray[600],
    fontWeight: "600",
  },
});
