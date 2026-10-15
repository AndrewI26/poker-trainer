import "@/lib/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { SplashOverlay } from "@/components/features/SplashOverlay";
import { WEB_MAX_WIDTH } from "@/lib/layout";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function RootNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="train/preflop" />
        <Stack.Screen name="train/postflop" />
      </Stack.Protected>
    </Stack>
  );
}

function WebFrame({ children }: { children: ReactNode }) {
  const { t } = useTheme();

  if (Platform.OS !== "web") return children;

  return (
    <View
      style={[styles.webOuter, { backgroundColor: t.assets.bgCardSecondary }]}
    >
      <View
        style={[
          styles.webInner,
          { backgroundColor: t.assets.bgPage, borderColor: t.assets.border },
        ]}
      >
        {children}
      </View>
    </View>
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
    <WebFrame>
      {isRestoring || !splashDone ? (
        <SplashOverlay onFinish={onSplashFinish} />
      ) : (
        <RootNavigator />
      )}
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </WebFrame>
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

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    alignItems: "center",
  },
  webInner: {
    flex: 1,
    width: "100%",
    maxWidth: WEB_MAX_WIDTH,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
