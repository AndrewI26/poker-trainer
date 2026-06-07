import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import type { Theme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { Divider } from "../ui/Divider";
import { StatRow } from "../ui/StatRow";

type T = Theme;

export function ProfileHeader({
  t,
  name,
  memberSince,
  rank,
  drillsCompleted,
  winRate,
}: {
  t: T;
  name: string;
  memberSince: string;
  rank: string;
  drillsCompleted: number;
  winRate: string;
}) {
  return (
    <Card t={t}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: t.assets.bgDisabled,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person-outline" size={28} color={t.assets.subtext} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: theme.fontSize.h5,
              color: t.assets.text,
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: t.assets.subtext,
            }}
          >
            Member since {memberSince}
          </Text>
        </View>
        <Badge t={t} label="Pro" variant="informative" />
      </View>
      <Divider t={t} />
      <StatRow t={t} label="Global Rank" value={rank} />
      <StatRow
        t={t}
        label="Drills Completed"
        value={String(drillsCompleted)}
        trend="up"
      />
      <StatRow t={t} label="Win Rate" value={winRate} trend="up" />
    </Card>
  );
}
