import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { StatRow } from "@/components/ui/StatRow";

export function ProfileHeader({
  name,
  memberSince,
  rank,
  drillsCompleted,
  winRate,
}: {
  name: string;
  memberSince: string;
  rank: string;
  drillsCompleted: number;
  winRate: string;
}) {
  const { t } = useTheme();
  return (
    <Card>
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
        <Badge label="Pro" variant="informative" />
      </View>
      <Divider />
      <StatRow label="Global Rank" value={rank} />
      <StatRow
        label="Drills Completed"
        value={String(drillsCompleted)}
        trend="up"
      />
      <StatRow label="Win Rate" value={winRate} trend="up" />
    </Card>
  );
}
