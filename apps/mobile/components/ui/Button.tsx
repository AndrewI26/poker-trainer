import { Pressable, type PressableProps, Text } from "react-native";
import type { Theme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = Theme;
type ButtonVariant = "primary" | "secondary" | "tertiary" | "warning";

export function Button({
  t,
  label,
  variant = "primary",
  onPress,
  disabled,
}: {
  t: T;
  label: string;
  variant?: ButtonVariant;
  onPress?: PressableProps["onPress"];
  disabled?: boolean;
}) {
  const styles: Record<
    ButtonVariant,
    { bg: string; text: string; border?: string }
  > = {
    primary: {
      bg: disabled ? t.buttons.primary.bgDisabled : t.buttons.primary.bgActive,
      text: disabled
        ? t.buttons.primary.containDisabled
        : t.buttons.primary.containActive,
    },
    secondary: {
      bg: disabled
        ? t.buttons.secondary.bgDisabled
        : t.buttons.secondary.bgActive,
      text: disabled
        ? t.buttons.secondary.containDisabled
        : t.buttons.secondary.containActive,
      border: disabled
        ? t.buttons.secondary.borderDisabled
        : t.buttons.secondary.borderActive,
    },
    tertiary: {
      bg: disabled
        ? t.buttons.tertiary.bgDisabled
        : t.buttons.tertiary.bgActive,
      text: disabled
        ? t.buttons.tertiary.containDisabled
        : t.buttons.tertiary.containActive,
    },
    warning: {
      bg: t.buttons.warning.bgActive,
      text: t.buttons.warning.containActive,
    },
  };
  const s = styles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        backgroundColor: pressed ? t.assets.bgDisabled : s.bg,
        borderRadius: theme.borderRadius.m,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        alignItems: "center",
        borderWidth: s.border ? 1 : 0,
        borderColor: s.border,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Text
        style={{
          fontSize: theme.fontSize.body,
          fontFamily: theme.fontFamily.bold,
          color: s.text,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
