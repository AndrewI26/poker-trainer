import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const HIGHLIGHTS = [
  {
    icon: "cards-outline" as const,
    title: "Preflop ranges",
    body: "Drill open, 3-bet and defend ranges until they are automatic.",
  },
  {
    icon: "chart-line" as const,
    title: "Postflop spots",
    body: "Work through real board textures with instant feedback.",
  },
  {
    icon: "trophy-outline" as const,
    title: "Track your edge",
    body: "See accuracy trends and where you leak the most EV.",
  },
];

export default function WelcomeScreen() {
  const { t } = useTheme();
  const router = useRouter();
  const accent = t.accent.icons.purpleContain;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.assets.bgPage }}>
      <View
        style={{
          flex: 1,
          padding: theme.spacing.md,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", gap: theme.spacing.lg }}
        >
          <View style={{ alignItems: "center" }}>
            <MaterialCommunityIcons
              name="poker-chip"
              size={48}
              color={accent}
            />
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.h2,
                color: t.assets.text,
                letterSpacing: 4,
                marginTop: theme.spacing.sm,
              }}
            >
              EDGE
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.body,
                color: t.assets.subtext,
                textAlign: "center",
              }}
            >
              Train the decisions that actually move your winrate.
            </Text>
          </View>

          <View style={{ gap: theme.spacing.md }}>
            {HIGHLIGHTS.map((item) => (
              <View
                key={item.title}
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.md,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.borderRadius.s,
                    backgroundColor: t.accent.icons.purpleBg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={accent}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.bold,
                      fontSize: theme.fontSize.body,
                      color: t.assets.text,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.regular,
                      fontSize: theme.fontSize.sm,
                      color: t.assets.subtext,
                    }}
                  >
                    {item.body}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <Button
            label="Get started"
            onPress={() => router.push("/onboarding")}
          />
          <Button
            label="I already have an account"
            variant="secondary"
            onPress={() => router.push("/login")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
