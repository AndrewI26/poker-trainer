import {
  type EvaluationResult,
  getFacingPressure,
  type PreflopScenario,
  toHandNotation,
} from "@poker-trainer/poker-engine";
import { Text, View } from "react-native";
import { PreflopRangeChart } from "@/components/features/PreflopRangeChart";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function PreflopResultSheet({
  visible,
  onClose,
  onNextHand,
  scenario,
  result,
  recommendedActionLabel,
  verdictColor,
}: {
  visible: boolean;
  onClose: () => void;
  onNextHand: () => void;
  scenario: PreflopScenario;
  result: EvaluationResult;
  recommendedActionLabel: string;
  verdictColor: string;
}) {
  const { t } = useTheme();
  const { potState } = scenario;
  const pressure = getFacingPressure(potState.numRaisers);
  const heroHand = toHandNotation(scenario.holeCards);

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={result.verdict.toUpperCase()}
      subtitle={`${heroHand} from ${scenario.heroPosition}`}
      footer={
        <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Button label="View board" variant="secondary" onPress={onClose} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Next hand" variant="primary" onPress={onNextHand} />
          </View>
        </View>
      }
    >
      <View
        style={{
          height: 3,
          width: 44,
          borderRadius: 2,
          backgroundColor: verdictColor,
          marginBottom: theme.spacing.sm,
        }}
      />

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

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: t.assets.bgCardSecondary,
          borderRadius: theme.borderRadius.s,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          marginTop: theme.spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.regular,
            fontSize: theme.fontSize.sm,
            color: t.assets.subtext,
            includeFontPadding: false,
          }}
        >
          Best play
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.sm,
            color: t.assets.text,
            includeFontPadding: false,
          }}
        >
          {recommendedActionLabel}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.sm,
          color: t.assets.subtext,
          includeFontPadding: false,
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.sm,
        }}
      >
        YOUR RANGE HERE
      </Text>

      <PreflopRangeChart
        position={scenario.heroPosition}
        tableSize={scenario.tableSize}
        pressure={pressure}
        heroStackBB={scenario.heroStackBB}
        potBB={potState.potBB}
        callAmountBB={potState.callAmountBB}
        facingRaiseSizeBB={potState.facingRaiseSizeBB}
        highlightHand={heroHand}
      />
    </BottomSheet>
  );
}
