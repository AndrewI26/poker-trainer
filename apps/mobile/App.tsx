import { createApiClient } from "@poker-trainer/api-client";
import { useDrills } from "@poker-trainer/query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

function DrillsScreen() {
  const client = useMemo(() => createApiClient(apiBase), []);
  const { data, isLoading, error } = useDrills(client);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
        <Text style={styles.muted}>Loading drills…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{(error as Error).message}</Text>
        <Text style={styles.muted}>Set EXPO_PUBLIC_API_URL if the API is not on {apiBase}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <Text style={styles.title}>Poker Trainer</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.name}>{item.name}</Text>
          {item.description ? <Text style={styles.muted}>{item.description}</Text> : null}
        </View>
      )}
    />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container}>
        <DrillsScreen />
        <StatusBar style="auto" />
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 56,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
  },
  muted: {
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  error: {
    color: "#c00",
    marginBottom: 8,
    textAlign: "center",
  },
});
