import { Text } from "react-native";
import type { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = ReturnType<typeof useTheme>["t"];

export function Label({ t, children }: { t: T; children: string }) {
  return (
    <Text
      style={{
        fontSize: theme.fontSize.xs,
        fontFamily: theme.fontFamily.regular,
        color: t.assets.subtext,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: theme.spacing.xs,
      }}
    >
      {children}
    </Text>
  );
}

export function Heading({ t, children }: { t: T; children: string }) {
  return (
    <Text
      style={{
        fontSize: theme.fontSize.h5,
        fontFamily: theme.fontFamily.bold,
        color: t.assets.text,
        marginBottom: theme.spacing.xs,
      }}
    >
      {children}
    </Text>
  );
}

export function Body({ t, children }: { t: T; children: string }) {
  return (
    <Text
      style={{
        fontSize: theme.fontSize.body,
        fontFamily: theme.fontFamily.regular,
        color: t.assets.subtext,
        lineHeight: theme.fontSize.body * theme.lineHeight.body,
      }}
    >
      {children}
    </Text>
  );
}
