import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { PASSWORD_RULES } from "@/lib/validation";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function PasswordRequirements({ password }: { password: string }) {
  const { t } = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <View
            key={rule.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <Ionicons
              name={met ? "checkmark-circle" : "ellipse-outline"}
              size={14}
              color={met ? t.sentiment.positive : t.assets.textDisabled}
            />
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.xs,
                color: met ? t.sentiment.positive : t.assets.subtext,
              }}
            >
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
