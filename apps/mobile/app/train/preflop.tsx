import { Ionicons } from "@expo/vector-icons";
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
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const TABLE_GREEN = "#041209";
const TABLE_BORDER = "#0f2215";
const TABLE_PADDING = 16;
const TOKEN_SIZE = 48;

function suitColor(suit: Suit, t: ReturnType<typeof useTheme>["t"]) {
  if (suit === "hearts") return t.sentiment.negative;
  if (suit === "diamonds") return t.accent.blue;
  if (suit === "clubs") return t.sentiment.positive;
  return t.assets.text;
}

function suitSymbol(suit: Suit): string {
  if (suit === "hearts") return "♥";
  if (suit === "diamonds") return "♦";
  if (suit === "clubs") return "♣";
  return "♠";
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

function PlayerToken({
  seat,
  action,
  holeCards,
}: {
  seat: PlayerSeat;
  action: PreflopAction | null;
  holeCards: HoleCards;
}) {
  const { t } = useTheme();
  const isHero = seat.isHero;
  const avatarBg = isHero ? t.accent.blue : t.assets.bgCardSecondary;
  const avatarBorder = isHero ? t.accent.blue : t.assets.strokeInactive;
  const badge = action ? actionBadgeColor(action.action, t) : null;

  return (
    <View style={{ alignItems: "center", width: TOKEN_SIZE + 24 }}>
      {badge && (
        <View
          style={{
            backgroundColor: badge.bg,
            borderRadius: theme.borderRadius.xs,
            paddingHorizontal: 5,
            paddingVertical: 2,
            marginBottom: 3,
          }}
        >
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: theme.fontSize.xs,
              color: badge.text,
            }}
            numberOfLines={1}
          >
            {action ? actionBadgeLabel(action) : ""}
          </Text>
        </View>
      )}

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

      {isHero && (
        <View style={{ flexDirection: "row", gap: 3, marginTop: 4 }}>
          {holeCards.map((card) => (
            <View
              key={`${card.rank}${card.suit}`}
              style={{
                backgroundColor: t.assets.bgCardPrimary,
                borderRadius: theme.borderRadius.xs,
                borderWidth: 1,
                borderColor: t.assets.border,
                paddingHorizontal: 4,
                paddingVertical: 2,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.fontSize.body,
                  color: suitColor(card.suit, t),
                  lineHeight: theme.fontSize.body * 1.1,
                }}
              >
                {card.rank}
              </Text>
              <Text
                style={{
                  fontFamily: theme.fontFamily.regular,
                  fontSize: theme.fontSize.xs,
                  color: suitColor(card.suit, t),
                }}
              >
                {suitSymbol(card.suit)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function PokerTable({
  scenario,
  revealedCount,
}: {
  scenario: PreflopScenario;
  revealedCount: number;
}) {
  const { width } = useWindowDimensions();
  const tableW = width - TABLE_PADDING * 2;
  const tableH = tableW * 0.52;

  const cx = tableW / 2;
  const cy = tableH;
  const rx = tableW / 2 - TOKEN_SIZE / 2 - 8;
  const ry = tableH - TOKEN_SIZE / 2 - 8;

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
    const t_frac = nonHero.length === 1 ? 0.5 : i / (nonHero.length - 1);
    const angle = (t_frac * 0.75 - 0.875) * Math.PI; // -0.875π to -0.125π (upper arc only)
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { seat, x, y };
  });

  const heroX = cx;
  const heroY = tableH * 2 - TOKEN_SIZE / 2;

  const containerH = tableH + TOKEN_SIZE + 80;

  return (
    <View style={{ width: tableW, height: containerH, alignSelf: "center" }}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: tableW,
          height: tableH * 2,
          borderRadius: tableW / 2,
          backgroundColor: TABLE_GREEN,
          borderWidth: 6,
          borderColor: TABLE_BORDER,
          overflow: "hidden",
        }}
      />

      <View
        style={{
          position: "absolute",
          top: tableH * 0.38,
          left: cx - 40,
          width: 80,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.xs,
            color: "rgba(255,255,255,0.6)",
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
            color: "#fff",
          }}
        >
          {potState.potBB.toFixed(1)}BB
        </Text>
      </View>

      {positions.map(({ seat, x, y }) => {
        const sbBB = scenario.blindStructure.bigBlind;
        const blindAction: PreflopAction | null =
          seat.position === "SB"
            ? {
                position: "SB",
                action: "limp",
                sizeBB: scenario.blindStructure.smallBlind / sbBB,
              }
            : seat.position === "BB"
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
              left: x - (TOKEN_SIZE + 24) / 2,
              top: y - TOKEN_SIZE / 2 - 20,
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

      <View
        style={{
          position: "absolute",
          left: heroX - (TOKEN_SIZE + 24) / 2,
          top: heroY - TOKEN_SIZE / 2,
        }}
      >
        <PlayerToken seat={heroSeat} action={null} holeCards={holeCards} />
      </View>
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRevealedCount(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const total = scenario.actionsBefore.length;
    if (total === 0) return;

    intervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        if (prev >= total) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
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
          borderBottomWidth: 1,
          borderBottomColor: t.assets.strokeInactive,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color={t.assets.text}
          />
        </Pressable>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.body,
            color: t.assets.text,
            marginLeft: theme.spacing.sm,
          }}
        >
          Preflop Trainer
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: TABLE_PADDING,
          paddingTop: theme.spacing.md,
          paddingBottom: 160,
        }}
      >
        <PokerTable scenario={scenario} revealedCount={revealedCount} />

        {phase === "result" && result && (
          <View
            style={{
              backgroundColor: verdictBg,
              borderRadius: theme.borderRadius.m,
              borderWidth: 1,
              borderColor: verdictColor,
              padding: theme.spacing.md,
              marginTop: theme.spacing.md,
            }}
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
          </View>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingBottom: insets.bottom + theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          backgroundColor: t.assets.bgPage,
          borderTopWidth: 1,
          borderTopColor: t.assets.strokeInactive,
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
          <ActionButton
            label="Next Hand →"
            color={t.assets.text}
            bg={t.assets.bgCardPrimary}
            onPress={nextHand}
          />
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
        borderWidth: 1,
        borderColor: color,
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
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
