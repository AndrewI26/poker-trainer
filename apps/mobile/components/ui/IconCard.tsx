import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function IconCard({
  icon,
  iconBg,
  iconColor,
  heading,
  body,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  iconColor: string;
  heading: string;
  body: string;
  onPress?: () => void;
}) {
  const { t } = useTheme();

  const content = (pressed: boolean) => {
    const textColor = pressed ? t.assets.subtext : t.assets.text;
    const subtextColor = pressed ? t.assets.strokeInactive : t.assets.subtext;
    return (
      <View
        style={{
          backgroundColor: pressed
            ? t.assets.bgCardSecondary
            : t.assets.bgCardPrimary,
          borderRadius: theme.borderRadius.m,
          borderWidth: 1,
          borderColor: t.assets.border,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          transform: [{ scale: pressed ? 0.97 : 1 }],
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
            opacity: pressed ? 0.6 : 1,
          }}
        >
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.h5,
            color: textColor,
            marginBottom: theme.spacing.xs,
          }}
        >
          {heading}
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.sm,
            color: subtextColor,
            lineHeight: theme.fontSize.sm * theme.lineHeight.body,
          }}
        >
          {body}
        </Text>
        {onPress && (
          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color={t.assets.strokeInactive}
            style={{
              position: "absolute",
              top: theme.spacing.md,
              right: theme.spacing.md,
            }}
          />
        )}
      </View>
    );
  };

  if (!onPress) return content(false);

  return (
    <Pressable onPress={onPress}>{({ pressed }) => content(pressed)}</Pressable>
  );
}
