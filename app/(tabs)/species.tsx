import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, fontSize } from "../../constants/theme";

export default function Species() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.emoji}>🐠</Text>
        <Text style={styles.title}>Mes espèces</Text>
        <Text style={styles.sub}>Bientôt disponible</Text>
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
  sub: { fontSize: fontSize.md, color: colors.textMuted },
});
