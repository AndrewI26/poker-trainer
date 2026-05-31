import { View, Text } from "react-native";
import { Badge } from "../ui/Badge";
import theme from "../../theme/theme";
import type { useTheme } from "../../theme/ThemeContext";

type T = ReturnType<typeof useTheme>["t"];

export function LeaderboardRow({
	t,
	rank,
	name,
	score,
	accuracy,
	trend,
	isMe,
	last,
}: {
	t: T;
	rank: number;
	name: string;
	score: number;
	accuracy: string;
	trend: "up" | "down";
	isMe?: boolean;
	last?: boolean;
}) {
	const rankColor =
		rank === 1
			? "#e29c57"
			: rank === 2
				? t.assets.subtext
				: rank === 3
					? "#bb6e3d"
					: t.assets.strokeInactive;

	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				paddingVertical: theme.spacing.sm,
				paddingHorizontal: theme.spacing.md,
				backgroundColor: isMe ? t.assets.bgDisabled : "transparent",
				borderBottomWidth: last ? 0 : 1,
				borderBottomColor: t.assets.strokeInactive,
				gap: theme.spacing.md,
			}}
		>
			<Text
				style={{
					fontFamily: theme.fontFamily.bold,
					fontSize: theme.fontSize.body,
					color: rankColor,
					width: 24,
					textAlign: "center",
				}}
			>
				{rank}
			</Text>
			<View style={{ flex: 1 }}>
				<Text
					style={{
						fontFamily: isMe ? theme.fontFamily.bold : theme.fontFamily.regular,
						fontSize: theme.fontSize.body,
						color: t.assets.text,
					}}
				>
					{name}
					{isMe ? " (You)" : ""}
				</Text>
				<Text
					style={{
						fontFamily: theme.fontFamily.regular,
						fontSize: theme.fontSize.xs,
						color: t.assets.subtext,
					}}
				>
					Accuracy: {accuracy}
				</Text>
			</View>
			<View style={{ alignItems: "flex-end", gap: 4 }}>
				<Text
					style={{
						fontFamily: theme.fontFamily.bold,
						fontSize: theme.fontSize.sm,
						color: t.assets.text,
					}}
				>
					{score.toLocaleString()}
				</Text>
				<Badge
					t={t}
					label={trend === "up" ? "↑" : "↓"}
					variant={trend === "up" ? "positive" : "negative"}
				/>
			</View>
		</View>
	);
}
