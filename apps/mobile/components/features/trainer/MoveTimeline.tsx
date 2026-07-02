import { Ionicons } from "@expo/vector-icons";
import type { PreflopAction, TableScenario } from "@poker-trainer/poker-engine";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

function actionBadgeColor(
  action: PreflopAction["action"],
  t: ReturnType<typeof useTheme>["t"],
) {
  if (action === "fold")
    return { text: t.assets.subtext, bg: t.assets.bgDisabled };
  if (action === "limp")
    return { text: t.accent.blue, bg: theme.palette.blue[800] };
  if (action === "raise" || action === "reraise")
    return { text: t.sentiment.positive, bg: t.sentiment.positiveBg };
  if (action === "allin")
    return { text: theme.palette.gold[500], bg: theme.palette.gold[800] };
  return { text: t.assets.text, bg: t.assets.bgCardPrimary };
}

export function MoveTimeline({
  actions,
  scenario,
  revealedCount,
  blindRevealedCount,
  onSeek,
  heroAction,
}: {
  actions: PreflopAction[];
  scenario: TableScenario;
  revealedCount: number;
  blindRevealedCount: number;
  onSeek: (index: number, blindRevealedCount?: number) => void;
  heroAction?: PreflopAction | null;
}) {
  const { t } = useTheme();
  if (actions.length === 0 && !heroAction) return null;

  const sbSeat = scenario.seats.find((s) => s.position === "SB");
  const bbSeat = scenario.seats.find((s) => s.position === "BB");
  const blindActions: PreflopAction[] = [
    ...(sbSeat
      ? [
          {
            position: "SB" as const,
            action: "limp" as const,
            sizeBB:
              scenario.blindStructure.smallBlind /
              scenario.blindStructure.bigBlind,
          },
        ]
      : []),
    ...(bbSeat
      ? [{ position: "BB" as const, action: "limp" as const, sizeBB: 1 }]
      : []),
  ];
  const allActions = [
    ...blindActions,
    ...actions,
    ...(heroAction ? [heroAction] : []),
  ];
  const blindCount = blindActions.length;
  const totalActionSteps = actions.length + (heroAction ? 1 : 0);

  const globalIndex = blindRevealedCount + revealedCount;
  const canBack = globalIndex > 1;
  const canForward =
    blindRevealedCount < blindCount || revealedCount < totalActionSteps;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: 12,
      }}
    >
      <Pressable
        onPress={() => {
          if (!canBack) return;
          if (revealedCount > 0) onSeek(revealedCount - 1, 2);
          else onSeek(0, blindRevealedCount - 1);
        }}
        hitSlop={8}
        style={{ opacity: canBack ? 1 : 0.25 }}
      >
        <Ionicons name="chevron-back" size={18} color={t.assets.subtext} />
      </Pressable>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {allActions.map((action, i) => {
          const isBlind = i < blindCount;
          const actionIndex = i - blindCount;
          const revealed = isBlind
            ? i < blindRevealedCount
            : actionIndex < revealedCount;
          const active = isBlind
            ? i === blindRevealedCount - 1 && revealedCount === 0
            : actionIndex === revealedCount - 1;
          const badgeColors = actionBadgeColor(action.action, t);

          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: action order is stable within a scenario
              key={`${action.position}-${i}`}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              {i > 0 && (
                <View
                  style={{
                    width: 8,
                    height: 1,
                    backgroundColor: revealed
                      ? badgeColors.text
                      : t.assets.strokeInactive,
                    opacity: 0.4,
                  }}
                />
              )}
              <Pressable
                onPress={() =>
                  isBlind ? onSeek(0, i + 1) : onSeek(i - blindCount + 1, 2)
                }
                hitSlop={8}
                style={{
                  width: 28,
                  height: 28,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: active ? 28 : 22,
                    height: active ? 28 : 22,
                    borderRadius: 14,
                    backgroundColor: revealed
                      ? action.action === "fold"
                        ? t.assets.bgDisabled
                        : badgeColors.bg
                      : t.assets.bgCardSecondary,
                    borderWidth: active ? 2 : 1,
                    borderColor: revealed
                      ? action.action === "fold"
                        ? t.assets.strokeInactive
                        : badgeColors.text
                      : t.assets.strokeInactive,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: theme.fontFamily.bold,
                      fontSize: 8,
                      color: revealed
                        ? action.action === "fold"
                          ? t.assets.strokeInactive
                          : badgeColors.text
                        : t.assets.subtext,
                      textAlign: "center",
                      includeFontPadding: false,
                      lineHeight: 8,
                      paddingTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {action.position}
                  </Text>
                  {revealed && action.action === "fold" && (
                    <View
                      style={{
                        position: "absolute",
                        width: active ? 28 : 22,
                        height: 1,
                        backgroundColor: t.assets.strokeInactive,
                        opacity: 0.6,
                        transform: [{ rotate: "-45deg" }],
                      }}
                    />
                  )}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={() => {
          if (!canForward) return;
          if (blindRevealedCount < blindCount)
            onSeek(revealedCount, blindRevealedCount + 1);
          else onSeek(revealedCount + 1, blindCount);
        }}
        hitSlop={8}
        style={{ opacity: canForward ? 1 : 0.25 }}
      >
        <Ionicons name="chevron-forward" size={18} color={t.assets.subtext} />
      </Pressable>
    </View>
  );
}
