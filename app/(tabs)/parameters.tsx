import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-gifted-charts";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../constants/theme";

type Aquarium = {
  id: string;
  name: string;
  type: string;
};

type WaterParameter = {
  id: string;
  ph: number | null;
  temperature: number | null;
  nitrates: number | null;
  nitrites: number | null;
  gh: number | null;
  kh: number | null;
  measured_at: string;
};

const PARAMS = [
  { key: "ph", label: "pH", unit: "", color: "#2E86AB" },
  { key: "temperature", label: "Température", unit: "°C", color: "#E94F37" },
  { key: "nitrates", label: "Nitrates", unit: "mg/L", color: "#F4A261" },
  { key: "nitrites", label: "Nitrites", unit: "mg/L", color: "#E76F51" },
  { key: "gh", label: "GH", unit: "°dH", color: "#52B788" },
  { key: "kh", label: "KH", unit: "°dH", color: "#9B5DE5" },
] as const;

type ParamKey = (typeof PARAMS)[number]["key"];

const PERIODS = [
  { label: "7j", days: 7 },
  { label: "30j", days: 30 },
  { label: "90j", days: 90 },
];

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Parameters() {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>(null);
  const [selectedParam, setSelectedParam] = useState<ParamKey>("ph");
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [data, setData] = useState<WaterParameter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAquariums();
  }, []);

  useEffect(() => {
    if (selectedAquarium) fetchParameters();
  }, [selectedAquarium, selectedPeriod]);

  async function fetchAquariums() {
    const { data } = await supabase
      .from("aquariums")
      .select("id, name, type")
      .order("created_at", { ascending: false });
    if (data && data.length > 0) {
      setAquariums(data);
      setSelectedAquarium(data[0].id);
    }
  }

  async function fetchParameters() {
    if (!selectedAquarium) return;
    setLoading(true);

    const from = new Date();
    from.setDate(from.getDate() - selectedPeriod);

    const { data } = await supabase
      .from("water_parameters")
      .select("*")
      .eq("aquarium_id", selectedAquarium)
      .gte("measured_at", from.toISOString())
      .order("measured_at", { ascending: true });

    setData(data || []);
    setLoading(false);
  }

  const currentParam = PARAMS.find((p) => p.key === selectedParam)!;

  const filteredData = data.filter((d) => d[selectedParam] !== null);

  const chartData = filteredData.map((d) => ({
    value: d[selectedParam] as number,
    label: new Date(d.measured_at).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }),
    dataPointText: String(d[selectedParam]),
  }));

  const values = filteredData.map((d) => d[selectedParam] as number);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 10;
  const avg = values.length
    ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
    : "—";
  const last = values.length ? values[values.length - 1] : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
        </View>

        {aquariums.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐠</Text>
            <Text style={styles.emptyText}>Aucun aquarium trouvé</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Aquarium</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {aquariums.map((aq) => (
                    <TouchableOpacity
                      key={aq.id}
                      style={[
                        styles.chip,
                        selectedAquarium === aq.id && styles.chipActive,
                      ]}
                      onPress={() => setSelectedAquarium(aq.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedAquarium === aq.id && styles.chipTextActive,
                        ]}
                      >
                        {aq.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Paramètre</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.row}>
                  {PARAMS.map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      style={[
                        styles.chip,
                        selectedParam === p.key && {
                          backgroundColor: p.color + "33",
                          borderColor: p.color,
                        },
                      ]}
                      onPress={() => setSelectedParam(p.key)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedParam === p.key && {
                            color: p.color,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Période</Text>
              <View style={styles.row}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.days}
                    style={[
                      styles.chip,
                      selectedPeriod === p.days && styles.chipActive,
                    ]}
                    onPress={() => setSelectedPeriod(p.days)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedPeriod === p.days && styles.chipTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loading ? (
              <ActivityIndicator
                color={colors.accent}
                style={{ marginTop: spacing.xl }}
              />
            ) : chartData.length < 2 ? (
              <View style={styles.emptyChart}>
                <Text style={styles.emptyEmoji}>📊</Text>
                <Text style={styles.emptyText}>
                  Pas assez de mesures sur cette période
                </Text>
                <Text style={styles.emptyHint}>
                  Il faut au moins 2 mesures pour afficher un graphique
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  {[
                    { label: "Dernière", value: `${last}${currentParam.unit}` },
                    { label: "Moyenne", value: `${avg}${currentParam.unit}` },
                    { label: "Min", value: `${min}${currentParam.unit}` },
                    { label: "Max", value: `${max}${currentParam.unit}` },
                  ].map((s) => (
                    <View key={s.label} style={styles.statCard}>
                      <Text style={styles.statLabel}>{s.label}</Text>
                      <Text
                        style={[
                          styles.statValue,
                          { color: currentParam.color },
                        ]}
                      >
                        {s.value}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>
                    {currentParam.label}
                    {currentParam.unit ? ` (${currentParam.unit})` : ""}
                  </Text>
                  <LineChart
                    data={chartData}
                    width={SCREEN_WIDTH - spacing.lg * 4}
                    height={180}
                    color={currentParam.color}
                    thickness={2}
                    dataPointsColor={currentParam.color}
                    dataPointsRadius={4}
                    curved
                    hideDataPoints={chartData.length > 20}
                    showVerticalLines
                    verticalLinesColor={colors.border}
                    xAxisColor={colors.border}
                    yAxisColor={colors.border}
                    yAxisTextStyle={{ color: colors.textDim, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: colors.textDim, fontSize: 9 }}
                    noOfSections={4}
                    backgroundColor={colors.surface}
                    rulesColor={colors.border}
                    rulesType="solid"
                    initialSpacing={10}
                    endSpacing={10}
                    areaChart
                    startFillColor={currentParam.color + "44"}
                    endFillColor={currentParam.color + "00"}
                    startOpacity={0.3}
                    endOpacity={0}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Historique</Text>
                  <View style={styles.historyList}>
                    {[...data].reverse().map((d) => {
                      const val = d[selectedParam];
                      if (val === null) return null;
                      return (
                        <View key={d.id} style={styles.historyRow}>
                          <Text style={styles.historyDate}>
                            {new Date(d.measured_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </Text>
                          <Text
                            style={[
                              styles.historyValue,
                              { color: currentParam.color },
                            ]}
                          >
                            {val}
                            {currentParam.unit}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accent + "22",
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyChart: {
    alignItems: "center",
    padding: spacing.xl,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    marginBottom: 2,
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  chartCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  historyList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  historyValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },
});
