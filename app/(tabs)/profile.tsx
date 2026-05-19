import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../constants/theme";

type Stats = {
  aquariums: number;
  species: number;
  measurements: number;
};

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    aquariums: 0,
    species: 0,
    measurements: 0,
  });
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email || null);
    setMemberSince(
      new Date(user.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
    );

    const [aqRes, specRes, paramRes] = await Promise.all([
      supabase
        .from("aquariums")
        .select("id", { count: "exact" })
        .eq("user_id", user.id),
      supabase
        .from("species")
        .select("id", { count: "exact" })
        .in(
          "aquarium_id",
          (
            await supabase.from("aquariums").select("id").eq("user_id", user.id)
          ).data?.map((a) => a.id) || [],
        ),
      supabase
        .from("water_parameters")
        .select("id", { count: "exact" })
        .in(
          "aquarium_id",
          (
            await supabase.from("aquariums").select("id").eq("user_id", user.id)
          ).data?.map((a) => a.id) || [],
        ),
    ]);

    setStats({
      aquariums: aqRes.count || 0,
      species: specRes.count || 0,
      measurements: paramRes.count || 0,
    });
    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Toutes vos données seront supprimées.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ],
    );
  }

  const avatarLetter = email ? email[0].toUpperCase() : "?";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.email}>{email}</Text>
          {memberSince && (
            <Text style={styles.memberSince}>Membre depuis {memberSince}</Text>
          )}
        </View>

        <View style={styles.statsSection}>
          {[
            { label: "Aquariums", value: stats.aquariums, emoji: "🐟" },
            { label: "Espèces", value: stats.species, emoji: "🐠" },
            { label: "Mesures", value: stats.measurements, emoji: "📊" },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Espèces en base</Text>
              <Text style={styles.infoValue}>93</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Développé par</Text>
              <Text style={styles.infoValue}>Téo Vanmeerhaeghe</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
              <Text style={styles.actionText}>Se déconnecter</Text>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionRow, styles.actionRowLast]}
              onPress={handleDeleteAccount}
            >
              <Text style={[styles.actionText, styles.actionDanger]}>
                Supprimer le compte
              </Text>
              <Text style={[styles.actionArrow, styles.actionDanger]}>→</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: "500",
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  statsSection: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  statEmoji: { fontSize: 24 },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: colors.textDim,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  infoValue: { fontSize: fontSize.sm, color: colors.text, fontWeight: "500" },
  actionsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionRowLast: { borderBottomWidth: 0 },
  actionText: { fontSize: fontSize.md, color: colors.text, fontWeight: "500" },
  actionArrow: { fontSize: fontSize.md, color: colors.textDim },
  actionDanger: { color: colors.error },
});
