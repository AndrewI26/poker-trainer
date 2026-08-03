import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function ProgressBar({ progress }: { progress: number }) {
  const { t } = useTheme();
  const width = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [progress, width]);

  return (
    <View
      style={{
        height: 4,
        borderRadius: theme.borderRadius.xxs,
        backgroundColor: t.assets.bgDisabled,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={{
          height: "100%",
          borderRadius: theme.borderRadius.xxs,
          backgroundColor: t.accent.icons.purpleContain,
          width: width.interpolate({
            inputRange: [0, 1],
            outputRange: ["0%", "100%"],
          }),
        }}
      />
    </View>
  );
}
