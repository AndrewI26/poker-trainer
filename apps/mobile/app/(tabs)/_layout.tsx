import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IoniconsName, color: string) {
  return <Ionicons name={name} size={24} color={color} />;
}

function Header({ title }: { title: string }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: t.assets.bgPage,
        paddingTop: insets.top + theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.body,
          color: t.assets.text,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        header: ({ options }) => <Header title={options.title ?? ""} />,
        tabBarStyle: {
          backgroundColor: t.assets.bgCardSecondary,
          borderTopColor: t.assets.strokeInactive,
          borderTopWidth: 1,
          height: 72 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 14,
          paddingHorizontal: 24,
        },
        tabBarActiveTintColor: t.assets.text,
        tabBarInactiveTintColor: t.assets.strokeInactive,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Train",
          tabBarIcon: ({ color }) => tabIcon("barbell-outline", color),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "Tools",
          tabBarIcon: ({ color }) => tabIcon("construct-outline", color),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => tabIcon("trophy-outline", color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => tabIcon("person-outline", color),
        }}
      />
    </Tabs>
  );
}
