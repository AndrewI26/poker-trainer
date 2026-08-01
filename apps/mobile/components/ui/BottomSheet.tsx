import { Ionicons } from "@expo/vector-icons";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const DISMISS_DRAG_DISTANCE = 120;
const DISMISS_DRAG_VELOCITY = 0.6;

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  headerAccessory,
  children,
  footer,
  maxHeightRatio = 0.88,
  scrollable = true,
  showHandle = true,
  showCloseButton = true,
  dismissOnBackdropPress = true,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  headerAccessory?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxHeightRatio?: number;
  scrollable?: boolean;
  showHandle?: boolean;
  showCloseButton?: boolean;
  dismissOnBackdropPress?: boolean;
}) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get("window").height;

  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const wasVisible = useRef(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const animateIn = useCallback(() => {
    translateY.setValue(screenHeight);
    backdrop.setValue(0);
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        stiffness: 260,
        mass: 0.9,
        useNativeDriver: true,
      }),
      Animated.timing(backdrop, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdrop, screenHeight]);

  const animateOut = useCallback(
    (onDone: () => void) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) onDone();
      });
    },
    [translateY, backdrop, screenHeight],
  );

  useEffect(() => {
    if (visible && !wasVisible.current) {
      setMounted(true);
      animateIn();
    } else if (!visible && wasVisible.current) {
      animateOut(() => setMounted(false));
    }
    wasVisible.current = visible;
  }, [visible, animateIn, animateOut]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onMoveShouldSetPanResponderCapture: (_, gesture) =>
        gesture.dy > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(Math.max(0, gesture.dy));
      },
      onPanResponderRelease: (_, gesture) => {
        const shouldDismiss =
          gesture.dy > DISMISS_DRAG_DISTANCE ||
          gesture.vy > DISMISS_DRAG_VELOCITY;
        if (shouldDismiss) {
          onCloseRef.current();
          return;
        }
        Animated.spring(translateY, {
          toValue: 0,
          damping: 24,
          stiffness: 260,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  if (!mounted) return null;

  const hasHeader = Boolean(title || subtitle || headerAccessory);
  const Body = scrollable ? ScrollView : View;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: "#00000099",
            opacity: backdrop,
          }}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={dismissOnBackdropPress ? onClose : undefined}
          />
        </Animated.View>

        <Animated.View
          style={{
            maxHeight: screenHeight * maxHeightRatio,
            backgroundColor: t.assets.bgCardPrimary,
            borderTopLeftRadius: theme.borderRadius.xl,
            borderTopRightRadius: theme.borderRadius.xl,
            borderTopWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: t.assets.border,
            transform: [{ translateY }],
          }}
        >
          <View {...panResponder.panHandlers}>
            {showHandle && (
              <View
                style={{ alignItems: "center", paddingTop: theme.spacing.sm }}
              >
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: t.assets.strokeInactive,
                  }}
                />
              </View>
            )}

            {hasHeader && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: theme.spacing.sm,
                  paddingHorizontal: theme.spacing.md,
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.sm,
                }}
              >
                <View style={{ flex: 1 }}>
                  {title && (
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.bold,
                        fontSize: theme.fontSize.h5,
                        color: t.assets.text,
                        includeFontPadding: false,
                      }}
                    >
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.regular,
                        fontSize: theme.fontSize.sm,
                        color: t.assets.subtext,
                        includeFontPadding: false,
                        marginTop: 2,
                      }}
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
                {headerAccessory}
                {showCloseButton && (
                  <Pressable
                    onPress={onClose}
                    hitSlop={10}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: t.assets.bgCardSecondary,
                    }}
                  >
                    <Ionicons name="close" size={16} color={t.assets.subtext} />
                  </Pressable>
                )}
              </View>
            )}
          </View>

          <Body
            {...(scrollable
              ? {
                  showsVerticalScrollIndicator: false,
                  bounces: false,
                  contentContainerStyle: {
                    paddingHorizontal: theme.spacing.md,
                    paddingBottom: theme.spacing.md,
                  },
                }
              : {
                  style: {
                    paddingHorizontal: theme.spacing.md,
                    paddingBottom: theme.spacing.md,
                  },
                })}
          >
            {children}
          </Body>

          <View
            style={{
              paddingHorizontal: theme.spacing.md,
              paddingBottom: insets.bottom + theme.spacing.sm,
              paddingTop: footer ? theme.spacing.sm : 0,
              borderTopWidth: footer ? 1 : 0,
              borderTopColor: t.assets.border,
            }}
          >
            {footer}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
