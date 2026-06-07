import { Text, View } from "react-native";
import type { Theme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = Theme;

export function StatRow({
  t,
  label,
  value,
  trend,
}: {
  t: T;
  label: string;
  value: string;
  trend?: "up" | "down";
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.sm,
          color: t.assets.subtext,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.body,
          color:
            trend === "up"
              ? t.sentiment.positive
              : trend === "down"
                ? t.sentiment.negative
                : t.assets.text,
        }}
      >
        {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}
        {value}
      </Text>
    </View>
  );
}
