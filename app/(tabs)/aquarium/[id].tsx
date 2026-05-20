import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../../constants/theme";
import AddParameterModal from "../../../components/AddParameterModal";
import AddSpeciesModal from "../../../components/AddSpeciesModal";
import SwipeableSpeciesRow from "../../../components/SwipeableSpeciesRow";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import CompatibilityCard from "../../../components/CompatibilityCard";

type Aquarium = {
  id: string;
  name: string;
  volume: number;
  type: "freshwater" | "saltwater" | "brackish";
  description: string | null;
  created_at: string;
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

type Species = {
  id: string;
  name: string;
  type: "fish" | "plant" | "invertebrate";
  quantity: number;
  image_url: string | null;
};

const typeLabels = {
  freshwater: "Eau douce",
  saltwater: "Eau salée",
  brackish: "Eau saumâtre",
};

const typeEmojis = {
  freshwater: "🌿",
  saltwater: "🌊",
  brackish: "🦀",
};

const speciesEmojis = {
  fish: "🐟",
  plant: "🌱",
  invertebrate: "🦐",
};

export default function AquariumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [aquarium, setAquarium] = useState<Aquarium | null>(null);
  const [parameters, setParameters] = useState<WaterParameter[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(true);
  const [showParamModal, setShowParamModal] = useState(false);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  async function fetchAll() {
    const [aqRes, paramRes, specRes] = await Promise.all([
      supabase.from("aquariums").select("*").eq("id", id).single(),
      supabase
        .from("water_parameters")
        .select("*")
        .eq("aquarium_id", id)
        .order("measured_at", { ascending: false })
        .limit(1),
      supabase.from("species").select("*").eq("aquarium_id", id),
    ]);

    if (aqRes.data) setAquarium(aqRes.data);
    if (paramRes.data) setParameters(paramRes.data);

    if (specRes.data && specRes.data.length > 0) {
      const names = specRes.data.map((s) => s.name);
      const { data: fishData } = await supabase
        .from("fish_species")
        .select("common_name, image_url")
        .in("common_name", names);

      const imageMap: Record<string, string | null> = {};
      (fishData || []).forEach((f) => {
        imageMap[f.common_name] = f.image_url;
      });

      const enriched = specRes.data.map((s) => ({
        ...s,
        image_url: imageMap[s.name] || null,
      }));
      setSpecies(enriched);
    } else {
      setSpecies([]);
    }

    setLoading(false);
  }

  async function handleDelete() {
    Alert.alert(
      "Supprimer",
      "Voulez-vous supprimer cet aquarium ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await supabase.from("aquariums").delete().eq("id", id);
            router.back();
          },
        },
      ],
    );
  }

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!aquarium) return null;

  const lastParam = parameters[0];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>Supprimer</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <Text style={styles.heroEmoji}>{typeEmojis[aquarium.type]}</Text>
            <Text style={styles.heroName}>{aquarium.name}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>{aquarium.volume} L</Text>
              <Text style={styles.heroMetaDot}>·</Text>
              <Text style={styles.heroMetaText}>
                {typeLabels[aquarium.type]}
              </Text>
            </View>
            {aquarium.description && (
              <Text style={styles.heroDesc}>{aquarium.description}</Text>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Derniers paramètres</Text>
              <TouchableOpacity
                style={styles.sectionBtn}
                onPress={() => setShowParamModal(true)}
              >
                <Text style={styles.sectionBtnText}>+ Mesure</Text>
              </TouchableOpacity>
            </View>

            {lastParam ? (
              <View style={styles.paramsGrid}>
                {[
                  { label: "pH", value: lastParam.ph, unit: "" },
                  { label: "Temp.", value: lastParam.temperature, unit: "°C" },
                  { label: "NO3", value: lastParam.nitrates, unit: "mg/L" },
                  { label: "NO2", value: lastParam.nitrites, unit: "mg/L" },
                  { label: "GH", value: lastParam.gh, unit: "°dH" },
                  { label: "KH", value: lastParam.kh, unit: "°dH" },
                ].map((p) => (
                  <View key={p.label} style={styles.paramCard}>
                    <Text style={styles.paramLabel}>{p.label}</Text>
                    <Text style={styles.paramValue}>
                      {p.value !== null ? `${p.value}${p.unit}` : "—"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Aucune mesure enregistrée
                </Text>
                <TouchableOpacity
                  style={styles.emptyCardBtn}
                  onPress={() => setShowParamModal(true)}
                >
                  <Text style={styles.emptyCardBtnText}>
                    Ajouter une mesure
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <CompatibilityCard aquariumId={id} species={species} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Espèces ({species.length})
              </Text>
              <TouchableOpacity
                style={styles.sectionBtn}
                onPress={() => setShowSpeciesModal(true)}
              >
                <Text style={styles.sectionBtnText}>+ Espèce</Text>
              </TouchableOpacity>
            </View>

            {species.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyCardText}>
                  Aucune espèce enregistrée
                </Text>
              </View>
            ) : (
              <View style={styles.speciesList}>
                {species.map((s, index) => (
                  <SwipeableSpeciesRow
                    key={s.id}
                    species={s}
                    onDeleted={fetchAll}
                    onPress={() => {}}
                    isLast={index === species.length - 1}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <AddParameterModal
          visible={showParamModal}
          aquariumId={id}
          onClose={() => setShowParamModal(false)}
          onSaved={fetchAll}
        />

        <AddSpeciesModal
          visible={showSpeciesModal}
          aquariumId={id}
          aquariumType={aquarium.type}
          onClose={() => setShowSpeciesModal(false)}
          onAdded={fetchAll}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {},
  backText: { fontSize: fontSize.md, color: colors.accent, fontWeight: "500" },
  deleteText: { fontSize: fontSize.sm, color: colors.error },
  hero: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  heroEmoji: { fontSize: 56, marginBottom: spacing.md },
  heroName: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  heroMetaText: { fontSize: fontSize.sm, color: colors.textMuted },
  heroMetaDot: { color: colors.textDim },
  heroDesc: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 20,
  },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  sectionBtn: {
    backgroundColor: colors.accent + "22",
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  sectionBtnText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: "600",
  },
  paramsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  paramCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "30.5%",
    alignItems: "center",
  },
  paramLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  paramValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.md,
  },
  emptyCardText: { fontSize: fontSize.sm, color: colors.textMuted },
  emptyCardBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  emptyCardBtnText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  speciesList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  speciesRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  speciesEmoji: { fontSize: 22 },
  speciesName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: "500",
  },
  speciesQty: { fontSize: fontSize.sm, color: colors.textMuted },
});
