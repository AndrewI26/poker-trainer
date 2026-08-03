import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { OnboardingOption } from "@/onboarding/questions";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function OptionRow({
  option,
  selected,
  multiSelect,
  onPress,
}: {
  option: OnboardingOption;
  selected: boolean;
  multiSelect: boolean;
  onPress: () => void;
}) {
  const { t } = useTheme();
  const accent = t.accent.icons.purpleContain;

  const icon = multiSelect
    ? selected
      ? "checkbox"
      : "square-outline"
    : selected
      ? "radio-button-on"
      : "radio-button-off";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multiSelect ? "checkbox" : "radio"}
      accessibilityState={{ checked: selected }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.md,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: selected ? accent : t.assets.border,
        backgroundColor: pressed
          ? t.assets.bgDisabled
          : selected
            ? t.accent.icons.purpleBg
            : t.assets.bgCardPrimary,
      })}
    >
      <Ionicons
        name={icon}
        size={22}
        color={selected ? accent : t.assets.iconInactive}
      />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.body,
            color: t.assets.text,
          }}
        >
          {option.label}
        </Text>
        {option.description && (
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: t.assets.subtext,
            }}
          >
            {option.description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
