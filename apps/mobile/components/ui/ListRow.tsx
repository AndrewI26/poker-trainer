import { Text, View } from "react-native";
import type { Theme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

type T = Theme;

export function ListRow({
  t,
  label,
  sublabel,
  right,
  last,
}: {
  t: T;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.assets.strokeInactive,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.body,
            color: t.assets.text,
          }}
        >
          {label}
        </Text>
        {sublabel && (
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: t.assets.subtext,
              marginTop: 2,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}
