import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, radius, fontSize } from "../constants/theme";
import {
  registerForPushNotifications,
  scheduleWaterChangeReminder,
  scheduleFilterCleaningReminder,
  scheduleMeasurementReminder,
} from "../lib/notifications";

type Props = {
  visible: boolean;
  aquariumName: string;
  onClose: () => void;
};

const INTERVALS = [
  { label: "3 jours", days: 3 },
  { label: "7 jours", days: 7 },
  { label: "14 jours", days: 14 },
  { label: "30 jours", days: 30 },
];

export default function NotificationsModal({ visible, aquariumName, onClose }: Props) {
  const [waterChange, setWaterChange] = useState(false);
  const [waterInterval, setWaterInterval] = useState(7);
  const [filterCleaning, setFilterCleaning] = useState(false);
  const [filterInterval, setFilterInterval] = useState(14);
  const [measurement, setMeasurement] = useState(false);
  const [measurementInterval, setMeasurementInterval] = useState(7);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);

    const granted = await registerForPushNotifications();
    if (!granted) {
      Alert.alert(
        "Permission refusée",
        "Activez les notifications dans les réglages de votre iPhone pour recevoir des rappels."
      );
      setSaving(false);
      return;
    }

    try {
      if (waterChange) {
        await scheduleWaterChangeReminder(aquariumName, waterInterval);
      }
      if (filterCleaning) {
        await scheduleFilterCleaningReminder(aquariumName, filterInterval);
      }
      if (measurement) {
        await scheduleMeasurementReminder(aquariumName, measurementInterval);
      }

      Alert.alert("✅ Rappels configurés", "Vous recevrez des notifications selon vos préférences.");
      onClose();
    } catch (e) {
      Alert.alert("Erreur", "Impossible de configurer les rappels.");
    }

    setSaving(false);
  }

  function ReminderBlock({
    title,
    emoji,
    enabled,
    onToggle,
    interval,
    onIntervalChange,
  }: {
    title: string;
    emoji: string;
    enabled: boolean;
    onToggle: (v: boolean) => void;
    interval: number;
    onIntervalChange: (days: number) => void;
  }) {
    return (
      <View style={styles.reminderCard}>
        <View style={styles.reminderHeader}>
          <View style={styles.reminderLeft}>
            <Text style={styles.reminderEmoji}>{emoji}</Text>
            <Text style={styles.reminderTitle}>{title}</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.text}
          />
        </View>

        {enabled && (
          <View style={styles.intervalRow}>
            {INTERVALS.map((i) => (
              <TouchableOpacity
                key={i.days}
                style={[styles.intervalChip, interval === i.days && styles.intervalChipActive]}
                onPress={() => onIntervalChange(i.days)}
              >
                <Text style={[styles.intervalChipText, interval === i.days && styles.intervalChipTextActive]}>
                  {i.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Rappels</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text style={[styles.save, saving && styles.saveDisabled]}>
              {saving ? "..." : "Enregistrer"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.hint}>
            Configurez des rappels automatiques pour {aquariumName}.
          </Text>

          <ReminderBlock
            title="Changement d'eau"
            emoji="💧"
            enabled={waterChange}
            onToggle={setWaterChange}
            interval={waterInterval}
            onIntervalChange={setWaterInterval}
          />

          <ReminderBlock
            title="Nettoyage filtre"
            emoji="🔧"
            enabled={filterCleaning}
            onToggle={setFilterCleaning}
            interval={filterInterval}
            onIntervalChange={setFilterInterval}
          />

          <ReminderBlock
            title="Mesure paramètres"
            emoji="📊"
            enabled={measurement}
            onToggle={setMeasurement}
            interval={measurementInterval}
            onIntervalChange={setMeasurementInterval}
          />
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
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  reminderCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  reminderEmoji: { fontSize: 22 },
  reminderTitle: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  intervalRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: "wrap",
  },
  intervalChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  intervalChipActive: {
    backgroundColor: colors.accent + "22",
    borderColor: colors.accent,
  },
  intervalChipText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "500" },
  intervalChipTextActive: { color: colors.accent, fontWeight: "700" },
});
