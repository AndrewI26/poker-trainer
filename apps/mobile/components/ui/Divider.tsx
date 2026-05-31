import { View } from "react-native";
import theme from "../../theme/theme";
import type { useTheme } from "../../theme/ThemeContext";

type T = ReturnType<typeof useTheme>["t"];

export function Divider({ t }: { t: T }) {
	return (
		<View
			style={{
				height: 1,
				backgroundColor: t.assets.strokeInactive,
				marginVertical: theme.spacing.sm,
			}}
		/>
	);
}
