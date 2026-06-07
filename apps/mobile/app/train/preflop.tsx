import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ACTION_ORDER_BY_SIZE,
  type Decision,
  type EvaluationResult,
  evaluateDecision,
  generateScenario,
  type HoleCards,
  type PlayerSeat,
  type PreflopAction,
  type PreflopScenario,
  type Suit,
} from "@poker-trainer/poker-engine";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const TABLE_GREEN = "#041209";
const TABLE_BORDER = "#0f2215";
const TABLE_PADDING = 16;
const TOKEN_SIZE = 48;
const CARDS_REVEAL_DELAY_MS = 500;

function suitColor(suit: Suit) {
  if (suit === "hearts" || suit === "diamonds") return "#cc0000";
  return "#111111";
}

function suitIcon(suit: Suit): keyof typeof MaterialCommunityIcons.glyphMap {
  if (suit === "hearts") return "cards-heart";
  if (suit === "diamonds") return "cards-diamond";
  if (suit === "clubs") return "cards-club";
  return "cards-spade";
}

function decisionLabel(action: Decision): string {
  if (action.type === "fold") return "Fold";
  if (action.type === "call") return "Call";
  if (action.type === "raise") return `Raise to ${action.sizeBB}BB`;
  return "All-in";
}

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

function actionBadgeLabel(a: PreflopAction): string {
  if (a.action === "fold") return "Fold";
  if (a.action === "limp") {
    const size = a.sizeBB ?? 1;
    return size <= 1 ? `Post ${size}BB` : `Call ${size}BB`;
  }
  if (a.action === "raise") return `Raise ${a.sizeBB}BB`;
  if (a.action === "reraise") return `3-Bet ${a.sizeBB}BB`;
  if (a.action === "allin") return "All-in";
  return a.action;
}

function ChipBet({ action }: { action: PreflopAction }) {
  if (action.action === "fold" || action.sizeBB == null) return null;
  const amount = action.sizeBB;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        marginTop: 4,
      }}
    >
      <View style={{ width: 16, height: 20, justifyContent: "flex-end" }}>
        {[0, 1, 2].map((i) => (
          <MaterialCommunityIcons
            key={i}
            name="poker-chip"
            size={16}
            color={i === 2 ? theme.palette.gold[400] : theme.palette.gold[600]}
            style={{
              position: "absolute",
              bottom: i * 4,
              transform: [{ scaleY: 0.35 }],
            }}
          />
        ))}
      </View>
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.xs,
          color: theme.palette.gold[500],
        }}
      >
        {amount % 1 === 0 ? `${amount}BB` : `${amount.toFixed(1)}BB`}
      </Text>
    </View>
  );
}

function PlayerToken({
  seat,
  action,
  holeCards,
  cardsTrigger,
  suppressBet,
}: {
  seat: PlayerSeat;
  action: PreflopAction | null;
  holeCards: HoleCards;
  cardsTrigger?: number;
  suppressBet?: boolean;
}) {
  const { t } = useTheme();
  const isHero = seat.isHero;
  const avatarBg = isHero ? t.accent.blue : t.assets.bgCardSecondary;
  const avatarBorder = isHero ? t.accent.blue : t.assets.strokeInactive;

  return (
    <View style={{ alignItems: "center", width: TOKEN_SIZE + 24 }}>
      <View
        style={{
          width: TOKEN_SIZE,
          height: TOKEN_SIZE,
          borderRadius: TOKEN_SIZE / 2,
          backgroundColor: avatarBg,
          borderWidth: 2,
          borderColor: avatarBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.xs,
            color: isHero ? "#fff" : t.assets.subtext,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {seat.position}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.xs,
          color: t.assets.subtext,
          marginTop: 2,
        }}
      >
        {seat.stackBB}BB
      </Text>

      {action && !suppressBet && <ChipBet action={action} />}

      {isHero && (
        <HeroCards holeCards={holeCards} trigger={cardsTrigger ?? 0} />
      )}
    </View>
  );
}

function HeroCards({
  holeCards,
  trigger,
}: {
  holeCards: HoleCards;
  trigger: number;
}) {
  const { t } = useTheme();
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (trigger === 0) {
      hasAnimated.current = false;
      translateY.setValue(-40);
      opacity.setValue(0);
      return;
    }
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    translateY.setValue(-40);
    opacity.setValue(0);
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 12,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, CARDS_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [trigger, translateY, opacity]);

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        gap: 3,
        marginTop: 4,
        opacity,
        transform: [{ translateY }],
      }}
    >
      {holeCards.map((card) => (
        <View
          key={`${card.rank}${card.suit}`}
          style={{
            backgroundColor: "#ffffff",
            borderRadius: theme.borderRadius.xs,
            borderWidth: 1,
            borderColor: "#e5e5e5",
            paddingHorizontal: 7,
            paddingVertical: 5,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: theme.fontSize.h6,
              color: suitColor(card.suit),
              lineHeight: theme.fontSize.h6 * 1.1,
            }}
          >
            {card.rank}
          </Text>
          <MaterialCommunityIcons
            name={suitIcon(card.suit)}
            size={14}
            color={suitColor(card.suit)}
          />
        </View>
      ))}
    </Animated.View>
  );
}

const TOKEN_SLOT_W = TOKEN_SIZE + 32;
const TOKEN_SLOT_H = TOKEN_SIZE + 60;

// Circle wider than the screen so the visible top cap looks like a flatter arc.
const CIRCLE_SCALE = 1;
const ARC_HEIGHT_RATIO = 0.44;
const EDGE_MARGIN = 12;

function PokerTable({
  scenario,
  revealedCount,
  blindRevealedCount,
  cardsTrigger,
}: {
  scenario: PreflopScenario;
  revealedCount: number;
  blindRevealedCount: number;
  cardsTrigger: number;
}) {
  const { width } = useWindowDimensions();

  const circleD = width * CIRCLE_SCALE;
  const circleR = circleD / 2;
  const circleLeft = -(circleD - width) / 2;

  const arcH = width * ARC_HEIGHT_RATIO;

  const screenCX = width / 2;
  const screenCY = circleR; // circle top is at y=0, so centre is at y=circleR

  const playerArcR = circleR - TOKEN_SIZE / 2;

  const maxHalfSpread = Math.asin(
    Math.min(1, (screenCX - TOKEN_SLOT_W / 2 - EDGE_MARGIN) / playerArcR),
  );
  const spreadRad = maxHalfSpread * 2;

  const { seats, actionsBefore, holeCards, potState } = scenario;
  const heroSeat = seats.find((s) => s.isHero) ?? seats[seats.length - 1];

  const tablePositions = ACTION_ORDER_BY_SIZE[
    scenario.tableSize
  ] as readonly string[];
  const btnIdx = tablePositions.indexOf("BTN");
  const clockwiseFromBtn = [
    ...tablePositions.slice(btnIdx),
    ...tablePositions.slice(0, btnIdx),
  ];
  const heroIdx = clockwiseFromBtn.indexOf(scenario.heroPosition);
  const nonHeroClockwise: PlayerSeat[] = Array.from(
    { length: clockwiseFromBtn.length - 1 },
    (_, i) => {
      const pos = clockwiseFromBtn[(heroIdx + 1 + i) % clockwiseFromBtn.length];
      return seats.find((s) => s.position === pos);
    },
  ).filter((s): s is PlayerSeat => s !== undefined);
  const nonHero = nonHeroClockwise;
  const actingSeats = nonHero.filter((s) =>
    actionsBefore.some((a) => a.position === s.position),
  );
  const positions = nonHero.map((seat, i) => {
    const t = nonHero.length === 1 ? 0.5 : i / (nonHero.length - 1);
    const angle = -Math.PI / 2 - spreadRad / 2 + t * spreadRad;
    const x = screenCX + playerArcR * Math.cos(angle);
    const y = screenCY + playerArcR * Math.sin(angle);
    return { seat, x, y };
  });

  const topPad = 40;
  const containerH = topPad + arcH + TOKEN_SLOT_H + 16;

  return (
    <View style={{ width, height: containerH }}>
      <View
        style={{
          position: "absolute",
          top: topPad,
          left: 0,
          width,
          height: arcH + 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: circleLeft,
            width: circleD,
            height: circleD,
            borderRadius: circleR,
            backgroundColor: TABLE_GREEN,
            borderWidth: 8,
            borderColor: TABLE_BORDER,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 6,
            left: circleLeft + 6,
            width: circleD - 12,
            height: circleD - 12,
            borderRadius: circleR - 6,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.06)",
            backgroundColor: "transparent",
          }}
        />
      </View>

      {/* POT label — positioned relative to the full container */}
      <View
        style={{
          position: "absolute",
          top: topPad + arcH * 0.42,
          left: width / 2 - 40,
          width: 80,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.xs,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          POT
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.h5,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {potState.potBB.toFixed(1)}BB
        </Text>
      </View>

      {positions.map(({ seat, x, y }) => {
        const sbBB = scenario.blindStructure.bigBlind;
        const blindAction: PreflopAction | null =
          seat.position === "SB" && blindRevealedCount >= 1
            ? {
                position: "SB",
                action: "limp",
                sizeBB: scenario.blindStructure.smallBlind / sbBB,
              }
            : seat.position === "BB" && blindRevealedCount >= 2
              ? { position: "BB", action: "limp", sizeBB: 1 }
              : null;

        const clockwiseRevealIndex = actingSeats.findIndex(
          (s) => s.position === seat.position,
        );
        const acted = actionsBefore.find((a) => a.position === seat.position);
        const revealed =
          clockwiseRevealIndex >= 0 && clockwiseRevealIndex < revealedCount;
        const displayAction = revealed && acted ? acted : blindAction;

        return (
          <View
            key={seat.position}
            style={{
              position: "absolute",
              left: x - TOKEN_SLOT_W / 2,
              top: topPad + y - TOKEN_SLOT_H / 2,
            }}
          >
            <PlayerToken
              seat={seat}
              action={displayAction}
              holeCards={holeCards}
            />
          </View>
        );
      })}

      {/* Hero sits at the bottom center, just below the arc */}
      {(() => {
        const heroBlindAction =
          heroSeat.position === "SB" && blindRevealedCount >= 1
            ? {
                position: "SB" as const,
                action: "limp" as const,
                sizeBB:
                  scenario.blindStructure.smallBlind /
                  scenario.blindStructure.bigBlind,
              }
            : heroSeat.position === "BB" && blindRevealedCount >= 2
              ? { position: "BB" as const, action: "limp" as const, sizeBB: 1 }
              : null;
        return (
          <>
            {heroBlindAction && (
              <View
                style={{
                  position: "absolute",
                  left: width / 2 - TOKEN_SLOT_W / 2,
                  top: topPad + arcH - 28,
                  alignItems: "center",
                  width: TOKEN_SLOT_W,
                }}
              >
                <ChipBet action={heroBlindAction} />
              </View>
            )}
            <View
              style={{
                position: "absolute",
                left: width / 2 - TOKEN_SLOT_W / 2,
                top: topPad + arcH + 12,
              }}
            >
              <PlayerToken
                key={holeCards.map((c) => `${c.rank}${c.suit}`).join("")}
                seat={heroSeat}
                action={heroBlindAction}
                holeCards={holeCards}
                cardsTrigger={cardsTrigger}
                suppressBet
              />
            </View>
          </>
        );
      })()}
    </View>
  );
}

const BURST_COLORS = ["#4ade80", "#facc15", "#60a5fa", "#f472b6", "#a78bfa"];
const BURST_COUNT = 14;

type ParticleConfig = {
  startX: number;
  endY: number;
  color: string;
  size: number;
  delay: number;
};

function BurstParticle({
  cfg,
  trigger,
}: {
  cfg: ParticleConfig;
  trigger: number;
}) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger === 0) return;
    x.setValue(0);
    y.setValue(0);
    opacity.setValue(0);
    scale.setValue(0);

    Animated.sequence([
      Animated.delay(cfg.delay),
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.delay(300),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scale, {
          toValue: 1,
          damping: 6,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(x, {
          toValue: cfg.startX,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(y, {
          toValue: cfg.endY,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [trigger, cfg, x, y, opacity, scale]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: cfg.size,
        height: cfg.size,
        borderRadius: cfg.size / 2,
        backgroundColor: cfg.color,
        left: -cfg.size / 2,
        top: -cfg.size / 2,
        opacity,
        transform: [{ translateX: x }, { translateY: y }, { scale }],
      }}
    />
  );
}

function CorrectBurst({ active }: { active: boolean }) {
  const { width } = useWindowDimensions();
  const triggerCount = useRef(0);
  const configs = useRef<ParticleConfig[]>(
    Array.from({ length: BURST_COUNT }, (_, i) => ({
      startX: (Math.random() - 0.5) * width * 0.85,
      endY: -(120 + Math.random() * 160),
      color: BURST_COLORS[i % BURST_COLORS.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 200,
    })),
  ).current;
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (active) {
      triggerCount.current += 1;
      setTrigger(triggerCount.current);
    }
  }, [active]);

  if (!active) return null;

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", bottom: 0, left: width / 2, height: 0 }}
    >
      {configs.map((cfg, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: particle configs are stable per mount
        <BurstParticle key={i} cfg={cfg} trigger={trigger} />
      ))}
    </View>
  );
}

function AnimatedResultCard({
  result,
  verdictColor,
  verdictBg,
}: {
  result: EvaluationResult;
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
          marginHorizontal: TABLE_PADDING,
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
        {result.verdict}
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.body,
          color: t.assets.text,
          lineHeight: theme.fontSize.body * theme.lineHeight.body,
        }}
      >
        {result.explanation}
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.sm,
          color: t.assets.subtext,
          marginTop: theme.spacing.sm,
        }}
      >
        Best play: {decisionLabel(result.recommendedAction)}
      </Text>
    </Animated.View>
  );
}

function MoveTimeline({
  actions,
  scenario,
  revealedCount,
  blindRevealedCount,
  onSeek,
}: {
  actions: PreflopAction[];
  scenario: PreflopScenario;
  revealedCount: number;
  blindRevealedCount: number;
  onSeek: (index: number, blindRevealedCount?: number) => void;
}) {
  const { t } = useTheme();
  if (actions.length === 0) return null;

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
  const allActions = [...blindActions, ...actions];
  const blindCount = blindActions.length;

  const globalIndex = blindRevealedCount + revealedCount;
  const canBack = globalIndex > 1;
  const canForward = revealedCount < actions.length;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: TABLE_PADDING,
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
        onPress={() => canForward && onSeek(revealedCount + 1, 2)}
        hitSlop={8}
        style={{ opacity: canForward ? 1 : 0.25 }}
      >
        <Ionicons name="chevron-forward" size={18} color={t.assets.subtext} />
      </Pressable>
    </View>
  );
}

type QuizPhase = "quiz" | "result";

export default function PreflopScreen() {
  const { t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [scenario, setScenario] = useState<PreflopScenario>(() =>
    generateScenario(),
  );
  const [phase, setPhase] = useState<QuizPhase>("quiz");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [blindRevealedCount, setBlindRevealedCount] = useState(2);
  const [cardsTrigger, setCardsTrigger] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopAutoReveal() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function seekTo(index: number, brc?: number) {
    stopAutoReveal();
    const newBlindRevealedCount = brc ?? 2;
    setBlindRevealedCount(newBlindRevealedCount);
    setRevealedCount(index);
    if (index >= scenario.actionsBefore.length && newBlindRevealedCount >= 2) {
      setCardsTrigger((n) => n + 1);
    }
  }

  useEffect(() => {
    setRevealedCount(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const total = scenario.actionsBefore.length;
    if (total === 0) {
      setCardsTrigger((n) => n + 1);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next >= total) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          // Fire the card trigger at the exact moment the last reveal lands.
          setCardsTrigger((n) => n + 1);
        }
        return next;
      });
    }, 800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scenario]);

  const actionsComplete = revealedCount >= scenario.actionsBefore.length;

  function handleDecision(decision: Decision) {
    const evaluation = evaluateDecision(scenario, decision);
    setResult(evaluation);
    setPhase("result");
  }

  function nextHand() {
    setCardsTrigger(0);
    setBlindRevealedCount(2);
    setScenario(generateScenario());
    setResult(null);
    setPhase("quiz");
  }

  const { potState } = scenario;
  const facingRaise = potState.callAmountBB > 1;
  const raiseSizeBB = potState.facingRaiseSizeBB
    ? potState.facingRaiseSizeBB * 3
    : 2.5;

  const verdictColor =
    result?.verdict === "correct"
      ? t.sentiment.positive
      : result?.verdict === "acceptable"
        ? theme.palette.gold[500]
        : t.sentiment.negative;

  const verdictBg =
    result?.verdict === "correct"
      ? t.sentiment.positiveBg
      : result?.verdict === "acceptable"
        ? theme.palette.gold[800]
        : t.sentiment.negativeBg;

  return (
    <View style={{ flex: 1, backgroundColor: t.assets.bgPage }}>
      <View
        style={{
          backgroundColor: t.assets.bgPage,
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ width: 40, alignItems: "flex-start" }}
        >
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={t.assets.text}
          />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.body,
            color: t.assets.text,
            includeFontPadding: false,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          Preflop Trainer
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: theme.spacing.md,
          paddingBottom: 160,
        }}
      >
        <PokerTable
          scenario={scenario}
          revealedCount={revealedCount}
          blindRevealedCount={blindRevealedCount}
          cardsTrigger={cardsTrigger}
        />

        <MoveTimeline
          actions={scenario.actionsBefore}
          scenario={scenario}
          revealedCount={revealedCount}
          blindRevealedCount={blindRevealedCount}
          onSeek={seekTo}
        />

        {phase === "result" && result && (
          <AnimatedResultCard
            result={result}
            verdictColor={verdictColor}
            verdictBg={verdictBg}
          />
        )}

        <CorrectBurst
          active={phase === "result" && result?.verdict === "correct"}
        />
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
          paddingTop: theme.spacing.sm,
          backgroundColor: t.assets.bgPage,
          gap: theme.spacing.sm,
        }}
      >
        {phase === "quiz" ? (
          <>
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <ActionButton
                label="Fold"
                color={t.sentiment.negative}
                bg={t.sentiment.negativeBg}
                onPress={() => handleDecision({ type: "fold" })}
                disabled={!actionsComplete}
                flex
              />
              <ActionButton
                label={facingRaise ? `Call ${potState.callAmountBB}BB` : "Call"}
                color={t.accent.blue}
                bg={theme.palette.blue[800]}
                onPress={() => handleDecision({ type: "call" })}
                disabled={!actionsComplete || !facingRaise}
                flex
              />
            </View>
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <ActionButton
                label={`Raise ${raiseSizeBB}BB`}
                color={t.sentiment.positive}
                bg={t.sentiment.positiveBg}
                onPress={() =>
                  handleDecision({ type: "raise", sizeBB: raiseSizeBB })
                }
                disabled={!actionsComplete}
                flex
              />
              <ActionButton
                label="All-in"
                color={theme.palette.gold[500]}
                bg={theme.palette.gold[800]}
                onPress={() => handleDecision({ type: "allin" })}
                disabled={!actionsComplete}
                flex
              />
            </View>
          </>
        ) : (
          <Button label="Next Hand" variant="secondary" onPress={nextHand} />
        )}
      </View>
    </View>
  );
}

function ActionButton({
  label,
  color,
  bg,
  onPress,
  disabled,
  flex,
}: {
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
  disabled?: boolean;
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        backgroundColor: bg,
        borderRadius: theme.borderRadius.m,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        alignItems: "center",
        opacity: disabled ? 0.35 : pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.body,
          color,
          includeFontPadding: false,
          marginTop: 4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
