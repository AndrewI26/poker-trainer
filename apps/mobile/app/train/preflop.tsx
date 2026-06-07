import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Label } from "@/components/ui";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export default function PreflopScreen() {
  const { t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        style={{
          backgroundColor: t.assets.bgPage,
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: t.assets.strokeInactive,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={t.assets.text}
          />
        </Pressable>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.body,
            color: t.assets.text,
            marginLeft: theme.spacing.sm,
          }}
        >
          Preflop Trainer
        </Text>
      </View>
      <ScreenWrapper>
        <Label>Coming soon</Label>
      </ScreenWrapper>
    </>
  );
}
