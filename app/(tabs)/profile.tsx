import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../constants/theme";

export default function Profile() {
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>⚙️</Text>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.sub}>Paramètres du compte</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  emoji: { fontSize: 52, marginBottom: spacing.md },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  sub: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  logoutText: {
    color: colors.error,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
