import type { LucideIcon } from "lucide-react";
import {
  Droplets,
  Footprints,
  Utensils,
  Moon,
  Dumbbell,
  Bike,
  Waves,
  HeartPulse,
} from "lucide-react";
import type { TrackableCategory } from "@challengeos/shared";

export interface CategoryConfig {
  icon: LucideIcon;
  /** Tailwind text color for the accent */
  color: string;
  /** Light mode subtle background */
  bgLight: string;
  /** Dark mode subtle background */
  bgDark: string;
  /** Left border accent class */
  borderAccent: string;
  /** Button / interactive element bg */
  btnBg: string;
  btnHover: string;
  btnBgDark: string;
  btnHoverDark: string;
  /** Progress bar fill color */
  barColor: string;
  barColorDark: string;
  /** Met-state text */
  metText: string;
  metTextDark: string;
  /** Active/selected state bg */
  activeBg: string;
  activeBgDark: string;
  /** Active tab border */
  activeBorder: string;
}

const configs: Record<string, CategoryConfig> = {
  WATER: {
    icon: Droplets,
    color: "text-blue-500",
    bgLight: "bg-blue-50/50",
    bgDark: "dark:bg-blue-950/15",
    borderAccent: "border-l-blue-400",
    btnBg: "bg-blue-500",
    btnHover: "hover:bg-blue-600",
    btnBgDark: "dark:bg-blue-600",
    btnHoverDark: "dark:hover:bg-blue-500",
    barColor: "bg-blue-500",
    barColorDark: "dark:bg-blue-400",
    metText: "text-blue-600",
    metTextDark: "dark:text-blue-400",
    activeBg: "bg-blue-50",
    activeBgDark: "dark:bg-blue-900/15",
    activeBorder: "border-blue-400",
  },
  RUN: {
    icon: Footprints,
    color: "text-orange-500",
    bgLight: "bg-orange-50/50",
    bgDark: "dark:bg-orange-950/15",
    borderAccent: "border-l-orange-400",
    btnBg: "bg-orange-500",
    btnHover: "hover:bg-orange-600",
    btnBgDark: "dark:bg-orange-600",
    btnHoverDark: "dark:hover:bg-orange-500",
    barColor: "bg-orange-500",
    barColorDark: "dark:bg-orange-400",
    metText: "text-orange-600",
    metTextDark: "dark:text-orange-400",
    activeBg: "bg-orange-50",
    activeBgDark: "dark:bg-orange-900/15",
    activeBorder: "border-orange-400",
  },
  DIET: {
    icon: Utensils,
    color: "text-emerald-500",
    bgLight: "bg-emerald-50/50",
    bgDark: "dark:bg-emerald-950/15",
    borderAccent: "border-l-emerald-400",
    btnBg: "bg-emerald-500",
    btnHover: "hover:bg-emerald-600",
    btnBgDark: "dark:bg-emerald-600",
    btnHoverDark: "dark:hover:bg-emerald-500",
    barColor: "bg-emerald-500",
    barColorDark: "dark:bg-emerald-400",
    metText: "text-emerald-600",
    metTextDark: "dark:text-emerald-400",
    activeBg: "bg-emerald-50",
    activeBgDark: "dark:bg-emerald-900/15",
    activeBorder: "border-emerald-400",
  },
  SLEEP: {
    icon: Moon,
    color: "text-violet-500",
    bgLight: "bg-violet-50/50",
    bgDark: "dark:bg-violet-950/15",
    borderAccent: "border-l-violet-400",
    btnBg: "bg-violet-500",
    btnHover: "hover:bg-violet-600",
    btnBgDark: "dark:bg-violet-600",
    btnHoverDark: "dark:hover:bg-violet-500",
    barColor: "bg-violet-500",
    barColorDark: "dark:bg-violet-400",
    metText: "text-violet-600",
    metTextDark: "dark:text-violet-400",
    activeBg: "bg-violet-50",
    activeBgDark: "dark:bg-violet-900/15",
    activeBorder: "border-violet-400",
  },
  GYM: {
    icon: Dumbbell,
    color: "text-rose-500",
    bgLight: "bg-rose-50/50",
    bgDark: "dark:bg-rose-950/15",
    borderAccent: "border-l-rose-400",
    btnBg: "bg-rose-500",
    btnHover: "hover:bg-rose-600",
    btnBgDark: "dark:bg-rose-600",
    btnHoverDark: "dark:hover:bg-rose-500",
    barColor: "bg-rose-500",
    barColorDark: "dark:bg-rose-400",
    metText: "text-rose-600",
    metTextDark: "dark:text-rose-400",
    activeBg: "bg-rose-50",
    activeBgDark: "dark:bg-rose-900/15",
    activeBorder: "border-rose-400",
  },
  BIKE: {
    icon: Bike,
    color: "text-teal-500",
    bgLight: "bg-teal-50/50",
    bgDark: "dark:bg-teal-950/15",
    borderAccent: "border-l-teal-400",
    btnBg: "bg-teal-500",
    btnHover: "hover:bg-teal-600",
    btnBgDark: "dark:bg-teal-600",
    btnHoverDark: "dark:hover:bg-teal-500",
    barColor: "bg-teal-500",
    barColorDark: "dark:bg-teal-400",
    metText: "text-teal-600",
    metTextDark: "dark:text-teal-400",
    activeBg: "bg-teal-50",
    activeBgDark: "dark:bg-teal-900/15",
    activeBorder: "border-teal-400",
  },
  SWIM: {
    icon: Waves,
    color: "text-cyan-500",
    bgLight: "bg-cyan-50/50",
    bgDark: "dark:bg-cyan-950/15",
    borderAccent: "border-l-cyan-400",
    btnBg: "bg-cyan-500",
    btnHover: "hover:bg-cyan-600",
    btnBgDark: "dark:bg-cyan-600",
    btnHoverDark: "dark:hover:bg-cyan-500",
    barColor: "bg-cyan-500",
    barColorDark: "dark:bg-cyan-400",
    metText: "text-cyan-600",
    metTextDark: "dark:text-cyan-400",
    activeBg: "bg-cyan-50",
    activeBgDark: "dark:bg-cyan-900/15",
    activeBorder: "border-cyan-400",
  },
};

/** Fallback config for unknown categories */
const fallback: CategoryConfig = {
  icon: HeartPulse,
  color: "text-gray-500",
  bgLight: "bg-gray-50/50",
  bgDark: "dark:bg-gray-900/15",
  borderAccent: "border-l-gray-400",
  btnBg: "bg-gray-500",
  btnHover: "hover:bg-gray-600",
  btnBgDark: "dark:bg-gray-600",
  btnHoverDark: "dark:hover:bg-gray-500",
  barColor: "bg-gray-500",
  barColorDark: "dark:bg-gray-400",
  metText: "text-gray-600",
  metTextDark: "dark:text-gray-400",
  activeBg: "bg-gray-50",
  activeBgDark: "dark:bg-gray-900/15",
  activeBorder: "border-gray-400",
};

export function getCategoryConfig(category: TrackableCategory | string): CategoryConfig {
  return configs[category] || fallback;
}

/** Cardio group config (used by CardioCard) */
export const cardioConfig = {
  icon: HeartPulse,
  color: "text-rose-500",
  bgLight: "bg-rose-50/30",
  bgDark: "dark:bg-rose-950/10",
  borderAccent: "border-l-rose-400",
  metText: "text-rose-600",
  metTextDark: "dark:text-rose-400",
  activeBg: "bg-rose-50",
  activeBgDark: "dark:bg-rose-900/15",
  activeBorder: "border-rose-400",
};
