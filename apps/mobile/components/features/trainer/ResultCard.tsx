import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function ResultCard({
  visible,
  onRequestClose,
  verdict,
  explanation,
  recommendedActionLabel,
  extraLines,
  verdictColor,
}: {
  visible: boolean;
  onRequestClose: () => void;
  verdict: string;
  explanation: string;
  recommendedActionLabel: string;
  extraLines?: string[];
  verdictColor: string;
}) {
  const { t } = useTheme();
  const translateY = useRef(new Animated.Value(40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
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
  }, [visible, translateY, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable onPress={onRequestClose} style={{ flex: 1 }}>
        <BlurView
          intensity={40}
          tint="dark"
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: theme.spacing.md,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: "100%" }}
          >
            <Animated.View
              style={[
                {
                  backgroundColor: t.assets.bgCardSecondary,
                  borderRadius: theme.borderRadius.m,
                  borderWidth: 1,
                  borderColor: t.assets.border,
                  padding: theme.spacing.md,
                },
                { opacity, transform: [{ translateY }] },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: theme.spacing.xs,
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    fontSize: theme.fontSize.h5,
                    color: verdictColor,
                    textTransform: "uppercase",
                  }}
                >
                  {verdict}
                </Text>
                <Pressable onPress={onRequestClose} hitSlop={8}>
                  <Ionicons name="close" size={20} color={t.assets.subtext} />
                </Pressable>
              </View>
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
              <Text
                style={{
                  fontFamily: theme.fontFamily.regular,
                  fontSize: theme.fontSize.xs,
                  color: t.assets.subtext,
                  marginTop: theme.spacing.md,
                  textAlign: "center",
                }}
              >
                Tap outside to view the board
              </Text>
            </Animated.View>
          </Pressable>
        </BlurView>
      </Pressable>
    </Modal>
  );
}
