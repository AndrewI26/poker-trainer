import { View, type ViewStyle } from "react-native";
import theme from "../../theme/theme";
import type { useTheme } from "../../theme/ThemeContext";

type T = ReturnType<typeof useTheme>["t"];

export function Card({
	t,
	children,
	style,
	variant = "primary",
}: {
	t: T;
	children: React.ReactNode;
	style?: ViewStyle;
	variant?: "primary" | "secondary";
}) {
	return (
		<View
			style={[
				{
					backgroundColor:
						variant === "secondary"
							? t.assets.bgCardSecondary
							: t.assets.bgCardPrimary,
					borderRadius: theme.borderRadius.m,
					borderWidth: 1,
					borderColor: t.assets.border,
					padding: theme.spacing.md,
					marginBottom: theme.spacing.sm,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}
