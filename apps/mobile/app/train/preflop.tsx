import { Ionicons } from "@expo/vector-icons";
import {
  type Decision,
  type EvaluationResult,
  evaluateDecision,
  generateScenario,
  type PreflopScenario,
} from "@poker-trainer/poker-engine";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CorrectBurst } from "@/components/features/trainer/CorrectBurst";
import { MoveTimeline } from "@/components/features/trainer/MoveTimeline";
import { PokerTable } from "@/components/features/trainer/PokerTable";
import { ResultCard } from "@/components/features/trainer/ResultCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

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

      <View style={{ flex: 1, paddingTop: theme.spacing.xl }}>
        <PokerTable
          scenario={scenario}
          revealedCount={revealedCount}
          blindRevealedCount={blindRevealedCount}
          cardsTrigger={cardsTrigger}
        />

        <View style={{ height: theme.spacing.xs }} />

        <MoveTimeline
          actions={scenario.actionsBefore}
          scenario={scenario}
          revealedCount={revealedCount}
          blindRevealedCount={blindRevealedCount}
          onSeek={seekTo}
        />

        {phase === "result" && result && (
          <ResultCard
            result={result}
            verdictColor={verdictColor}
            verdictBg={verdictBg}
          />
        )}

        <CorrectBurst
          active={phase === "result" && result?.verdict === "correct"}
        />
      </View>

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
