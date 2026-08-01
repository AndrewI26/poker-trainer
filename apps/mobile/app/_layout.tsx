import "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { SplashOverlay } from "@/components/features/SplashOverlay";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function RootNavigator() {
  const { token } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={!!token}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="train/preflop" />
        <Stack.Screen name="train/postflop" />
      </Stack.Protected>
    </Stack>
  );
}

function App() {
  const { colorScheme } = useTheme();
  const { isRestoring } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  return (
    <>
      {isRestoring || !splashDone ? (
        <SplashOverlay onFinish={onSplashFinish} />
      ) : (
        <RootNavigator />
      )}
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    LeagueSpartan_400Regular: require("@/assets/fonts/LeagueSpartan_400Regular.ttf"),
    LeagueSpartan_700Bold: require("@/assets/fonts/LeagueSpartan_700Bold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
