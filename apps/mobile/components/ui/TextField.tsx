import { Text, TextInput, type TextInputProps, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string | null }) {
  const { t } = useTheme();

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.xs,
          color: t.assets.subtext,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={t.assets.textDisabled}
        {...props}
        style={{
          backgroundColor: t.assets.bgField,
          borderWidth: 1,
          borderColor: error ? t.sentiment.negative : t.assets.border,
          borderRadius: theme.borderRadius.s,
          paddingVertical: theme.spacing.sm + 2,
          paddingHorizontal: theme.spacing.sm,
          color: t.assets.text,
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.body,
        }}
      />
      {error && (
        <Text
          style={{
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.xs,
            color: t.sentiment.negative,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
