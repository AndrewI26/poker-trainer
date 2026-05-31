import { ScrollView, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

export function ScreenWrapper({
	children,
	scroll = true,
	style,
}: {
	children: React.ReactNode;
	scroll?: boolean;
	style?: ViewStyle;
}) {
	const { t } = useTheme();

	return (
		<SafeAreaView
			edges={["left", "right"]}
			style={{ flex: 1, backgroundColor: t.assets.bgPage }}
		>
			{scroll ? (
				<ScrollView
					contentContainerStyle={[
						{ padding: theme.spacing.md, paddingBottom: theme.spacing.xl },
						style,
					]}
				>
					{children}
				</ScrollView>
			) : (
				children
			)}
		</SafeAreaView>
	);
}
