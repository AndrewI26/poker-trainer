import { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function ResultCard({
  verdict,
  explanation,
  recommendedActionLabel,
  extraLines,
  verdictColor,
  verdictBg,
}: {
  verdict: string;
  explanation: string;
  recommendedActionLabel: string;
  extraLines?: string[];
  verdictColor: string;
  verdictBg: string;
}) {
  const { t } = useTheme();
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    translateY.setValue(40);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, opacity]);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: verdictBg,
          borderRadius: theme.borderRadius.m,
          borderWidth: 1,
          borderColor: verdictColor,
          padding: theme.spacing.md,
          marginTop: theme.spacing.md,
          marginHorizontal: theme.spacing.md,
        },
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.h5,
          color: verdictColor,
          marginBottom: theme.spacing.xs,
          textTransform: "uppercase",
        }}
      >
        {verdict}
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.body,
          color: t.assets.text,
          lineHeight: theme.fontSize.body * theme.lineHeight.body,
        }}
      >
        {explanation}
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.sm,
          color: t.assets.subtext,
          marginTop: theme.spacing.sm,
        }}
      >
        Best play: {recommendedActionLabel}
      </Text>
      {extraLines?.map((line) => (
        <Text
          key={line}
          style={{
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.sm,
            color: t.assets.subtext,
            marginTop: theme.spacing.xs,
          }}
        >
          {line}
        </Text>
      ))}
    </Animated.View>
  );
}
