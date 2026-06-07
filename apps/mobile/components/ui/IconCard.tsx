import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = ReturnType<typeof useTheme>["t"];

export function IconCard({
  t,
  icon,
  iconBg,
  iconColor,
  heading,
  body,
}: {
  t: T;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  heading: string;
  body: string;
}) {
  return (
    <View
      style={{
        backgroundColor: t.assets.bgCardPrimary,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: t.assets.border,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: theme.borderRadius.s,
          backgroundColor: iconBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.spacing.md,
        }}
      >
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.h5,
          color: t.assets.text,
          marginBottom: theme.spacing.xs,
        }}
      >
        {heading}
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.sm,
          color: t.assets.subtext,
          lineHeight: theme.fontSize.sm * theme.lineHeight.body,
        }}
      >
        {body}
      </Text>
    </View>
  );
}
