import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Meus Desafios",
  slug: "meusdesafios",
  scheme: "meusdesafios",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0ea5e9",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.meusdesafios.app",
    usesAppleSignIn: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0ea5e9",
    },
    package: "com.meusdesafios.app",
  },
  plugins: ["expo-router", "expo-secure-store", "expo-image-picker"],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
  },
});
