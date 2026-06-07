import { View } from "react-native";
import type { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = ReturnType<typeof useTheme>["t"];

export function Divider({ t }: { t: T }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: t.assets.strokeInactive,
        marginVertical: theme.spacing.sm,
      }}
    />
  );
}
