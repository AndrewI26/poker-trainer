import { Ionicons } from "@expo/vector-icons";
import {
  type BoardTexture,
  classifyBoardTexture,
  classifyHandStrength,
  type EvaluationVerdict,
  evaluateHeroAction,
  generatePostflopPosition,
  lookupChartEntry,
  type PostflopDecision,
  type PostflopHandStrength,
  type PostflopPosition,
  resolveAction,
} from "@poker-trainer/poker-engine";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CorrectBurst } from "@/components/features/trainer/CorrectBurst";
import { HandTimeline } from "@/components/features/trainer/HandTimeline";
import { PokerTable } from "@/components/features/trainer/PokerTable";
import { ResultCard } from "@/components/features/trainer/ResultCard";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

interface PostflopResult {
  verdict: EvaluationVerdict;
  recommendedAction: PostflopDecision;
  texture: BoardTexture;
  strength: PostflopHandStrength;
}

function postflopActionLabel(action: PostflopDecision): string {
  switch (action.type) {
    case "fold":
      return "Fold";
    case "check":
      return "Check";
    case "call":
      return "Call";
    case "bet":
      return `Bet ${action.sizeBB}BB`;
    case "raise":
      return `Raise to ${action.sizeBB}BB`;
  }
}

function buildExplanation(
  texture: BoardTexture,
  strength: PostflopHandStrength,
  recommended: PostflopDecision,
  inPosition: boolean,
): string {
  const strengthLabel: Record<PostflopHandStrength, string> = {
    monster: "a monster hand",
    strong: "a strong hand",
    medium: "a medium-strength hand",
    draw: "a drawing hand",
    weak: "a weak hand",
  };
  const posLabel = inPosition ? "in position" : "out of position";
  return `You have ${strengthLabel[strength]} on a ${texture} board, ${posLabel}. The optimal play is to ${postflopActionLabel(recommended).toLowerCase()}.`;
}

export default function PostflopScreen() {
  const { t } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [position, setPosition] = useState<PostflopPosition>(() =>
    generatePostflopPosition(),
  );
  const [phase, setPhase] = useState<"quiz" | "result">("quiz");
  const [result, setResult] = useState<PostflopResult | null>(null);
  const [heroDecision, setHeroDecision] = useState<PostflopDecision | null>(
    null,
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [cardsTrigger, setCardsTrigger] = useState(0);
  const [showResultModal, setShowResultModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps =
    position.preflopActions.length + 1 + position.actionHistory.length;
  const boardVisible = revealedCount > position.preflopActions.length;
  const postflopRevealCount = Math.max(
    0,
    revealedCount - position.preflopActions.length - 1,
  );
  const actionsComplete = revealedCount >= totalSteps;

  const stopAutoReveal = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    setRevealedCount(0);
    setCardsTrigger(0);
    stopAutoReveal();

    const total =
      position.preflopActions.length + 1 + position.actionHistory.length;

    if (total === 0) {
      setCardsTrigger(1);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRevealedCount((prev) => {
        const next = prev + 1;
        if (next >= total) {
          stopAutoReveal();
          setCardsTrigger((n) => n + 1);
        }
        return next;
      });
    }, 800);

    return stopAutoReveal;
  }, [position, stopAutoReveal]);

  function seekTo(count: number) {
    stopAutoReveal();
    const clamped = Math.max(0, Math.min(count, totalSteps));
    setRevealedCount(clamped);
    if (clamped >= totalSteps) {
      setCardsTrigger((prev) => (prev === 0 ? 1 : prev));
    } else {
      setCardsTrigger(0);
    }
  }

  function handleDecision(decision: PostflopDecision) {
    const texture = classifyBoardTexture(position.board);
    const strength = classifyHandStrength(position.holeCards, position.board);
    const entry = lookupChartEntry(
      position.street,
      position.heroInPosition,
      position.betCount,
      texture,
      strength,
    );
    const recommended = resolveAction(
      entry.action,
      position.potBB,
      position.facingBetBB,
    );
    const verdict = evaluateHeroAction(decision, entry);
    setResult({ verdict, recommendedAction: recommended, texture, strength });
    setHeroDecision(decision);
    setPhase("result");
    setShowResultModal(true);
  }

  function nextHand() {
    setPosition(generatePostflopPosition());
    setResult(null);
    setHeroDecision(null);
    setPhase("quiz");
    setShowResultModal(false);
  }

  const betSize = Math.round(position.potBB * 0.67 * 2) / 2;
  const callSize = position.facingBetBB;
  const raiseSize = Math.round(position.facingBetBB * 3 * 2) / 2;
  const facingBet = position.betCount > 0;

  const verdictColor =
    result?.verdict === "correct"
      ? t.sentiment.positive
      : result?.verdict === "acceptable"
        ? theme.palette.gold[500]
        : t.sentiment.negative;

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

      <View style={{ flex: 1, paddingTop: theme.spacing.lg }}>
        <PokerTable
          mode="postflop"
          position={position}
          cardsTrigger={cardsTrigger}
          heroAction={heroDecision}
          revealedCount={postflopRevealCount}
          boardVisible={boardVisible || phase === "result"}
        />

        <View style={{ height: theme.spacing.xs }} />

        <HandTimeline
          position={position}
          revealedCount={revealedCount}
          onSeek={seekTo}
        />

        {phase === "result" && result && (
          <ResultCard
            visible={showResultModal}
            onRequestClose={() => setShowResultModal(false)}
            verdict={result.verdict}
            explanation={buildExplanation(
              result.texture,
              result.strength,
              result.recommendedAction,
              position.heroInPosition,
            )}
            recommendedActionLabel={postflopActionLabel(
              result.recommendedAction,
            )}
            extraLines={[
              `Board: ${result.texture}`,
              `Hand strength: ${result.strength}`,
            ]}
            verdictColor={verdictColor}
          />
        )}

        <CorrectBurst
          active={phase === "result" && result?.verdict === "correct"}
        />
      </View>

      <View
        style={{
          paddingBottom: insets.bottom + theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
          paddingTop: theme.spacing.sm,
          backgroundColor: t.assets.bgPage,
          gap: theme.spacing.sm,
        }}
      >
        {phase === "quiz" ? (
          facingBet ? (
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
                  label={`Call ${callSize}BB`}
                  color={t.accent.blue}
                  bg={theme.palette.blue[800]}
                  onPress={() => handleDecision({ type: "call" })}
                  disabled={!actionsComplete}
                  flex
                />
              </View>
              <ActionButton
                label={`Raise to ${raiseSize}BB`}
                color={t.sentiment.positive}
                bg={t.sentiment.positiveBg}
                onPress={() =>
                  handleDecision({ type: "raise", sizeBB: raiseSize })
                }
                disabled={!actionsComplete}
              />
            </>
          ) : (
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <ActionButton
                label="Check"
                color={t.accent.blue}
                bg={theme.palette.blue[800]}
                onPress={() => handleDecision({ type: "check" })}
                disabled={!actionsComplete}
                flex
              />
              <ActionButton
                label={`Bet ${betSize}BB`}
                color={t.sentiment.positive}
                bg={t.sentiment.positiveBg}
                onPress={() => handleDecision({ type: "bet", sizeBB: betSize })}
                disabled={!actionsComplete}
                flex
              />
            </View>
          )
        ) : (
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Show feedback"
                variant="secondary"
                onPress={() => setShowResultModal(true)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button label="Next Hand" variant="primary" onPress={nextHand} />
            </View>
          </View>
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
