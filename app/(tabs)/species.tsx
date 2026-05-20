import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../constants/theme";

type Aquarium = {
  id: string;
  name: string;
  type: string;
};

type Species = {
  id: string;
  name: string;
  type: string;
  quantity: number;
  aquarium_id: string;
  image_url: string | null;
};

type FishSpeciesDetail = {
  id: number;
  common_name: string;
  scientific_name: string;
  family: string;
  origin: string;
  category: string;
  water_type: string;
  ph_min: number;
  ph_max: number;
  temp_min: number;
  temp_max: number;
  gh_min: number | null;
  gh_max: number | null;
  kh_min: number | null;
  kh_max: number | null;
  size_average: number;
  size_max: number;
  pattern: string;
  difficulty: string;
  behavior: string;
  sociability: string;
  territoriality: string;
  biological_rhythm: string;
  current: string;
  diet: string;
  reproduction: string;
  lifespan: number | null;
  volume_min: number;
  population_min: number;
  robustness: string;
  availability: string;
  image_url: string | null;
  source_url: string;
};

const categoryEmojis: Record<string, string> = {
  fish: "🐟",
  invertebrate: "🦐",
  plant: "🌱",
  coral: "🪸",
};

const difficultyColors: Record<string, string> = {
  easy: "#52B788",
  medium: "#F4A261",
  hard: "#E94F37",
};

const difficultyLabels: Record<string, string> = {
  easy: "Facile",
  medium: "Moyen",
  hard: "Difficile",
};

const waterTypeLabels: Record<string, string> = {
  freshwater: "Eau douce",
  saltwater: "Eau salée",
  brackish: "Eau saumâtre",
};

const waterTypeColors: Record<string, string> = {
  freshwater: "#2E86AB",
  saltwater: "#0066CC",
  brackish: "#4A7D6F",
};

const behaviorLabels: Record<string, string> = {
  peaceful: "Paisible",
  "semi-aggressive": "Semi-agressif",
  aggressive: "Agressif",
};

const robustnessLabels: Record<string, string> = {
  fragile: "Fragile",
  medium: "Moyen",
  robust: "Robuste",
};

const availabilityLabels: Record<string, string> = {
  rare: "Rare",
  uncommon: "Peu commun",
  common: "Commun",
  very_common: "Très commun",
};

const currentLabels: Record<string, string> = {
  none: "Aucun",
  low: "Faible",
  medium: "Moyen",
  strong: "Fort",
};

const rhythmLabels: Record<string, string> = {
  diurne: "Diurne",
  nocturne: "Nocturne",
  crépusculaire: "Crépusculaire",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SpeciesDetailModal({
  species,
  onClose,
}: {
  species: FishSpeciesDetail | null;
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [species]);

  if (!species) return null;

  return (
    <Modal
      visible={!!species}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer} edges={["top"]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.modalClose}>Fermer</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle} numberOfLines={1}>
            {species.common_name}
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {species.image_url && !imgError ? (
            <Image
              source={{ uri: species.image_url }}
              style={styles.detailImage}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.detailImagePlaceholder}>
              <Text style={{ fontSize: 64 }}>
                {categoryEmojis[species.category] || "🐟"}
              </Text>
            </View>
          )}

          <View style={styles.detailContent}>
            <Text style={styles.detailName}>{species.common_name}</Text>
            <Text style={styles.detailScientific}>
              {species.scientific_name}
            </Text>

            <View style={styles.detailTags}>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor:
                      difficultyColors[species.difficulty] + "33",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: difficultyColors[species.difficulty] },
                  ]}
                >
                  {difficultyLabels[species.difficulty]}
                </Text>
              </View>
              <View
                style={[
                  styles.tag,
                  {
                    backgroundColor: waterTypeColors[species.water_type] + "33",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: waterTypeColors[species.water_type] },
                  ]}
                >
                  {waterTypeLabels[species.water_type]}
                </Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {availabilityLabels[species.availability] ||
                    species.availability}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🌍 Origine</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Origine" value={species.origin} />
                <InfoRow label="Famille" value={species.family} />
                <InfoRow label="Motif" value={species.pattern} />
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>📏 Morphologie</Text>
              <View style={styles.infoCard}>
                <InfoRow
                  label="Taille moyenne"
                  value={`${species.size_average} cm`}
                />
                <InfoRow label="Taille max" value={`${species.size_max} cm`} />
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>💧 Paramètres d'eau</Text>
              <View style={styles.paramsGrid}>
                {[
                  {
                    label: "pH",
                    value: `${species.ph_min} — ${species.ph_max}`,
                  },
                  {
                    label: "Temp.",
                    value: `${species.temp_min} — ${species.temp_max}°C`,
                  },
                  {
                    label: "GH",
                    value:
                      species.gh_min != null
                        ? `${species.gh_min} — ${species.gh_max}°dH`
                        : "—",
                  },
                  {
                    label: "KH",
                    value:
                      species.kh_min != null
                        ? `${species.kh_min} — ${species.kh_max}°dH`
                        : "—",
                  },
                ].map((p) => (
                  <View key={p.label} style={styles.paramChip}>
                    <Text style={styles.paramChipLabel}>{p.label}</Text>
                    <Text style={styles.paramChipValue}>{p.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🐠 Comportement</Text>
              <View style={styles.infoCard}>
                <InfoRow
                  label="Comportement"
                  value={behaviorLabels[species.behavior] || species.behavior}
                />
                <InfoRow label="Sociabilité" value={species.sociability} />
                <InfoRow
                  label="Territorialité"
                  value={
                    species.territoriality === "yes"
                      ? "Oui"
                      : species.territoriality === "no"
                        ? "Non"
                        : "Partielle"
                  }
                />
                <InfoRow
                  label="Rythme"
                  value={
                    rhythmLabels[species.biological_rhythm] ||
                    species.biological_rhythm
                  }
                />
                <InfoRow
                  label="Courant"
                  value={currentLabels[species.current] || species.current}
                />
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailSectionTitle}>🏠 Élevage</Text>
              <View style={styles.infoCard}>
                <InfoRow label="Alimentation" value={species.diet} />
                <InfoRow label="Reproduction" value={species.reproduction} />
                <InfoRow
                  label="Espérance de vie"
                  value={species.lifespan ? `${species.lifespan} ans` : "—"}
                />
                <InfoRow
                  label="Volume minimum"
                  value={`${species.volume_min} L`}
                />
                <InfoRow
                  label="Population minimum"
                  value={`${species.population_min} individu(s)`}
                />
                <InfoRow
                  label="Robustesse"
                  value={
                    robustnessLabels[species.robustness] || species.robustness
                  }
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function MyAquariumsView() {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [selectedAquarium, setSelectedAquarium] = useState<string | null>(null);
  const [species, setSpecies] = useState<Species[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<FishSpeciesDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAquariums();
  }, []);
  useEffect(() => {
    if (selectedAquarium) fetchSpecies();
  }, [selectedAquarium]);

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

  async function fetchSpecies() {
    if (!selectedAquarium) return;
    setLoading(true);
    const { data } = await supabase
      .from("species")
      .select("*")
      .eq("aquarium_id", selectedAquarium)
      .order("name");

    if (data && data.length > 0) {
      const names = data.map((s) => s.name);
      const { data: fishData } = await supabase
        .from("fish_species")
        .select("common_name, image_url")
        .in("common_name", names);

      const imageMap: Record<string, string | null> = {};
      (fishData || []).forEach((f) => {
        imageMap[f.common_name] = f.image_url;
      });

      setSpecies(
        data.map((s) => ({ ...s, image_url: imageMap[s.name] || null })),
      );
    } else {
      setSpecies([]);
    }
    setImgErrors({});
    setLoading(false);
  }

  async function fetchSpeciesDetail(name: string) {
    setLoadingDetail(true);
    const { data } = await supabase
      .from("fish_species")
      .select("*")
      .ilike("common_name", name)
      .limit(1);
    if (data && data.length > 0) setSelectedDetail(data[0]);
    setLoadingDetail(false);
  }

  const grouped = species.reduce(
    (acc, s) => {
      if (!acc[s.type]) acc[s.type] = [];
      acc[s.type].push(s);
      return acc;
    },
    {} as Record<string, Species[]>,
  );

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
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

            {loading ? (
              <ActivityIndicator
                color={colors.accent}
                style={{ marginTop: spacing.xl }}
              />
            ) : species.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>🐠</Text>
                <Text style={styles.emptyText}>Aucune espèce dans ce bac</Text>
                <Text style={styles.emptyHint}>
                  Ajoutez des espèces depuis la fiche de votre aquarium
                </Text>
              </View>
            ) : (
              Object.entries(grouped).map(([type, items]) => (
                <View key={type} style={styles.section}>
                  <Text style={styles.sectionLabel}>
                    {categoryEmojis[type]}{" "}
                    {type === "fish"
                      ? "Poissons"
                      : type === "plant"
                        ? "Plantes"
                        : type === "invertebrate"
                          ? "Invertébrés"
                          : "Coraux"}{" "}
                    ({items.length})
                  </Text>
                  <View style={styles.speciesList}>
                    {items.map((s, index) => (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.speciesRow,
                          index < items.length - 1 && styles.speciesRowBorder,
                        ]}
                        onPress={() => fetchSpeciesDetail(s.name)}
                      >
                        {s.image_url && !imgErrors[s.id] ? (
                          <Image
                            source={{ uri: s.image_url }}
                            style={styles.speciesThumbnail}
                            resizeMode="cover"
                            onError={() =>
                              setImgErrors((prev) => ({
                                ...prev,
                                [s.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <View style={styles.speciesEmojiBadge}>
                            <Text style={{ fontSize: 22 }}>
                              {categoryEmojis[s.type] || "🐟"}
                            </Text>
                          </View>
                        )}
                        <View style={styles.speciesInfo}>
                          <Text style={styles.speciesName}>{s.name}</Text>
                          <Text style={styles.speciesQty}>
                            {s.quantity} individu{s.quantity > 1 ? "s" : ""}
                          </Text>
                        </View>
                        <Text style={styles.speciesArrow}>›</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {loadingDetail && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      )}

      <SpeciesDetailModal
        species={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </>
  );
}

function EncyclopediaCard({
  item,
  onPress,
}: {
  item: FishSpeciesDetail;
  onPress: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  return (
    <TouchableOpacity style={styles.encyclopediaRow} onPress={onPress}>
      {item.image_url && !imgError ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.encyclopediaThumbnail}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={styles.encyclopediaThumbnailPlaceholder}>
          <Text style={{ fontSize: 24 }}>
            {categoryEmojis[item.category] || "🐟"}
          </Text>
        </View>
      )}
      <View style={styles.encyclopediaInfo}>
        <Text style={styles.encyclopediaName}>{item.common_name}</Text>
        <Text style={styles.encyclopediaScientific}>
          {item.scientific_name}
        </Text>
        <View style={styles.encyclopediaTags}>
          <View
            style={[
              styles.tag,
              { backgroundColor: difficultyColors[item.difficulty] + "33" },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: difficultyColors[item.difficulty] },
              ]}
            >
              {difficultyLabels[item.difficulty]}
            </Text>
          </View>
          <View
            style={[
              styles.tag,
              { backgroundColor: waterTypeColors[item.water_type] + "33" },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: waterTypeColors[item.water_type] },
              ]}
            >
              {waterTypeLabels[item.water_type]}
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.speciesArrow}>›</Text>
    </TouchableOpacity>
  );
}

function EncyclopediaView() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterWater, setFilterWater] = useState<string | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [results, setResults] = useState<FishSpeciesDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<FishSpeciesDetail | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => fetchSpecies(), 300);
    return () => clearTimeout(timeout);
  }, [search, filterType, filterWater, filterDifficulty]);

  async function fetchSpecies() {
    setLoading(true);
    let req = supabase
      .from("fish_species")
      .select("*")
      .order("common_name")
      .limit(50);
    if (search.trim()) req = req.ilike("common_name", `%${search}%`);
    if (filterType) req = req.eq("category", filterType);
    if (filterWater) req = req.eq("water_type", filterWater);
    if (filterDifficulty) req = req.eq("difficulty", filterDifficulty);
    const { data } = await req;
    setResults(data || []);
    setLoading(false);
  }

  const filters = [
    {
      label: "Type",
      options: [
        { key: "fish", label: "🐟 Poissons" },
        { key: "invertebrate", label: "🦐 Invertébrés" },
        { key: "plant", label: "🌱 Plantes" },
        { key: "coral", label: "🪸 Coraux" },
      ],
      value: filterType,
      setter: setFilterType,
    },
    {
      label: "Eau",
      options: [
        { key: "freshwater", label: "🌿 Douce" },
        { key: "saltwater", label: "🌊 Salée" },
        { key: "brackish", label: "🦀 Saumâtre" },
      ],
      value: filterWater,
      setter: setFilterWater,
    },
    {
      label: "Niveau",
      options: [
        { key: "easy", label: "Facile" },
        { key: "medium", label: "Moyen" },
        { key: "hard", label: "Difficile" },
      ],
      value: filterDifficulty,
      setter: setFilterDifficulty,
    },
  ];

  return (
    <>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une espèce..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 80, flexGrow: 0, marginBottom: spacing.sm }}
      >
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: spacing.lg,
            gap: spacing.xs,
            alignItems: "center",
            height: 80,
          }}
        >
          {filters.map((f) => (
            <View
              key={f.label}
              style={{
                flexDirection: "row",
                gap: spacing.xs,
                marginRight: spacing.sm,
              }}
            >
              {f.options.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.filterChip,
                    f.value === opt.key && styles.filterChipActive,
                  ]}
                  onPress={() => f.setter(f.value === opt.key ? null : opt.key)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      f.value === opt.key && styles.filterChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <ActivityIndicator
          color={colors.accent}
          style={{ marginTop: spacing.xl }}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.encyclopediaList}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Aucune espèce trouvée</Text>
            </View>
          }
          renderItem={({ item }) => (
            <EncyclopediaCard
              item={item}
              onPress={() => setSelectedDetail(item)}
            />
          )}
        />
      )}

      <SpeciesDetailModal
        species={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </>
  );
}

export default function SpeciesTab() {
  const [activeTab, setActiveTab] = useState<"mybacs" | "encyclopedia">(
    "mybacs",
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Espèces</Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === "mybacs" && styles.segmentActive,
          ]}
          onPress={() => setActiveTab("mybacs")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "mybacs" && styles.segmentTextActive,
            ]}
          >
            Mes bacs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            activeTab === "encyclopedia" && styles.segmentActive,
          ]}
          onPress={() => setActiveTab("encyclopedia")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "encyclopedia" && styles.segmentTextActive,
            ]}
          >
            Encyclopédie
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "mybacs" ? <MyAquariumsView /> : <EncyclopediaView />}
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
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderRadius: radius.sm,
  },
  segmentActive: { backgroundColor: colors.accent },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
  },
  segmentTextActive: { color: colors.text },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: "row", gap: spacing.sm },
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
  chipTextActive: { color: colors.accent, fontWeight: "700" },
  searchContainer: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    color: colors.text,
  },
  filterChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.accent + "22",
    borderColor: colors.accent,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "500",
  },
  filterChipTextActive: { color: colors.accent, fontWeight: "700" },
  encyclopediaList: { padding: spacing.lg, gap: spacing.sm },
  encyclopediaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  encyclopediaThumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  encyclopediaThumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  encyclopediaInfo: { flex: 1 },
  encyclopediaName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  encyclopediaScientific: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    fontStyle: "italic",
    marginBottom: spacing.xs,
  },
  encyclopediaTags: { flexDirection: "row", gap: spacing.xs },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginTop: spacing.xl,
  },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyText: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: "center",
  },
  speciesList: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  speciesRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  speciesRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  speciesThumbnail: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
  speciesEmojiBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  speciesInfo: { flex: 1 },
  speciesName: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  speciesQty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  speciesArrow: { fontSize: 20, color: colors.textDim },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bg + "CC",
    alignItems: "center",
    justifyContent: "center",
  },
  tag: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  tagText: { fontSize: 10, color: colors.textMuted, fontWeight: "500" },
  modalContainer: { flex: 1, backgroundColor: colors.bg },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalClose: { fontSize: fontSize.md, color: colors.accent, width: 60 },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  detailImage: { width: "100%", height: 220 },
  detailImagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: { padding: spacing.lg },
  detailName: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  detailScientific: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    fontStyle: "italic",
    marginTop: 4,
    marginBottom: spacing.md,
  },
  detailTags: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap",
    marginBottom: spacing.lg,
  },
  detailSection: { marginBottom: spacing.lg },
  detailSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: spacing.md,
  },
  paramsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  paramChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "47%",
    alignItems: "center",
  },
  paramChipLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  paramChipValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
});
