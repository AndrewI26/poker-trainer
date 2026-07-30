import type { PreflopAction, TableScenario } from "@poker-trainer/poker-engine";
import { Pressable, ScrollView, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";
import { Connector, Dot, TimelineShell } from "./TimelinePrimitives";

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
    <TimelineShell
      canBack={canBack}
      canForward={canForward}
      onBack={() => {
        if (!canBack) return;
        if (revealedCount > 0) onSeek(revealedCount - 1, 2);
        else onSeek(0, blindRevealedCount - 1);
      }}
      onForward={() => {
        if (!canForward) return;
        if (blindRevealedCount < blindCount)
          onSeek(revealedCount, blindRevealedCount + 1);
        else onSeek(revealedCount + 1, blindCount);
      }}
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
          const dotBorder = revealed
            ? action.action === "fold"
              ? t.assets.strokeInactive
              : badgeColors.text
            : t.assets.strokeInactive;

          return (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: action order is stable within a scenario
              key={`${action.position}-${i}`}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              {i > 0 && (
                <Connector
                  color={revealed ? badgeColors.text : t.assets.strokeInactive}
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
                <Dot
                  size={active ? 28 : 22}
                  bg={
                    revealed
                      ? action.action === "fold"
                        ? t.assets.bgDisabled
                        : badgeColors.bg
                      : t.assets.bgCardSecondary
                  }
                  border={dotBorder}
                  borderWidth={active ? 2 : 1}
                  label={action.position}
                  labelColor={
                    revealed
                      ? action.action === "fold"
                        ? t.assets.strokeInactive
                        : badgeColors.text
                      : t.assets.subtext
                  }
                  folded={revealed && action.action === "fold"}
                />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </TimelineShell>
  );
}
