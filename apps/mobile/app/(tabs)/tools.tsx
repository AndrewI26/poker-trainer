import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import {
	Card,
	Label,
	Heading,
	Body,
	Badge,
	Button,
	Divider,
	IconCard,
} from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

const DROPDOWN_OPTIONS = ["Texas Hold'em", "Omaha", "Short Deck", "PLO5"];

export default function ToolsScreen() {
	const { t, colorScheme } = useTheme();
	const isDark = colorScheme === "dark";
	const [selected, setSelected] = useState(DROPDOWN_OPTIONS[0]);
	const [open, setOpen] = useState(false);
	const [toggled, setToggled] = useState(false);

	return (
		<ScreenWrapper>
			<Label t={t}>Icon Cards</Label>
			<IconCard
				t={t}
				icon="barbell-outline"
				iconBg={
					isDark
						? theme.palette.vibrantGreen[800]
						: theme.palette.vibrantGreen[100]
				}
				iconColor={
					isDark
						? theme.palette.vibrantGreen[300]
						: theme.palette.vibrantGreen[600]
				}
				heading="Daily Drills"
				body="Complete your daily drills to improve your preflop ranges and decision making."
			/>
			<IconCard
				t={t}
				icon="trophy-outline"
				iconBg={isDark ? theme.palette.blue[800] : theme.palette.blue[100]}
				iconColor={isDark ? theme.palette.blue[300] : theme.palette.blue[600]}
				heading="Leaderboard"
				body="You're ranked #4 globally this week. Keep training to reach the top."
			/>
			<IconCard
				t={t}
				icon="warning-outline"
				iconBg={isDark ? theme.palette.red[800] : theme.palette.red[100]}
				iconColor={isDark ? theme.palette.red[300] : theme.palette.red[500]}
				heading="Weak Spots"
				body="Your 3-bet calling range needs work. Focus on these spots to plug leaks."
			/>
			<IconCard
				t={t}
				icon="flash-outline"
				iconBg={isDark ? theme.palette.purple[800] : theme.palette.purple[100]}
				iconColor={
					isDark ? theme.palette.purple[300] : theme.palette.purple[600]
				}
				heading="Quick Review"
				body="Revisit hands from your last session and identify areas for improvement."
			/>

			<Label t={t}>Cards</Label>
			<Card t={t} variant="primary">
				<Heading t={t}>Primary Card</Heading>
				<Body t={t}>Used for the main content surfaces in the app.</Body>
			</Card>
			<Card t={t} variant="secondary">
				<Heading t={t}>Secondary Card</Heading>
				<Body t={t}>
					Slightly darker — used for nested or supporting content.
				</Body>
			</Card>
			<Card t={t} variant="primary">
				<Heading t={t}>Nested Example</Heading>
				<Body t={t}>
					A primary card can contain a secondary card inside it.
				</Body>
				<Card
					t={t}
					variant="secondary"
					style={{ marginTop: theme.spacing.sm, marginBottom: 0 }}
				>
					<Text
						style={{
							fontFamily: theme.fontFamily.regular,
							fontSize: theme.fontSize.sm,
							color: t.assets.subtext,
						}}
					>
						Secondary card nested inside a primary one.
					</Text>
				</Card>
			</Card>

			<Label t={t}>Buttons</Label>
			<Card t={t}>
				<View style={{ gap: theme.spacing.sm }}>
					<Button t={t} label="Primary Button" variant="primary" />
					<Button t={t} label="Secondary Button" variant="secondary" />
					<Button t={t} label="Tertiary Button" variant="tertiary" />
					<Button t={t} label="Warning Button" variant="warning" />
					<Button t={t} label="Disabled" variant="primary" disabled />
				</View>
			</Card>

			<Label t={t}>Badges</Label>
			<Card t={t}>
				<View
					style={{
						flexDirection: "row",
						flexWrap: "wrap",
						gap: theme.spacing.sm,
					}}
				>
					<Badge t={t} label="Positive" variant="positive" />
					<Badge t={t} label="Negative" variant="negative" />
					<Badge t={t} label="Informative" variant="informative" />
					<Badge t={t} label="Neutral" variant="neutral" />
				</View>
			</Card>

			<Label t={t}>Dropdown</Label>
			<Card t={t}>
				<Label t={t}>Game Type</Label>
				<Pressable
					onPress={() => setOpen((o) => !o)}
					style={{
						flexDirection: "row",
						justifyContent: "space-between",
						alignItems: "center",
						backgroundColor: t.assets.bgCardPrimary,
						borderRadius: theme.borderRadius.s,
						borderWidth: 1,
						borderColor: open ? t.assets.strokeActive : t.assets.strokeInactive,
						paddingVertical: theme.spacing.sm,
						paddingHorizontal: theme.spacing.md,
					}}
				>
					<Text
						style={{
							fontFamily: theme.fontFamily.regular,
							fontSize: theme.fontSize.body,
							color: t.assets.text,
						}}
					>
						{selected}
					</Text>
					<Text style={{ color: t.assets.subtext }}>{open ? "▲" : "▼"}</Text>
				</Pressable>
				{open && (
					<View
						style={{
							backgroundColor: t.assets.bgCardSecondary,
							borderRadius: theme.borderRadius.s,
							borderWidth: 1,
							borderColor: t.assets.strokeInactive,
							marginTop: theme.spacing.xs,
							overflow: "hidden",
						}}
					>
						{DROPDOWN_OPTIONS.map((opt, i) => (
							<Pressable
								key={opt}
								onPress={() => {
									setSelected(opt);
									setOpen(false);
								}}
								style={({ pressed }) => ({
									paddingVertical: theme.spacing.sm,
									paddingHorizontal: theme.spacing.md,
									backgroundColor:
										pressed || opt === selected
											? t.assets.bgDisabled
											: "transparent",
									borderBottomWidth: i < DROPDOWN_OPTIONS.length - 1 ? 1 : 0,
									borderBottomColor: t.assets.strokeInactive,
								})}
							>
								<Text
									style={{
										fontFamily:
											opt === selected
												? theme.fontFamily.bold
												: theme.fontFamily.regular,
										fontSize: theme.fontSize.body,
										color: opt === selected ? t.assets.text : t.assets.subtext,
									}}
								>
									{opt}
								</Text>
							</Pressable>
						))}
					</View>
				)}
			</Card>

			<Label t={t}>Toggle</Label>
			<Card t={t}>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<View>
						<Text
							style={{
								fontFamily: theme.fontFamily.bold,
								fontSize: theme.fontSize.body,
								color: t.assets.text,
							}}
						>
							Show percentages
						</Text>
						<Text
							style={{
								fontFamily: theme.fontFamily.regular,
								fontSize: theme.fontSize.sm,
								color: t.assets.subtext,
							}}
						>
							Display ranges as %
						</Text>
					</View>
					<Pressable
						onPress={() => setToggled((v) => !v)}
						style={{
							width: 48,
							height: 28,
							borderRadius: 14,
							backgroundColor: toggled
								? t.accent.blue
								: t.assets.bgCardSecondary,
							justifyContent: "center",
							paddingHorizontal: 3,
						}}
					>
						<View
							style={{
								width: 22,
								height: 22,
								borderRadius: 11,
								backgroundColor: t.assets.bgCardPrimary,
								alignSelf: toggled ? "flex-end" : "flex-start",
							}}
						/>
					</Pressable>
				</View>
			</Card>

			<Label t={t}>Typography</Label>
			<Card t={t}>
				{(["h1", "h2", "h3", "h4", "h5", "body", "sm", "xs"] as const).map(
					(size) => (
						<View key={size} style={{ marginBottom: theme.spacing.xs }}>
							<Text
								style={{
									fontFamily: theme.fontFamily.bold,
									fontSize: theme.fontSize[size],
									color: t.assets.text,
								}}
							>
								{size.toUpperCase()} — League Spartan
							</Text>
						</View>
					),
				)}
			</Card>
		</ScreenWrapper>
	);
}
