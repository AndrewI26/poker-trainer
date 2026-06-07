import { classifyHand } from "./hands";
import type {
  Decision,
  EvaluationResult,
  EvaluationVerdict,
  PreflopScenario,
} from "./types";

type FacingPressure = "open" | "single-raise" | "three-bet" | "four-bet-plus";
type PositionAdvantage = "in-position" | "out-of-position" | "neutral";

function getFacingPressure(numRaisers: number): FacingPressure {
  if (numRaisers === 0) return "open";
  if (numRaisers === 1) return "single-raise";
  if (numRaisers === 2) return "three-bet";
  return "four-bet-plus";
}

function getPositionAdvantage(position: string): PositionAdvantage {
  if (position === "BTN" || position === "CO") return "in-position";
  if (position === "SB" || position === "BB") return "out-of-position";
  return "neutral";
}

function getRecommendedAction(
  scenario: PreflopScenario,
  pressure: FacingPressure,
  posAdvantage: PositionAdvantage,
  handCategory: string,
): Decision {
  const { heroStackBB, potState } = scenario;
  const isShort = heroStackBB < 20;
  const inPosition = posAdvantage === "in-position";
  const raiseSizeBB = potState.facingRaiseSizeBB ?? 0;

  if (pressure === "open") {
    if (handCategory === "premium" || handCategory === "strong") {
      return isShort ? { type: "allin" } : { type: "raise", sizeBB: 2.5 };
    }
    if (handCategory === "speculative" && inPosition) {
      return { type: "raise", sizeBB: 2.5 };
    }
    return { type: "fold" };
  }

  if (pressure === "single-raise") {
    if (isShort && (handCategory === "premium" || handCategory === "strong")) {
      return { type: "allin" };
    }
    if (handCategory === "premium") {
      return { type: "raise", sizeBB: raiseSizeBB * 3 };
    }
    if (handCategory === "strong") {
      return inPosition ? { type: "call" } : { type: "call" };
    }
    if (handCategory === "speculative" && inPosition) {
      // Call if pot odds are reasonable (> 20%)
      const potOdds =
        potState.callAmountBB / (potState.potBB + potState.callAmountBB);
      return potOdds <= 0.3 ? { type: "call" } : { type: "fold" };
    }
    return { type: "fold" };
  }

  if (pressure === "three-bet") {
    if (handCategory === "premium") {
      return isShort
        ? { type: "allin" }
        : { type: "raise", sizeBB: raiseSizeBB * 2.5 };
    }
    if (handCategory === "strong" && inPosition) {
      return { type: "call" };
    }
    return { type: "fold" };
  }

  // four-bet-plus
  if (handCategory === "premium") {
    const pairRank = classifyHand(scenario.holeCards).pairRank;
    if (pairRank === "A" || pairRank === "K") {
      return { type: "allin" };
    }
  }
  return { type: "fold" };
}

function compareDecisions(
  hero: Decision,
  recommended: Decision,
): EvaluationVerdict {
  if (hero.type !== recommended.type) {
    // Folding a premium = incorrect; calling instead of raising = acceptable
    if (recommended.type === "fold" && hero.type !== "fold") return "incorrect";
    if (hero.type === "fold" && recommended.type !== "fold") return "incorrect";
    if (hero.type === "call" && recommended.type === "raise")
      return "acceptable";
    if (hero.type === "raise" && recommended.type === "call")
      return "acceptable";
    if (hero.type === "allin" && recommended.type === "raise")
      return "acceptable";
    if (hero.type === "raise" && recommended.type === "allin")
      return "acceptable";
    return "incorrect";
  }
  if (hero.type === "raise" && recommended.type === "raise") {
    const diff = Math.abs(hero.sizeBB - recommended.sizeBB);
    if (diff <= recommended.sizeBB * 0.3) return "correct";
    return "acceptable";
  }
  return "correct";
}

function buildExplanation(
  verdict: EvaluationVerdict,
  handCategory: string,
  pressure: FacingPressure,
  posAdvantage: PositionAdvantage,
  recommended: Decision,
): string {
  const handDesc: Record<string, string> = {
    premium: "a premium hand",
    strong: "a strong hand",
    speculative: "a speculative hand",
    marginal: "a marginal hand",
    weak: "a weak hand",
  };
  const pressureDesc: Record<FacingPressure, string> = {
    open: "an unopened pot",
    "single-raise": "a single raise",
    "three-bet": "a 3-bet",
    "four-bet-plus": "a 4-bet or more",
  };
  const actionDesc = (d: Decision): string => {
    if (d.type === "fold") return "fold";
    if (d.type === "call") return "call";
    if (d.type === "raise") return `raise to ${d.sizeBB}BB`;
    return "go all-in";
  };

  const base = `You have ${handDesc[handCategory] ?? handCategory} facing ${pressureDesc[pressure]}${posAdvantage !== "neutral" ? ` ${posAdvantage === "in-position" ? "in position" : "out of position"}` : ""}.`;

  if (verdict === "correct") {
    return `${base} ${actionDesc(recommended).charAt(0).toUpperCase() + actionDesc(recommended).slice(1)} is the correct play here.`;
  }
  if (verdict === "acceptable") {
    return `${base} The best play is to ${actionDesc(recommended)}, but your decision is reasonable.`;
  }
  return `${base} The correct play is to ${actionDesc(recommended)}.`;
}

export function evaluateDecision(
  scenario: PreflopScenario,
  decision: Decision,
): EvaluationResult {
  const profile = classifyHand(scenario.holeCards);
  const pressure = getFacingPressure(scenario.potState.numRaisers);
  const posAdvantage = getPositionAdvantage(scenario.heroPosition);
  const recommended = getRecommendedAction(
    scenario,
    pressure,
    posAdvantage,
    profile.category,
  );
  const verdict = compareDecisions(decision, recommended);

  const potOdds =
    scenario.potState.callAmountBB > 0
      ? scenario.potState.callAmountBB /
        (scenario.potState.potBB + scenario.potState.callAmountBB)
      : null;

  const effectiveSPR =
    scenario.effectiveStackBB / Math.max(scenario.potState.potBB, 1);

  return {
    verdict,
    explanation: buildExplanation(
      verdict,
      profile.category,
      pressure,
      posAdvantage,
      recommended,
    ),
    recommendedAction: recommended,
    handCategory: profile.category,
    reasoning: {
      positionAdvantage: posAdvantage,
      potOdds,
      effectiveSPR,
      facingPressure: pressure,
    },
  };
}
