import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, fontSize } from "../constants/theme";
import {
  calculateCompatibility,
  CompatibilityResult,
} from "../lib/compatibility";

type SpeciesInBac = {
  name: string;
  type: string;
  quantity: number;
};

type Props = {
  aquariumId: string;
  species: SpeciesInBac[];
};

export default function CompatibilityCard({ aquariumId, species }: Props) {
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (species.length > 0) analyze();
  }, [species]);

  async function analyze() {
    setLoading(true);

    const names = species.map((s) => s.name);
    const { data } = await supabase
      .from("fish_species")
      .select(
        "common_name, scientific_name, category, water_type, behavior, diet, temp_min, temp_max, ph_min, ph_max, size_max, sociability, population_min",
      )
      .in("common_name", names);

    const detailsMap: Record<string, any> = {};
    (data || []).forEach((d) => {
      detailsMap[d.common_name] = d;
    });

    const res = calculateCompatibility(species, detailsMap);
    setResult(res);
    setLoading(false);
  }

  if (species.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🔬 Compatibilité</Text>

      {loading ? (
        <ActivityIndicator
          color={colors.accent}
          style={{ marginVertical: spacing.md }}
        />
      ) : result ? (
        <>
          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <View
                style={[styles.scoreCircleInner, { borderColor: result.color }]}
              >
                <Text style={[styles.scoreNumber, { color: result.color }]}>
                  {result.score}
                </Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={[styles.scoreLabel, { color: result.color }]}>
                {result.label}
              </Text>
              <Text style={styles.scoreSubLabel}>
                {result.alerts.filter((a) => a.level === "error").length}{" "}
                erreur(s) ·{" "}
                {result.alerts.filter((a) => a.level === "warning").length}{" "}
                avertissement(s)
              </Text>
              <TouchableOpacity
                style={styles.expandBtn}
                onPress={() => setExpanded(!expanded)}
              >
                <Text style={styles.expandBtnText}>
                  {expanded ? "Masquer le détail" : "Voir le détail"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {expanded && (
            <View style={styles.alertsList}>
              {result.alerts.map((alert, index) => (
                <View
                  key={index}
                  style={[
                    styles.alertRow,
                    index < result.alerts.length - 1 && styles.alertRowBorder,
                  ]}
                >
                  <Text style={styles.alertIcon}>
                    {alert.level === "error"
                      ? "❌"
                      : alert.level === "warning"
                        ? "⚠️"
                        : "✅"}
                  </Text>
                  <Text
                    style={[
                      styles.alertText,
                      alert.level === "error" && styles.alertError,
                      alert.level === "warning" && styles.alertWarning,
                      alert.level === "info" && styles.alertInfo,
                    ]}
                  >
                    {alert.message}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircleInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    lineHeight: 28,
  },
  scoreMax: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  scoreInfo: { flex: 1 },
  scoreLabel: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  scoreSubLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  expandBtn: {
    alignSelf: "flex-start",
  },
  expandBtnText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: "600",
  },
  alertsList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  alertRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: "flex-start",
  },
  alertRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  alertIcon: { fontSize: 14, marginTop: 1 },
  alertText: { flex: 1, fontSize: fontSize.sm, lineHeight: 20 },
  alertError: { color: "#E94F37" },
  alertWarning: { color: "#F4A261" },
  alertInfo: { color: "#52B788" },
});
