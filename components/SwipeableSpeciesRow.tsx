import { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { supabase } from "../lib/supabase";
import { colors, spacing, radius, fontSize } from "../constants/theme";

type Species = {
  id: string;
  name: string;
  type: string;
  quantity: number;
};

const categoryEmojis: Record<string, string> = {
  fish: "🐟",
  invertebrate: "🦐",
  plant: "🌱",
  coral: "🪸",
};

type Props = {
  species: Species;
  onDeleted: () => void;
  onPress: () => void;
  isLast: boolean;
};

export default function SwipeableSpeciesRow({ species, onDeleted, onPress, isLast }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  async function handleDelete() {
    Alert.alert(
      "Supprimer",
      `Retirer ${species.name} de ce bac ?`,
      [
        {
          text: "Annuler",
          style: "cancel",
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await supabase.from("species").delete().eq("id", species.id);
            onDeleted();
          },
        },
      ]
    );
  }

  function renderRightActions(
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
        <Animated.Text style={[styles.deleteIcon, { transform: [{ scale }] }]}>
          🗑️
        </Animated.Text>
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          Supprimer
        </Animated.Text>
      </TouchableOpacity>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={40}
      overshootRight={false}
    >
      <TouchableOpacity
        style={[styles.row, !isLast && styles.rowBorder]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.emojiBadge}>
          <Text style={{ fontSize: 22 }}>
            {categoryEmojis[species.type] || "🐟"}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{species.name}</Text>
          <Text style={styles.qty}>
            {species.quantity} individu{species.quantity > 1 ? "s" : ""}
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emojiBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: { fontSize: fontSize.md, fontWeight: "600", color: colors.text },
  qty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 20, color: colors.textDim },
  deleteAction: {
    backgroundColor: colors.error,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    gap: spacing.xs,
  },
  deleteIcon: { fontSize: 20 },
  deleteText: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: "600",
  },
});
