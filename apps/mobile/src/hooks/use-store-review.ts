import * as StoreReview from "expo-store-review";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PROMPTED_KEY = "store-review-prompted";

export async function maybePromptReview(currentStreak: number) {
  if (currentStreak < 7) return;

  try {
    const alreadyPrompted = await AsyncStorage.getItem(PROMPTED_KEY);
    if (alreadyPrompted) return;

    const isAvailable = await StoreReview.isAvailableAsync();
    if (!isAvailable) return;

    await StoreReview.requestReview();
    await AsyncStorage.setItem(PROMPTED_KEY, "true");
  } catch {
    // Silent — never block UI
  }
}
