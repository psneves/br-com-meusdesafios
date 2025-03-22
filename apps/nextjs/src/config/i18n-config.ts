export const i18n = {
  defaultLocale: "pt-br",
  locales: ["en","es", "pt-br"],
} as const;

export type Locale = (typeof i18n)["locales"][number];

// 新增的映射对象
export const localeMap = {
  en: "English",
  "pt-br": "Português (Brasil)",
  es: "Español",
} as const;
