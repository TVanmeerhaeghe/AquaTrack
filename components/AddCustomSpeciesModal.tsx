import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, fontSize } from "../constants/theme";

type Props = {
  visible: boolean;
  aquariumId: string;
  aquariumType: string;
  initialName?: string;
  onClose: () => void;
  onAdded: () => void;
};

type iNatResult = {
  name: string;
  preferred_common_name?: string;
  image_url: string | null;
};

const CATEGORIES = [
  { key: "fish", label: "Poisson", emoji: "🐟" },
  { key: "invertebrate", label: "Invertébré", emoji: "🦐" },
  { key: "plant", label: "Plante", emoji: "🌱" },
  { key: "coral", label: "Corail", emoji: "🪸" },
];

export default function AddCustomSpeciesModal({
  visible,
  aquariumId,
  aquariumType,
  initialName = "",
  onClose,
  onAdded,
}: Props) {
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState("fish");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [searching, setSearching] = useState(false);
  const [iNatResult, setINatResult] = useState<iNatResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [saving, setSaving] = useState(false);

  function reset() {
    setName(initialName);
    setCategory("fish");
    setQuantity("1");
    setNotes("");
    setINatResult(null);
    setSearched(false);
  }

  async function searchINaturalist() {
    if (!name.trim()) return;
    setSearching(true);
    setSearched(false);
    setINatResult(null);

    try {
      const query = encodeURIComponent(name.trim());
      const res = await fetch(
        `https://api.inaturalist.org/v1/taxa?q=${query}&per_page=1&rank=species`,
        { headers: { Accept: "application/json" } },
      );
      const data = await res.json();
      const result = data.results?.[0];

      if (result) {
        setINatResult({
          name: result.name,
          preferred_common_name: result.preferred_common_name,
          image_url: result.default_photo?.medium_url || null,
        });
      }
    } catch {
      // pas de résultat, on continue sans
    }

    setSearched(true);
    setSearching(false);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom est requis.");
      return;
    }
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      Alert.alert("Erreur", "La quantité doit être au moins 1.");
      return;
    }

    setSaving(true);

    try {
      if (iNatResult) {
        const { data: existing } = await supabase
          .from("fish_species")
          .select("id")
          .ilike("scientific_name", iNatResult.name)
          .limit(1);

        if (!existing || existing.length === 0) {
          await supabase.from("fish_species").insert({
            common_name: iNatResult.preferred_common_name || name.trim(),
            scientific_name: iNatResult.name,
            category,
            water_type: aquariumType,
            image_url: iNatResult.image_url,
            difficulty: "medium",
            behavior: "peaceful",
            is_user_contributed: true,
          });
        }
      }

      const { error } = await supabase.from("species").insert({
        aquarium_id: aquariumId,
        name: iNatResult?.preferred_common_name || name.trim(),
        type: category,
        quantity: qty,
        notes: notes.trim() || null,
        is_custom: true,
      });

      if (error) throw error;

      reset();
      onClose();
      setTimeout(() => {
        onAdded();
      }, 300);
    } catch (err: any) {
      Alert.alert("Erreur", err.message || "Une erreur est survenue.");
    }

    setSaving(false);
  }

  function handleClose() {
    reset();
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
          <Text style={styles.title}>Espèce custom</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.save, saving && styles.saveDisabled]}>
              {saving ? "..." : "Ajouter"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Nom de l'espèce</Text>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Ex: Poisson lune"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setSearched(false);
                  setINatResult(null);
                }}
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={searchINaturalist}
                disabled={searching || !name.trim()}
              >
                {searching ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>🔍</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {searched && (
            <View style={styles.inatCard}>
              {iNatResult ? (
                <>
                  {iNatResult.image_url && (
                    <Image
                      source={{ uri: iNatResult.image_url }}
                      style={styles.inatImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.inatInfo}>
                    <View style={styles.inatBadge}>
                      <Text style={styles.inatBadgeText}>
                        ✅ Trouvé sur iNaturalist
                      </Text>
                    </View>
                    <Text style={styles.inatName}>
                      {iNatResult.preferred_common_name || name}
                    </Text>
                    <Text style={styles.inatScientific}>{iNatResult.name}</Text>
                    <Text style={styles.inatHint}>
                      Cette espèce sera ajoutée à la base de données commune.
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.inatNotFound}>
                  <Text style={styles.inatNotFoundText}>
                    ❌ Espèce non trouvée sur iNaturalist
                  </Text>
                  <Text style={styles.inatHint}>
                    L'espèce sera ajoutée uniquement à votre bac.
                  </Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Catégorie</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.categoryBtn,
                    category === c.key && styles.categoryBtnActive,
                  ]}
                  onPress={() => setCategory(c.key)}
                >
                  <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === c.key && styles.categoryLabelActive,
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Quantité</Text>
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

          <View style={styles.field}>
            <Text style={styles.label}>Notes (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Informations supplémentaires..."
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
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
  form: { padding: spacing.lg },
  field: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  searchRow: { flexDirection: "row", gap: spacing.sm },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    fontSize: fontSize.md - 1,
    color: colors.text,
  },
  textarea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: spacing.md - 2,
  },
  searchBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 48,
  },
  searchBtnText: { fontSize: 18 },
  inatCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  inatImage: { width: "100%", height: 140 },
  inatInfo: { padding: spacing.md },
  inatBadge: {
    backgroundColor: "#52B78833",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: "flex-start",
    marginBottom: spacing.sm,
  },
  inatBadgeText: { fontSize: fontSize.xs, color: "#52B788", fontWeight: "600" },
  inatName: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  inatScientific: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    fontStyle: "italic",
    marginBottom: spacing.sm,
  },
  inatHint: { fontSize: fontSize.xs, color: colors.textMuted, lineHeight: 18 },
  inatNotFound: { padding: spacing.md, alignItems: "center", gap: spacing.sm },
  inatNotFoundText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: "500",
  },
  categoryRow: { flexDirection: "row", gap: spacing.sm },
  categoryBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  categoryBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + "22",
  },
  categoryEmoji: { fontSize: 22 },
  categoryLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "500",
  },
  categoryLabelActive: { color: colors.accent, fontWeight: "700" },
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
    borderWidth: 1,
    borderColor: colors.border,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
  },
});
