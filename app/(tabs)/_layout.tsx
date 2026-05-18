import { Tabs } from "expo-router";
import { colors } from "../../constants/theme";
import { Text } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Mes bacs",
          tabBarIcon: ({ color, size }) => <TabIcon emoji="🐟" />,
        }}
      />
      <Tabs.Screen
        name="parameters"
        options={{
          title: "Paramètres",
          tabBarIcon: ({ color }) => <TabIcon emoji="📊" />,
        }}
      />
      <Tabs.Screen
        name="species"
        options={{
          title: "Espèces",
          tabBarIcon: ({ color }) => <TabIcon emoji="🐠" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabIcon emoji="⚙️" />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}
