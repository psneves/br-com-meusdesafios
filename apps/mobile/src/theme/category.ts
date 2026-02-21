import type { TrackableCategory } from "@meusdesafios/shared";
import { colors } from "./colors";

export interface CategoryStyle {
  /** Ionicons icon name */
  icon: string;
  color: string;
  lightBg: string;
  bg: string;
  label: string;
}

const configs: Record<TrackableCategory, CategoryStyle> = {
  WATER: {
    icon: "water-outline",
    color: colors.category.WATER.main,
    lightBg: colors.category.WATER.light,
    bg: colors.category.WATER.bg,
    label: "Água",
  },
  DIET_CONTROL: {
    icon: "restaurant-outline",
    color: colors.category.DIET_CONTROL.main,
    lightBg: colors.category.DIET_CONTROL.light,
    bg: colors.category.DIET_CONTROL.bg,
    label: "Alimentação",
  },
  SLEEP: {
    icon: "moon-outline",
    color: colors.category.SLEEP.main,
    lightBg: colors.category.SLEEP.light,
    bg: colors.category.SLEEP.bg,
    label: "Sono",
  },
  PHYSICAL_EXERCISE: {
    icon: "fitness-outline",
    color: colors.category.PHYSICAL_EXERCISE.main,
    lightBg: colors.category.PHYSICAL_EXERCISE.light,
    bg: colors.category.PHYSICAL_EXERCISE.bg,
    label: "Exercício",
  },
};

const fallback: CategoryStyle = {
  icon: "help-circle-outline",
  color: colors.gray[500],
  lightBg: colors.gray[100],
  bg: colors.gray[50],
  label: "Outro",
};

export function getCategoryStyle(category: TrackableCategory | string): CategoryStyle {
  return configs[category as TrackableCategory] || fallback;
}
