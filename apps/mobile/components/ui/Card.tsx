import { View, type ViewStyle } from "react-native";
import type { Theme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = Theme;

export function Card({
  t,
  children,
  style,
  variant = "primary",
}: {
  t: T;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
}) {
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
