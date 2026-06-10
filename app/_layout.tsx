import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORS } from "../constants/theme";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: "#FFF",
          headerTitleStyle: { fontWeight: "700", fontSize: 18 },
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "🥡 Cardápio" }} />
        <Stack.Screen name="prato/novo" options={{ title: "Novo Prato" }} />
        <Stack.Screen name="prato/[id]" options={{ title: "Detalhes" }} />
        <Stack.Screen name="prato/editar/[id]" options={{ title: "Editar Prato" }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
