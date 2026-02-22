import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { api } from "../api/client";

// Show notifications when app is in foreground
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Notifications not available (e.g., missing aps-environment entitlement)
  console.warn("[PushNotifications] Failed to set notification handler:", "Notifications may not be available on this device/environment");
}

/**
 * Register for push notifications: check permission, request if needed,
 * get Expo push token, and send it to the backend.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications only work on physical devices
    return null;
  }

  // Android: create notification channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Padrão",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  // Get native APNs device token (for Apple Push Notifications Console testing)
  const nativeToken = await Notifications.getDevicePushTokenAsync();
  console.log("[PushNotifications] APNs device token:", nativeToken.data);

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const pushToken = tokenData.data;
  console.log("[PushNotifications] Expo push token:", pushToken);

  // Build a stable device ID
  const deviceId = `${Platform.OS}-${Device.modelName ?? "unknown"}-${Device.osVersion ?? "0"}`;

  try {
    await api.put("/api/mobile/devices/push-token", { deviceId, pushToken });
  } catch {
    // Non-critical — token will be sent again on next app launch
  }

  return pushToken;
}
