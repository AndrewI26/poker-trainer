import { View, type ViewStyle } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function Card({
  children,
  style,
  variant = "primary",
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
}) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor:
            variant === "secondary"
              ? t.assets.bgCardSecondary
              : t.assets.bgCardPrimary,
          borderRadius: theme.borderRadius.m,
          borderWidth: 1,
          borderColor: t.assets.border,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
