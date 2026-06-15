import { Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

type BadgeVariant = "positive" | "negative" | "informative" | "neutral";

export function Badge({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const { t } = useTheme();
  const colors: Record<BadgeVariant, { bg: string; text: string }> = {
    positive: { bg: t.sentiment.positiveBg, text: t.sentiment.positive },
    negative: { bg: t.sentiment.negativeBg, text: t.sentiment.negative },
    informative: {
      bg: t.sentiment.informativeBg,
      text: t.sentiment.informative,
    },
    neutral: { bg: t.assets.bgDisabled, text: t.assets.subtext },
  };
  const c = colors[variant];

  return (
    <View
      style={{
        backgroundColor: c.bg,
        borderRadius: theme.borderRadius.xs,
        paddingVertical: 3,
        paddingHorizontal: theme.spacing.sm,
        alignSelf: "flex-start",
      }}
    >
      <Text
        style={{
          fontSize: theme.fontSize.xs,
          fontFamily: theme.fontFamily.bold,
          color: c.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
