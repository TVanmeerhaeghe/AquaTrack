import { useEffect, useState } from "react";
import { Stack, router } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (session) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [loading, session]);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  );
}
