import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { TodayCard } from "@meusdesafios/shared";
import { getCategoryStyle } from "../theme/category";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { StreakBadge } from "./StreakBadge";
import { PointsChip } from "./PointsChip";

interface ChallengeCardProps {
  card: TodayCard;
  onRegister: (cardId: string) => void;
}

export function ChallengeCard({ card, onRegister }: ChallengeCardProps) {
  const style = getCategoryStyle(card.category);
  const met = card.progress.met;

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: style.color },
        met && { backgroundColor: style.bg },
      ]}
    >
      {/* 3-column layout */}
      <View style={styles.row}>
        {/* Column 1: Icon */}
        <View
          style={[styles.iconWrapper, { backgroundColor: style.lightBg }]}
          accessible={false}
        >
          <Ionicons
            name={style.icon as keyof typeof Ionicons.glyphMap}
            size={22}
            color={style.color}
          />
        </View>

        {/* Column 2: Content */}
        <View style={styles.content}>
          {/* Row 1: Name + badges */}
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {card.name}
            </Text>
            {met && (
              <Ionicons
                name="checkmark"
                size={14}
                color={style.color}
                accessibilityLabel="Meta atingida"
              />
            )}
            <StreakBadge current={card.streak.current} />
            <PointsChip points={card.pointsToday} />
          </View>

          {/* Row 2: Goal description */}
          <Text style={styles.goalLabel} numberOfLines={1}>
            {getGoalLabel(card)}
          </Text>

          {/* Row 3: Progress bar + labels */}
          {card.goal.type === "target" && (
            <>
              <View
                style={styles.progressBarBg}
                accessibilityLabel={`Progresso: ${Math.round(card.progress.percentage)}%`}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, card.progress.percentage)}%`,
                      backgroundColor: style.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.progressText,
                  met && { color: style.color },
                ]}
              >
                {formatProgress(card)}
              </Text>
            </>
          )}
        </View>

        {/* Column 3: Action button */}
        <Pressable
          style={[
            styles.actionBtn,
            met
              ? { backgroundColor: colors.gray[200] }
              : { backgroundColor: style.color },
          ]}
          onPress={() => onRegister(card.userTrackableId)}
          accessibilityRole="button"
          accessibilityLabel={`Registrar ${card.name}`}
        >
          <Ionicons
            name={met ? "checkmark" : "add"}
            size={20}
            color={met ? colors.gray[400] : colors.white}
          />
        </Pressable>
      </View>
    </View>
  );
}

// ── Helpers ──────────────────────────────────────────────

function formatMinAsHours(min: number): string {
  if (min <= 0) return "0 h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h} h`;
  return `${h} h ${m.toString().padStart(2, "0")}`;
}

function getGoalLabel(card: TodayCard): string {
  const { goal, category } = card;

  if (goal.type === "binary") {
    if (category === "DIET_CONTROL") return "Dieta hoje";
    return "Completar";
  }

  if (goal.type === "time_window") {
    return `Até ${goal.timeWindowEnd}`;
  }

  const target = goal.target || 0;
  const unit = goal.unit || "";

  if (category === "SLEEP" && unit === "min") {
    return `Dormir ${formatMinAsHours(target)} na noite anterior`;
  }

  if (category === "DIET_CONTROL") {
    return `Seguir plano nas ${target} refeições`;
  }

  if (category === "PHYSICAL_EXERCISE") {
    return `Exercitar-se por ${target}${unit}`;
  }

  if (category === "WATER") {
    const formatted =
      target >= 1000 ? target.toLocaleString("pt-BR") : target.toString();
    return `Beber ${formatted}${unit}`;
  }

  return `${target} ${unit}`;
}

function formatProgress(card: TodayCard): string {
  const { progress, goal, category } = card;
  const value = progress.value;
  const target = goal.target || 0;
  const unit = goal.unit || "";

  if (category === "SLEEP" && unit === "min") {
    return `${formatMinAsHours(value)} / ${formatMinAsHours(target)}`;
  }

  return `${value.toLocaleString("pt-BR")} / ${target.toLocaleString("pt-BR")} ${unit}`;
}

// ── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: spacing.phi3,
    marginBottom: spacing.phi3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.phi3,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
    flexShrink: 1,
  },
  goalLabel: {
    fontSize: 10,
    color: colors.gray[400],
    lineHeight: 14,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[100],
    overflow: "hidden",
    marginTop: 2,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.gray[500],
    textAlign: "right",
    marginTop: 1,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
