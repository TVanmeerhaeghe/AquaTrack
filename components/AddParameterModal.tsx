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

type Props = {
  visible: boolean;
  aquariumId: string;
  onClose: () => void;
  onSaved: () => void;
};

type Params = {
  ph: string;
  temperature: string;
  nitrates: string;
  nitrites: string;
  gh: string;
  kh: string;
};

const fields: {
  key: keyof Params;
  label: string;
  unit: string;
  placeholder: string;
}[] = [
  { key: "ph", label: "pH", unit: "", placeholder: "7.0" },
  { key: "temperature", label: "Température", unit: "°C", placeholder: "25" },
  { key: "nitrates", label: "Nitrates (NO3)", unit: "mg/L", placeholder: "20" },
  { key: "nitrites", label: "Nitrites (NO2)", unit: "mg/L", placeholder: "0" },
  { key: "gh", label: "GH", unit: "°dH", placeholder: "10" },
  { key: "kh", label: "KH", unit: "°dH", placeholder: "5" },
];

export default function AddParameterModal({
  visible,
  aquariumId,
  onClose,
  onSaved,
}: Props) {
  const [params, setParams] = useState<Params>({
    ph: "",
    temperature: "",
    nitrates: "",
    nitrites: "",
    gh: "",
    kh: "",
  });
  const [loading, setLoading] = useState(false);

  function reset() {
    setParams({
      ph: "",
      temperature: "",
      nitrates: "",
      nitrites: "",
      gh: "",
      kh: "",
    });
  }

  function updateParam(key: keyof Params, value: string) {
    setParams((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    const hasValue = Object.values(params).some((v) => v.trim() !== "");
    if (!hasValue) {
      Alert.alert("Erreur", "Saisissez au moins un paramètre.");
      return;
    }

    setLoading(true);

    const payload: Record<string, number | string> = {
      aquarium_id: aquariumId,
      measured_at: new Date().toISOString(),
    };

    for (const field of fields) {
      if (params[field.key].trim() !== "") {
        const val = parseFloat(params[field.key].replace(",", "."));
        if (isNaN(val)) {
          Alert.alert("Erreur", `La valeur de ${field.label} est invalide.`);
          setLoading(false);
          return;
        }
        payload[field.key] = val;
      }
    }

    const { error } = await supabase.from("water_parameters").insert(payload);

    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      reset();
      onSaved();
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
          <TouchableOpacity
            onPress={() => {
              reset();
              onClose();
            }}
          >
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Nouvelle mesure</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.save, loading && styles.saveDisabled]}>
              {loading ? "..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.hint}>
            Remplissez uniquement les paramètres que vous avez mesurés.
          </Text>

          <View style={styles.grid}>
            {fields.map((field) => (
              <View key={field.key} style={styles.fieldCard}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  {field.unit ? (
                    <Text style={styles.fieldUnit}>{field.unit}</Text>
                  ) : null}
                </View>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textDim}
                  value={params[field.key]}
                  onChangeText={(v) => updateParam(field.key, v)}
                  keyboardType="decimal-pad"
                />
              </View>
            ))}
          </View>

          <Text style={styles.dateHint}>
            📅 Mesure enregistrée à{" "}
            {new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            aujourd'hui
          </Text>
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
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  fieldCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    width: "47%",
  },
  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldUnit: {
    fontSize: fontSize.xs,
    color: colors.textDim,
  },
  fieldInput: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
    padding: 0,
  },
  dateHint: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    textAlign: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
});
