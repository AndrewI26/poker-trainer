import { Text, View } from "react-native";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { Card, Label, Divider, StatRow } from "../../components/ui";
import { DrillCard } from "../../components/features/DrillCard";
import { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

export default function TrainScreen() {
	const { t } = useTheme();

	return (
		<ScreenWrapper>
			<Card t={t}>
				<Label t={t}>Today's Progress</Label>
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
				<Divider t={t} />
				<StatRow t={t} label="Accuracy" value="74%" trend="up" />
				<StatRow t={t} label="Streak" value="5 days" trend="up" />
				<StatRow t={t} label="Avg. Time" value="2m 14s" />
			</Card>

			<Label t={t}>Drills</Label>
			<DrillCard
				t={t}
				name="Preflop Ranges"
				difficulty="Beginner"
				progress={12}
				total={20}
			/>
			<DrillCard
				t={t}
				name="Pot Odds"
				difficulty="Intermediate"
				progress={4}
				total={10}
			/>
			<DrillCard
				t={t}
				name="3-Bet Spots"
				difficulty="Advanced"
				progress={1}
				total={15}
			/>
		</ScreenWrapper>
	);
}
