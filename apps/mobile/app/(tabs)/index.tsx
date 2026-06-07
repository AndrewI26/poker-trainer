import { useRouter } from "expo-router";
import { Text } from "react-native";
import { DrillCard } from "@/components/features/DrillCard";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Card, Divider, IconCard, Label, StatRow } from "@/components/ui";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export default function TrainScreen() {
  const { t } = useTheme();
  const router = useRouter();

  return (
    <ScreenWrapper>
      <IconCard
        icon="albums-outline"
        iconBg={theme.palette.vibrantGreen[800]}
        iconColor={theme.palette.vibrantGreen[300]}
        heading="Preflop Trainer"
        body="Practice preflop decisions and get instant feedback on every hand."
        onPress={() => router.push("/train/preflop")}
      />
      <Card>
        <Label>Today's Progress</Label>
        <Text
          style={{
            fontSize: theme.fontSize.h5,
            fontFamily: theme.fontFamily.bold,
            color: t.assets.text,
            marginBottom: theme.spacing.xs,
          }}
        >
          Keep it up 🔥
        </Text>
        <Text
          style={{
            fontSize: theme.fontSize.body,
            fontFamily: theme.fontFamily.regular,
            color: t.assets.subtext,
            lineHeight: theme.fontSize.body * theme.lineHeight.body,
          }}
        >
          You've completed 3 drills today. 2 more to hit your daily goal.
        </Text>
        <Divider />
        <StatRow label="Accuracy" value="74%" trend="up" />
        <StatRow label="Streak" value="5 days" trend="up" />
        <StatRow label="Avg. Time" value="2m 14s" />
      </Card>

      <Label>Drills</Label>
      <DrillCard
        name="Preflop Ranges"
        difficulty="Beginner"
        progress={12}
        total={20}
      />
      <DrillCard
        name="Pot Odds"
        difficulty="Intermediate"
        progress={4}
        total={10}
      />
      <DrillCard
        name="3-Bet Spots"
        difficulty="Advanced"
        progress={1}
        total={15}
      />
    </ScreenWrapper>
  );
}
