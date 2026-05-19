import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { colors, spacing, radius, fontSize } from "../../constants/theme";
import AddAquariumModal from "../../components/AddAquariumModal";
import { router } from "expo-router";

type Aquarium = {
  id: string;
  name: string;
  volume: number;
  type: "freshwater" | "saltwater" | "brackish";
  description: string | null;
  created_at: string;
};

const typeLabels = {
  freshwater: "Eau douce",
  saltwater: "Eau salée",
  brackish: "Eau saumâtre",
};

const typeColors = {
  freshwater: "#2E86AB",
  saltwater: "#0066CC",
  brackish: "#4A7D6F",
};

const typeEmojis = {
  freshwater: "🌿",
  saltwater: "🌊",
  brackish: "🦀",
};

export default function Home() {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAquariums();
  }, []);

  async function fetchAquariums() {
    const { data, error } = await supabase
      .from("aquariums")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setAquariums(data);
    setLoading(false);
  }

  function renderAquarium({ item }: { item: Aquarium }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(tabs)/aquarium/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>{typeEmojis[item.type]}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: typeColors[item.type] + "22" },
            ]}
          >
            <Text style={[styles.badgeText, { color: typeColors[item.type] }]}>
              {typeLabels[item.type]}
            </Text>
          </View>
        </View>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardVolume}>{item.volume} L</Text>
        {item.description && (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mes aquariums</Text>
          <Text style={styles.headerSub}>
            {aquariums.length} bac{aquariums.length > 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors.accent}
          style={{ marginTop: spacing.xl }}
        />
      ) : aquariums.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐠</Text>
          <Text style={styles.emptyTitle}>Aucun aquarium</Text>
          <Text style={styles.emptyText}>
            Ajoutez votre premier bac pour commencer
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.emptyButtonText}>Créer un aquarium</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={aquariums}
          renderItem={renderAquarium}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <AddAquariumModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchAquariums}
      />
    </SafeAreaView>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  addButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardEmoji: {
    fontSize: 28,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: "600",
  },
  cardName: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  cardVolume: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: fontSize.sm,
    color: colors.textDim,
    lineHeight: 20,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  emptyButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  emptyButtonText: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});
