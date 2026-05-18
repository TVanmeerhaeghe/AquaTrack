import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../constants/theme";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Erreur", error.message);
    } else {
      Alert.alert(
        "Succès",
        "Vérifiez votre email pour confirmer votre compte.",
      );
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🐟</Text>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Commencez à gérer vos aquariums</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Inscription..." : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login">
              <Text style={styles.link}>Se connecter</Text>
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg + spacing.sm,
  },
  logo: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md - 1,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: spacing.xl + spacing.md,
    marginTop: spacing.xs + 2,
  },
  form: {
    gap: spacing.md - 2,
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
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 1,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  link: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
});
