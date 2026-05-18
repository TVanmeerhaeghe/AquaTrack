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
            placeholderTextColor="#8A8A9E"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            placeholderTextColor="#8A8A9E"
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
    backgroundColor: "#0F1923",
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logo: {
    fontSize: 52,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#F0F4F8",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B8A9E",
    textAlign: "center",
    marginBottom: 40,
    marginTop: 6,
  },
  form: {
    gap: 14,
  },
  input: {
    backgroundColor: "#1A2535",
    borderWidth: 1,
    borderColor: "#2A3545",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#F0F4F8",
  },
  button: {
    backgroundColor: "#2E86AB",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    color: "#6B8A9E",
    fontSize: 14,
  },
  link: {
    color: "#2E86AB",
    fontSize: 14,
    fontWeight: "600",
  },
});
