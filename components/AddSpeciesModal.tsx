import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, fontSize } from "../constants/theme";
import AddCustomSpeciesModal from "./AddCustomSpeciesModal";

type FishSpecies = {
  id: number;
  common_name: string;
  scientific_name: string;
  category: string;
  water_type: string;
  difficulty: string;
  size_max: number;
  temp_min: number;
  temp_max: number;
  ph_min: number;
  ph_max: number;
  image_url: string | null;
};

type Props = {
  visible: boolean;
  aquariumId: string;
  aquariumType: string;
  onClose: () => void;
  onAdded: () => void;
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

const waterTypeMap: Record<string, string> = {
  freshwater: "freshwater",
  saltwater: "saltwater",
  brackish: "brackish",
};

function SpeciesImage({
  uri,
  style,
  emoji,
  placeholderStyle,
  emojiStyle,
}: {
  uri: string | null;
  style: object;
  emoji: string;
  placeholderStyle: object;
  emojiStyle?: object;
}) {
  const [error, setError] = useState(false);
  if (uri && !error) {
    return (
      <Image
        source={{ uri }}
        style={style}
        resizeMode="cover"
        onError={() => setError(true)}
      />
    );
  }
  return (
    <View style={placeholderStyle}>
      <Text style={emojiStyle || { fontSize: 20 }}>{emoji}</Text>
    </View>
  );
}

export default function AddSpeciesModal({
  visible,
  aquariumId,
  aquariumType,
  onClose,
  onAdded,
}: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<FishSpecies[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FishSpecies | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [saving, setSaving] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    if (visible) {
      searchSpecies("");
    }
  }, [visible]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchSpecies(search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function searchSpecies(query: string) {
    setLoading(true);
    let req = supabase
      .from("fish_species")
      .select(
        "id, common_name, scientific_name, category, water_type, difficulty, size_max, temp_min, temp_max, ph_min, ph_max, image_url",
      )
      .eq("water_type", waterTypeMap[aquariumType] || aquariumType)
      .limit(30);

    if (query.trim()) {
      req = req.ilike("common_name", `%${query}%`);
    }

    const { data } = await req;
    setResults(data || []);
    setLoading(false);
  }

  async function handleAdd() {
    if (!selected) return;
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert("Erreur", "La quantité doit être au moins 1.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("species").insert({
      aquarium_id: aquariumId,
      name: selected.common_name,
      type: selected.category,
      quantity: qty,
    });

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      setSelected(null);
      setSearch("");
      setQuantity("1");
      onAdded();
      onClose();
    }
    setSaving(false);
  }

  function handleClose() {
    setSelected(null);
    setSearch("");
    setQuantity("1");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ajouter une espèce</Text>
          <TouchableOpacity onPress={handleAdd} disabled={!selected || saving}>
            <Text
              style={[
                styles.save,
                (!selected || saving) && styles.saveDisabled,
              ]}
            >
              {saving ? "..." : "Ajouter"}
            </Text>
          </TouchableOpacity>
        </View>

        {selected ? (
          <View style={styles.selectedView}>
            <View style={styles.selectedCard}>
              <SpeciesImage
                uri={selected.image_url}
                style={styles.selectedImage}
                emoji={categoryEmojis[selected.category] || "🐟"}
                placeholderStyle={styles.selectedImagePlaceholder}
                emojiStyle={styles.selectedEmoji}
              />
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedName}>{selected.common_name}</Text>
                <Text style={styles.selectedScientific}>
                  {selected.scientific_name}
                </Text>
                <View style={styles.selectedTags}>
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor:
                          difficultyColors[selected.difficulty] + "33",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        { color: difficultyColors[selected.difficulty] },
                      ]}
                    >
                      {difficultyLabels[selected.difficulty]}
                    </Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      Max {selected.size_max} cm
                    </Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {selected.temp_min}-{selected.temp_max}°C
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.quantityLabel}>Quantité</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() =>
                    setQuantity(
                      String(Math.max(1, parseInt(quantity || "1") - 1)),
                    )
                  }
                >
                  <Text style={styles.quantityBtnText}>−</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.quantityBtn}
                  onPress={() =>
                    setQuantity(String(parseInt(quantity || "1") + 1))
                  }
                >
                  <Text style={styles.quantityBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setSelected(null)}
            >
              <Text style={styles.changeBtnText}>
                ← Choisir une autre espèce
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une espèce..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>

            {loading ? (
              <ActivityIndicator
                color={colors.accent}
                style={{ marginTop: spacing.xl }}
              />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <Text style={styles.emptyText}>Aucune espèce trouvée</Text>
                    <Text style={styles.emptyHint}>
                      Cette espèce n'est pas encore dans notre base
                    </Text>
                    <TouchableOpacity
                      style={styles.customBtn}
                      onPress={() => setShowCustomModal(true)}
                    >
                      <Text style={styles.customBtnText}>
                        + Ajouter une espèce
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultRow}
                    onPress={() => setSelected(item)}
                  >
                    <SpeciesImage
                      uri={item.image_url}
                      style={styles.thumbnail}
                      emoji={categoryEmojis[item.category] || "🐟"}
                      placeholderStyle={styles.thumbnailPlaceholder}
                    />
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>{item.common_name}</Text>
                      <Text style={styles.resultScientific}>
                        {item.scientific_name}
                      </Text>
                      <View style={styles.resultTags}>
                        <View
                          style={[
                            styles.tag,
                            {
                              backgroundColor:
                                difficultyColors[item.difficulty] + "33",
                            },
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
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>
                            Max {item.size_max} cm
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </>
        )}
        <AddCustomSpeciesModal
          visible={showCustomModal}
          aquariumId={aquariumId}
          aquariumType={aquariumType}
          initialName={search}
          onClose={() => setShowCustomModal(false)}
          onAdded={() => {
            setShowCustomModal(false);
            setTimeout(() => {
              onAdded();
              onClose();
            }, 300);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: { fontSize: fontSize.md, color: colors.textMuted },
  title: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  save: { fontSize: fontSize.md, fontWeight: "700", color: colors.accent },
  saveDisabled: { opacity: 0.4 },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
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
  list: { padding: spacing.lg, gap: spacing.sm },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  thumbnailPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: { flex: 1 },
  resultName: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  resultScientific: {
    fontSize: fontSize.xs,
    color: colors.textDim,
    fontStyle: "italic",
    marginBottom: spacing.xs,
  },
  resultTags: { flexDirection: "row", gap: spacing.xs },
  arrow: { fontSize: 20, color: colors.textDim },
  tag: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  tagText: { fontSize: 10, color: colors.textMuted, fontWeight: "500" },
  empty: { alignItems: "center", padding: spacing.xl },
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
  selectedView: { flex: 1, padding: spacing.lg },
  selectedCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  selectedImage: { width: "100%", height: 160 },
  selectedImagePlaceholder: {
    width: "100%",
    height: 120,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedEmoji: { fontSize: 48 },
  selectedInfo: { padding: spacing.lg },
  selectedName: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  selectedScientific: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    fontStyle: "italic",
    marginBottom: spacing.md,
  },
  selectedTags: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  quantitySection: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  quantityLabel: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  quantityBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityBtnText: { fontSize: 24, color: colors.text, fontWeight: "300" },
  quantityInput: {
    width: 80,
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
  changeBtn: { alignItems: "center" },
  changeBtnText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: "500",
  },
  customBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
  customBtnText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
