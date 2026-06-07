import { Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function StatRow({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: "up" | "down";
}) {
  const { t } = useTheme();
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
