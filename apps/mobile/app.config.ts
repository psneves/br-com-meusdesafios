import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Meus Desafios",
  slug: "meusdesafios",
  scheme: "meusdesafios",
  owner: "meusdesafios",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "br.com.meusdesafios",
    usesAppleSignIn: true,
    infoPlist: {
     UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0ea5e9",
    },
    package: "br.com.meusdesafios",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-image-picker",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Permitir que $(PRODUCT_NAME) use sua localização para o ranking perto de você.",
      },
    ],
    "expo-notifications",
    "@react-native-community/datetimepicker",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          process.env.GOOGLE_IOS_URL_SCHEME ||
          "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID",
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        organization: process.env.SENTRY_ORG || "meusdesafios",
        project: process.env.SENTRY_PROJECT || "mobile",
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL || "http://localhost:3000",
    googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID || "",
    googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID || "",
    sentryDsn: process.env.SENTRY_DSN || "",
    privacyPolicyUrl: "https://meusdesafios.com.br/privacy",
    termsOfUseUrl: "https://meusdesafios.com.br/terms",
    eas: {
      projectId: "YOUR_EAS_PROJECT_ID",
    },
  },
});
