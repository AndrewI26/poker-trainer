import { Text, View } from "react-native";
import type { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

type T = ReturnType<typeof useTheme>["t"];
type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export function DrillCard({
  t,
  name,
  difficulty,
  progress,
  total,
}: {
  t: T;
  name: string;
  difficulty: Difficulty;
  progress: number;
  total: number;
}) {
  const badgeVariant =
    difficulty === "Beginner"
      ? "positive"
      : difficulty === "Intermediate"
        ? "informative"
        : "negative";

  return (
    <Card t={t}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: theme.spacing.sm,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.h5,
            color: t.assets.text,
            flex: 1,
            marginRight: theme.spacing.sm,
          }}
        >
          {name}
        </Text>
        <Badge t={t} label={difficulty} variant={badgeVariant} />
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.sm,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 4,
            backgroundColor: t.assets.strokeInactive,
            borderRadius: theme.borderRadius.xxl,
          }}
        >
          <View
            style={{
              width: `${(progress / total) * 100}%`,
              height: 4,
              backgroundColor: t.accent.blue,
              borderRadius: theme.borderRadius.xxl,
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.xs,
            color: t.assets.subtext,
          }}
        >
          {progress}/{total}
        </Text>
      </View>
    </Card>
  );
}
