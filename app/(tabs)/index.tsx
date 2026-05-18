import { View, Text } from "react-native";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0F1923",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#F0F4F8", fontSize: 24 }}>🐟 AquaTrack</Text>
    </View>
  );
}
