import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const isAvailable = Platform.OS === "ios" || Platform.OS === "android";

export const haptics = {
  /** Light tap — quick action buttons, tab switches, pull-to-refresh */
  light: () => {
    if (isAvailable)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  /** Medium impact — streak milestone in FeedbackModal */
  medium: () => {
    if (isAvailable)
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },
  /** Notification feedback — accept/deny friend request */
  notification: (
    type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType
      .Success
  ) => {
    if (isAvailable) Haptics.notificationAsync(type).catch(() => {});
  },
  /** Selection — subtle tick for segment changes */
  selection: () => {
    if (isAvailable) Haptics.selectionAsync().catch(() => {});
  },
};
