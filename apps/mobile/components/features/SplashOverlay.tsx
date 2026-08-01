import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function SplashOverlay({ onFinish }: { onFinish: () => void }) {
  const { t } = useTheme();
  const accent = t.accent.icons.purpleContain;

  const logo = useRef(new Animated.Value(0)).current;
  const chip = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.timing(logo, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(chip, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(flip, {
        toValue: 1,
        duration: 500,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) onFinish();
    });

    return () => animation.stop();
  }, [logo, chip, flip, onFinish]);

  const logoY = logo.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });
  const scaleX = flip.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0, 1, 0, 1],
  });

  return (
    <View style={[styles.container, { backgroundColor: t.assets.bgPage }]}>
      <Animated.View
        style={[
          styles.wordmark,
          { opacity: logo, transform: [{ translateY: logoY }] },
        ]}
      >
        <Text style={[styles.title, { color: t.assets.text }]}>EDGE</Text>
        <Text style={[styles.subtitle, { color: accent }]}>POKER TRAINER</Text>
      </Animated.View>

      <Animated.View style={{ opacity: chip, transform: [{ scaleX }] }}>
        <MaterialCommunityIcons name="poker-chip" size={64} color={accent} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: 56,
    letterSpacing: 6,
    includeFontPadding: false,
  },
  subtitle: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.sm,
    letterSpacing: 3,
    includeFontPadding: false,
    marginTop: theme.spacing.xs,
  },
});
