import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, fontSize } from "../constants/theme";

type AquariumType = "freshwater" | "saltwater" | "brackish";

const types: { value: AquariumType; label: string; emoji: string }[] = [
  { value: "freshwater", label: "Eau douce", emoji: "🌿" },
  { value: "saltwater", label: "Eau salée", emoji: "🌊" },
  { value: "brackish", label: "Eau saumâtre", emoji: "🦀" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddAquariumModal({
  visible,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("");
  const [type, setType] = useState<AquariumType>("freshwater");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setName("");
    setVolume("");
    setType("freshwater");
    setDescription("");
  }

  async function handleCreate() {
    if (!name.trim()) return Alert.alert("Erreur", "Le nom est requis.");
    if (!volume || isNaN(Number(volume)))
      return Alert.alert("Erreur", "Le volume doit être un nombre.");

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("aquariums").insert({
      name: name.trim(),
      volume: Number(volume),
      type,
      description: description.trim() || null,
      user_id: user!.id,
    });

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      reset();
      onCreated();
      onClose();
    }

    setLoading(false);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nouvel aquarium</Text>
          <TouchableOpacity onPress={handleCreate} disabled={loading}>
            <Text style={[styles.save, loading && styles.saveDisabled]}>
              {loading ? "..." : "Créer"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.field}>
            <Text style={styles.label}>Nom du bac</Text>
            <TextInput
              style={styles.input}
              placeholder="Mon aquarium principal"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Volume (litres)</Text>
            <TextInput
              style={styles.input}
              placeholder="120"
              placeholderTextColor={colors.textMuted}
              value={volume}
              onChangeText={setVolume}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Type d'eau</Text>
            <View style={styles.typeRow}>
              {types.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typeBtn,
                    type === t.value && styles.typeBtnActive,
                  ]}
                  onPress={() => setType(t.value)}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text
                    style={[
                      styles.typeLabel,
                      type === t.value && styles.typeLabelActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description (optionnel)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Notes sur ce bac..."
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  save: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.accent,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  form: {
    padding: spacing.lg,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
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
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  typeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + "22",
  },
  typeEmoji: {
    fontSize: 22,
  },
  typeLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "500",
    textAlign: "center",
  },
  typeLabelActive: {
    color: colors.accent,
    fontWeight: "700",
  },
});
