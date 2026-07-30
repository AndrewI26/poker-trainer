import type {
  PostflopPosition,
  PostflopStreetAction,
  PreflopAction,
} from "@poker-trainer/poker-engine";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";
import { Connector, Dot, TimelineShell } from "./TimelinePrimitives";

function preflopDotColors(
  action: PreflopAction,
  revealed: boolean,
  t: ReturnType<typeof useTheme>["t"],
): { text: string; bg: string; border: string } {
  if (!revealed)
    return {
      text: t.assets.subtext,
      bg: t.assets.bgCardSecondary,
      border: t.assets.strokeInactive,
    };
  if (action.action === "fold")
    return {
      text: t.assets.subtext,
      bg: t.assets.bgDisabled,
      border: t.assets.strokeInactive,
    };
  if (action.action === "raise" || action.action === "reraise")
    return {
      text: t.sentiment.positive,
      bg: t.sentiment.positiveBg,
      border: t.sentiment.positive,
    };
  return {
    text: t.accent.blue,
    bg: theme.palette.blue[800],
    border: t.accent.blue,
  };
}

function postflopDotColors(
  action: PostflopStreetAction,
  revealed: boolean,
  t: ReturnType<typeof useTheme>["t"],
): { text: string; bg: string; border: string } {
  if (!revealed)
    return {
      text: t.assets.subtext,
      bg: t.assets.bgCardSecondary,
      border: t.assets.strokeInactive,
    };
  if (action.type === "bet" || action.type === "raise")
    return {
      text: t.sentiment.positive,
      bg: t.sentiment.positiveBg,
      border: t.sentiment.positive,
    };
  if (action.type === "call")
    return {
      text: t.accent.blue,
      bg: theme.palette.blue[800],
      border: t.accent.blue,
    };
  return {
    text: t.assets.subtext,
    bg: t.assets.bgDisabled,
    border: t.assets.strokeInactive,
  };
}

export function HandTimeline({
  position,
  revealedCount,
  onSeek,
}: {
  position: PostflopPosition;
  revealedCount: number;
  onSeek: (count: number) => void;
}) {
  const { t } = useTheme();
  const { preflopActions, actionHistory, heroPosition } = position;
  const boardStep = preflopActions.length + 1;
  const totalSteps = boardStep + actionHistory.length;
  const boardRevealed = revealedCount >= boardStep;

  const canBack = revealedCount > 0;
  const canForward = revealedCount < totalSteps;

  return (
    <TimelineShell
      canBack={canBack}
      canForward={canForward}
      onBack={() => canBack && onSeek(revealedCount - 1)}
      onForward={() => canForward && onSeek(revealedCount + 1)}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 4,
        }}
      >
        {preflopActions.map((action, i) => {
          const revealed = i < revealedCount;
          const active = i === revealedCount - 1;
          const colors = preflopDotColors(action, revealed, t);
          const size = active ? 28 : 22;
          const isHero = action.position === heroPosition;
          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: action order is stable within a position
              key={`pre-${i}`}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              {i > 0 && (
                <Connector
                  color={revealed ? t.assets.subtext : t.assets.strokeInactive}
                />
              )}
              <Pressable onPress={() => onSeek(i + 1)} hitSlop={8}>
                <Dot
                  size={size}
                  bg={colors.bg}
                  border={colors.border}
                  borderWidth={active ? 2 : 1}
                  label={action.position}
                  labelColor={isHero ? t.accent.blue : colors.text}
                  folded={revealed && action.action === "fold"}
                />
              </Pressable>
            </View>
          );
        })}

        {/* Board marker */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {preflopActions.length > 0 && (
            <Connector
              color={boardRevealed ? t.assets.subtext : t.assets.strokeInactive}
            />
          )}
          <Pressable onPress={() => onSeek(boardStep)} hitSlop={8}>
            <View
              style={{
                paddingHorizontal: 5,
                paddingVertical: 3,
                borderRadius: theme.borderRadius.xs,
                backgroundColor: boardRevealed
                  ? theme.palette.gold[800]
                  : t.assets.bgCardSecondary,
                borderWidth: revealedCount === boardStep ? 2 : 1,
                borderColor: boardRevealed
                  ? theme.palette.gold[500]
                  : t.assets.strokeInactive,
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: 8,
                  color: boardRevealed
                    ? theme.palette.gold[400]
                    : t.assets.subtext,
                  includeFontPadding: false,
                  lineHeight: 8,
                  paddingTop: 1,
                }}
              >
                FLOP
              </Text>
            </View>
          </Pressable>
        </View>

        {actionHistory.map((action, i) => {
          const stepIdx = boardStep + 1 + i;
          const revealed = revealedCount >= stepIdx;
          const active = revealedCount === stepIdx;
          const colors = postflopDotColors(action, revealed, t);
          const size = active ? 28 : 22;
          const isHero = action.actor === heroPosition;
          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: action order is stable within a position
              key={`post-${i}`}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Connector
                color={revealed ? t.assets.subtext : t.assets.strokeInactive}
              />
              <Pressable onPress={() => onSeek(stepIdx)} hitSlop={8}>
                <Dot
                  size={size}
                  bg={colors.bg}
                  border={colors.border}
                  borderWidth={active ? 2 : 1}
                  label={action.actor}
                  labelColor={isHero ? t.accent.blue : colors.text}
                  folded={revealed && action.type === "fold"}
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </TimelineShell>
  );
}
