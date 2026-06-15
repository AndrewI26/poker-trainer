import { View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function Divider() {
  const { t } = useTheme();
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
