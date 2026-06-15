import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Easing, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import theme from "@/theme/theme";

const ACCENT = "#a78bfa";
const BG = "#050f08";

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(12)).current;
  const chipOpacity = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(chipOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(100),
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.delay(500),
    ]).start(() => {
      router.replace("/(tabs)");
    });
  }, [router, logoOpacity, logoY, chipOpacity, flipAnim]);

  const scaleX = flipAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [1, 0, 1, 0, 1],
  });

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BG,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: insets.bottom,
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity: logoOpacity,
          transform: [{ translateY: logoY }],
          marginBottom: 32,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: 56,
            color: "#ffffff",
            letterSpacing: 6,
            includeFontPadding: false,
            marginTop: 8,
          }}
        >
          EDGE
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.sm,
            color: ACCENT,
            letterSpacing: 3,
            includeFontPadding: false,
            marginTop: 4,
          }}
        >
          POKER TRAINER
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: chipOpacity,
          transform: [{ scaleX }],
        }}
      >
        <MaterialCommunityIcons name="poker-chip" size={64} color={ACCENT} />
      </Animated.View>
    </View>
  );
}
