import { Ionicons } from "@expo/vector-icons";
import {
  evaluatePostflopDecision,
  generatePostflopScenario,
  type PostflopDecision,
  type PostflopEvaluationResult,
  type PostflopScenario,
} from "@poker-trainer/poker-engine";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CorrectBurst } from "@/components/features/trainer/CorrectBurst";
import { MoveTimeline } from "@/components/features/trainer/MoveTimeline";
import { PokerTable } from "@/components/features/trainer/PokerTable";
import { ResultCard } from "@/components/features/trainer/ResultCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

type QuizPhase = "quiz" | "result";

export default function PostflopScreen() {
  const { t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [scenario, setScenario] = useState<PostflopScenario>(() =>
    generatePostflopScenario(),
  );
  const [phase, setPhase] = useState<QuizPhase>("quiz");
  const [result, setResult] = useState<PostflopEvaluationResult | null>(null);
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
    const newBrc = brc ?? 2;
    setBlindRevealedCount(newBrc);
    setRevealedCount(index);
    if (index >= scenario.actionsBefore.length && newBrc >= 2) {
      setCardsTrigger((n) => n + 1);
    }
  }

  useEffect(() => {
    setRevealedCount(0);
    setCardsTrigger(0);
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
          setCardsTrigger((n) => n + 1);
        }
        return next;
      });
    }, 800);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scenario]);

  function handleDecision(decision: PostflopDecision) {
    const evaluation = evaluatePostflopDecision(scenario, decision);
    setResult(evaluation);
    setPhase("result");
  }

  function nextHand() {
    setCardsTrigger(0);
    setBlindRevealedCount(2);
    setScenario(generatePostflopScenario());
    setResult(null);
    setPhase("quiz");
  }

  const { villainAction, potState, heroIsInPosition } = scenario;
  const facingBet = villainAction.action === "bet";
  const betSize = facingBet
    ? (villainAction as { action: "bet"; sizeBB: number }).sizeBB
    : 0;
  const raiseSizeBB = Math.round(betSize * 3);
  const betSizeBB = Math.round(potState.potBB * 0.67);

  function postflopActionLabel(action: PostflopDecision): string {
    if (action.type === "fold") return "Fold";
    if (action.type === "check") return "Check";
    if (action.type === "call") return "Call";
    if (action.type === "bet") return `Bet ${action.sizeBB}BB`;
    return `Raise to ${action.sizeBB}BB`;
  }

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
          Postflop Trainer
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: theme.spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <PokerTable
          scenario={scenario}
          revealedCount={revealedCount}
          blindRevealedCount={blindRevealedCount}
          cardsTrigger={cardsTrigger}
          communityCards={scenario.board}
        />

        <View style={{ height: theme.spacing.xs }} />

        <MoveTimeline
          actions={scenario.actionsBefore}
          scenario={scenario}
          revealedCount={revealedCount}
          blindRevealedCount={blindRevealedCount}
          onSeek={seekTo}
        />

        <View style={{ height: theme.spacing.xs }} />

        <VillainActionBar
          villainAction={villainAction}
          potBB={potState.potBB}
          heroIsInPosition={heroIsInPosition}
        />

        {phase === "result" && result && (
          <ResultCard
            verdict={result.verdict}
            explanation={result.explanation}
            recommendedActionLabel={postflopActionLabel(
              result.recommendedAction,
            )}
            extraLines={result.reasoning}
            verdictColor={verdictColor}
            verdictBg={verdictBg}
          />
        )}

        <CorrectBurst
          active={phase === "result" && result?.verdict === "correct"}
        />

        <View style={{ height: 160 }} />
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
              {facingBet ? (
                <ActionButton
                  label="Fold"
                  color={t.sentiment.negative}
                  bg={t.sentiment.negativeBg}
                  onPress={() => handleDecision({ type: "fold" })}
                  flex
                />
              ) : (
                <ActionButton
                  label="Check"
                  color={t.assets.subtext}
                  bg={t.assets.bgCardSecondary}
                  onPress={() => handleDecision({ type: "check" })}
                  flex
                />
              )}
              {facingBet ? (
                <ActionButton
                  label={`Call ${betSize}BB`}
                  color={t.accent.blue}
                  bg={theme.palette.blue[800]}
                  onPress={() => handleDecision({ type: "call" })}
                  flex
                />
              ) : (
                <ActionButton
                  label={`Bet ${betSizeBB}BB`}
                  color={t.sentiment.positive}
                  bg={t.sentiment.positiveBg}
                  onPress={() =>
                    handleDecision({ type: "bet", sizeBB: betSizeBB })
                  }
                  flex
                />
              )}
            </View>
            {facingBet && (
              <ActionButton
                label={`Raise to ${raiseSizeBB}BB`}
                color={t.sentiment.positive}
                bg={t.sentiment.positiveBg}
                onPress={() =>
                  handleDecision({ type: "raise", sizeBB: raiseSizeBB })
                }
              />
            )}
          </>
        ) : (
          <Button label="Next Hand" variant="secondary" onPress={nextHand} />
        )}
      </View>
    </View>
  );
}

function VillainActionBar({
  villainAction,
  potBB,
  heroIsInPosition,
}: {
  villainAction: PostflopScenario["villainAction"];
  potBB: number;
  heroIsInPosition: boolean;
}) {
  const { t } = useTheme();
  const posLabel = heroIsInPosition ? "OOP villain" : "IP villain";
  const actionLabel =
    villainAction.action === "check"
      ? "checked"
      : `bet ${(villainAction as { action: "bet"; sizeBB: number }).sizeBB}BB`;

  return (
    <View
      style={{
        marginHorizontal: theme.spacing.md,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: t.assets.bgCard,
        borderRadius: theme.borderRadius.m,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.body,
          color: t.assets.subtext,
        }}
      >
        {posLabel}{" "}
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            color: t.assets.text,
          }}
        >
          {actionLabel}
        </Text>
      </Text>
      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.xs,
          color: t.assets.subtext,
        }}
      >
        Pot: {potBB}BB
      </Text>
    </View>
  );
}

function ActionButton({
  label,
  color,
  bg,
  onPress,
  flex,
}: {
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        backgroundColor: bg,
        borderRadius: theme.borderRadius.m,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        alignItems: "center",
        opacity: pressed ? 0.75 : 1,
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
