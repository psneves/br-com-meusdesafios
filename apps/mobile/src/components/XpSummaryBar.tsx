import { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface XpSummaryBarProps {
  totalPoints: number;
  pointsWeek: number;
  pointsMonth: number;
  dayLabel: string;
}

export function XpSummaryBar({
  totalPoints,
  pointsWeek,
  pointsMonth,
  dayLabel,
}: XpSummaryBarProps) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <View style={styles.container}>
      {/* Today — golden ratio wider */}
      <Pressable
        style={[styles.cell, styles.cellPrimary]}
        onPress={() => setShowInfo(true)}
        accessibilityLabel={`${totalPoints} XP ${dayLabel}. Toque para saber mais`}
        accessibilityRole="button"
      >
        <View style={styles.valueRow}>
          <Text style={styles.valuePrimary}>{totalPoints}</Text>
          <Text style={styles.xpLabelPrimary}> XP</Text>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color={colors.primary[400]}
            style={styles.infoIcon}
          />
        </View>
        <Text style={styles.sublabelPrimary}>{dayLabel}</Text>
      </Pressable>

      <XpInfoModal visible={showInfo} onClose={() => setShowInfo(false)} />

      {/* Week */}
      <View style={[styles.cell, styles.cellSecondary]}>
        <View style={styles.valueRow}>
          <Text style={styles.valueSecondary}>{pointsWeek}</Text>
          <Text style={styles.xpLabelSecondary}> XP</Text>
        </View>
        <Text style={styles.sublabelSecondary}>Semana</Text>
      </View>

      {/* Month */}
      <View style={[styles.cell, styles.cellSecondary]}>
        <View style={styles.valueRow}>
          <Text style={styles.valueSecondary}>{pointsMonth}</Text>
          <Text style={styles.xpLabelSecondary}> XP</Text>
        </View>
        <Text style={styles.sublabelSecondary}>Mês</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: colors.gray[100],
    borderRadius: 16,
    padding: spacing.phi2,
    gap: spacing.phi2,
    marginBottom: spacing.phi4,
  },
  cell: {
    borderRadius: 14,
    paddingVertical: spacing.phi3,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
  },
  cellPrimary: {
    flex: 1.618,
    backgroundColor: colors.primary[50],
  },
  cellSecondary: {
    flex: 1,
    backgroundColor: colors.white,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  valuePrimary: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.primary[600],
  },
  xpLabelPrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary[500],
  },
  sublabelPrimary: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.primary[500],
    marginTop: 2,
  },
  valueSecondary: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.gray[800],
  },
  xpLabelSecondary: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[400],
  },
  sublabelSecondary: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.gray[400],
    marginTop: 2,
  },
  infoIcon: {
    marginLeft: 2,
    marginBottom: 8,
  },
});

/* ── XP explanation bottom-sheet modal ── */

type BodyPart = { text: string; italic?: boolean };
type XpSection =
  | { title: string; body: string; highlight: string; suffix: string }
  | { title: string; bodyParts: BodyPart[]; highlight: string; suffix: string };

const XP_SECTIONS: XpSection[] = [
  {
    title: "XP diário",
    body: "Ao bater a meta do dia em qualquer desafio, você ganha ",
    highlight: "+10 XP",
    suffix: ".",
  },
  {
    title: "Dia perfeito",
    bodyParts: [
      { text: "Se cumprir " },
      { text: "todos", italic: true },
      { text: " os 4 desafios no mesmo dia, ganha " },
    ],
    highlight: "+10 XP",
    suffix: " extra.",
  },
  {
    title: "Meta semanal",
    body: "Complete 7/7 dias de um desafio (Seg–Dom) e ganhe ",
    highlight: "+10 XP",
    suffix: " por desafio.",
  },
  {
    title: "Semana perfeita",
    bodyParts: [
      { text: "Bata " },
      { text: "todas", italic: true },
      { text: " as metas em " },
      { text: "todos", italic: true },
      { text: " os 7 dias e ganhe mais " },
    ],
    highlight: "+10 XP",
    suffix: " de bônus.",
  },
];

function XpInfoModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <Pressable
        style={infoStyles.overlay}
        onPress={onClose}
        accessibilityLabel="Fechar"
        accessibilityRole="button"
      >
        <Pressable style={infoStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={infoStyles.header}>
            <Text style={infoStyles.title}>Como funciona o XP</Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Fechar"
              accessibilityRole="button"
              hitSlop={12}
            >
              <Ionicons name="close" size={24} color={colors.gray[600]} />
            </Pressable>
          </View>

          {XP_SECTIONS.map((s) => (
            <View key={s.title} style={infoStyles.section}>
              <Text style={infoStyles.sectionTitle}>{s.title}</Text>
              <Text style={infoStyles.sectionBody}>
                {"body" in s ? (
                  <>
                    {s.body}
                    <Text style={infoStyles.highlight}>{s.highlight}</Text>
                    {s.suffix}
                  </>
                ) : (
                  <>
                    {s.bodyParts.map((p, i) =>
                      p.italic ? (
                        <Text key={i} style={infoStyles.italic}>
                          {p.text}
                        </Text>
                      ) : (
                        <Text key={i}>{p.text}</Text>
                      ),
                    )}
                    <Text style={infoStyles.highlight}>{s.highlight}</Text>
                    {s.suffix}
                  </>
                )}
              </Text>
            </View>
          ))}

          <Text style={infoStyles.footer}>
            Semana conta de segunda a domingo. Complete seus desafios e acumule
            XP!
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const infoStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.phi4,
    paddingTop: spacing.phi4,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.phi4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.gray[900],
  },
  section: {
    marginBottom: spacing.phi3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: colors.gray[600],
    lineHeight: 20,
  },
  highlight: {
    fontWeight: "700",
    color: colors.primary[600],
  },
  italic: {
    fontStyle: "italic",
  },
  footer: {
    fontSize: 12,
    color: colors.gray[400],
    marginTop: spacing.phi3,
  },
});
