import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function Dot({
  size,
  bg,
  border,
  borderWidth,
  label,
  labelColor,
  folded,
}: {
  size: number;
  bg: string;
  border: string;
  borderWidth: number;
  label: string;
  labelColor: string;
  folded?: boolean;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth,
        borderColor: border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: 8,
          color: labelColor,
          textAlign: "center",
          includeFontPadding: false,
          lineHeight: 8,
          paddingTop: 2,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
      {folded && (
        <View
          style={{
            position: "absolute",
            width: size,
            height: 1,
            backgroundColor: t.assets.strokeInactive,
            opacity: 0.6,
            transform: [{ rotate: "-45deg" }],
          }}
        />
      )}
    </View>
  );
}

export function Connector({
  color,
  opacity = 0.4,
}: {
  color: string;
  opacity?: number;
}) {
  return (
    <View
      style={{
        width: 8,
        height: 1,
        backgroundColor: color,
        opacity,
      }}
    />
  );
}

export function TimelineShell({
  canBack,
  canForward,
  onBack,
  onForward,
  children,
}: {
  canBack: boolean;
  canForward: boolean;
  onBack: () => void;
  onForward: () => void;
  children: React.ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 12,
      }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={8}
        style={{ opacity: canBack ? 1 : 0.25 }}
      >
        <Ionicons name="chevron-back" size={18} color={t.assets.subtext} />
      </Pressable>

      {children}

      <Pressable
        onPress={onForward}
        hitSlop={8}
        style={{ opacity: canForward ? 1 : 0.25 }}
      >
        <Ionicons name="chevron-forward" size={18} color={t.assets.subtext} />
      </Pressable>
    </View>
  );
}
