import { createDeck, dealCards, shuffleDeck } from "./deck";
import { rankToNumber } from "./hands";
import { SeededRng } from "./rng";
import type {
  BlindStructure,
  Card,
  EvaluationVerdict,
  HoleCards,
  PlayerSeat,
  Position,
  PostflopDecision,
  PostflopEvaluationResult,
  PostflopHandStrength,
  PostflopScenario,
  PostflopVillainAction,
  PotState,
  PreflopAction,
  Suit,
} from "./types";

function buildTableScenario(
  heroPosition: Position,
  villainPosition: Position,
  heroStackBB: number,
  villainStackBB: number,
  potBB: number,
  callAmountBB: number,
  facingRaiseSizeBB: number | null,
): {
  seats: PlayerSeat[];
  potState: PotState;
  blindStructure: BlindStructure;
} {
  const seats: PlayerSeat[] = [
    {
      position: heroPosition,
      stackBB: heroStackBB,
      isHero: true,
      hasFolded: false,
    },
    {
      position: villainPosition,
      stackBB: villainStackBB,
      isHero: false,
      hasFolded: false,
    },
  ];
  const potState: PotState = {
    potBB,
    callAmountBB,
    facingRaiseSizeBB,
    numCallers: 0,
    numRaisers: facingRaiseSizeBB != null ? 1 : 0,
  };
  const blindStructure: BlindStructure = {
    smallBlind: 50,
    bigBlind: 100,
    ante: 0,
  };
  return { seats, potState, blindStructure };
}

export function generatePostflopScenario(seed?: number): PostflopScenario {
  const s = seed ?? (Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0;
  const rng = new SeededRng(s);

  let deck = shuffleDeck(createDeck(), rng);
  const { dealt: holeDealt, remaining: deckAfterHole } = dealCards(deck, 2);
  const holeCards = holeDealt as HoleCards;
  deck = deckAfterHole;

  const { dealt: boardDealt, remaining: _rest } = dealCards(deck, 3);
  const board = boardDealt as [Card, Card, Card];

  const potBB = rng.nextInt(4, 18);
  const heroStackBB = rng.nextInt(20, 120);
  const villainStackBB = rng.nextInt(20, 120);
  const effectiveStackBB = Math.min(heroStackBB, villainStackBB);

  const heroIsInPosition = rng.next() > 0.5;
  const heroPosition: Position = heroIsInPosition ? "SB" : "BB";
  const villainPosition: Position = heroIsInPosition ? "BB" : "SB";

  const villainBets = rng.next() > 0.45;
  const betSize = villainBets
    ? Math.round(potBB * (rng.next() * 0.6 + 0.25) * 2) / 2
    : 0;
  const villainAction: PostflopVillainAction = villainBets
    ? { action: "bet", sizeBB: betSize }
    : { action: "check" };

  const callAmountBB = villainBets ? betSize : 0;
  const facingRaiseSizeBB = villainBets ? betSize : null;

  const preflopContribBB = Math.max(1, Math.round(potBB / 2));
  const actionsBefore: PreflopAction[] =
    villainPosition === "SB"
      ? [
          {
            position: "SB",
            action: preflopContribBB > 1 ? "raise" : "limp",
            sizeBB: preflopContribBB > 1 ? preflopContribBB : 0.5,
          },
        ]
      : [
          {
            position: "BB",
            action: "limp",
            sizeBB: preflopContribBB,
          },
        ];

  const { seats, potState, blindStructure } = buildTableScenario(
    heroPosition,
    villainPosition,
    heroStackBB,
    villainStackBB,
    potBB,
    callAmountBB,
    facingRaiseSizeBB,
  );

  return {
    id: `postflop-${s}`,
    seed: s,
    tableSize: 2,
    heroPosition,
    heroIsInPosition,
    holeCards,
    board,
    street: "flop",
    villainAction,
    effectiveStackBB,
    blindStructure,
    seats,
    actionsBefore,
    potState,
  };
}

function classifyPostflopStrength(
  holeCards: HoleCards,
  board: Card[],
): PostflopHandStrength {
  const allCards = [...holeCards, ...board];
  const holeRanks = holeCards.map((c) => rankToNumber(c.rank));
  const boardRanks = board.map((c) => rankToNumber(c.rank));
  const holeSuits = holeCards.map((c) => c.suit);
  const allRanks = allCards.map((c) => rankToNumber(c.rank));
  const allSuits = allCards.map((c) => c.suit);

  const rankCounts: Record<number, number> = {};
  for (const r of allRanks) rankCounts[r] = (rankCounts[r] ?? 0) + 1;
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  if (counts[0] >= 3) return "monster";
  if (counts[0] >= 2 && (counts[1] ?? 0) >= 2) return "monster";

  const suitCounts: Record<string, number> = {};
  for (const s of allSuits) suitCounts[s] = (suitCounts[s] ?? 0) + 1;
  const hasFlushDraw = Object.entries(suitCounts).some(
    ([suit, count]) => count === 4 && holeSuits.includes(suit as Suit),
  );

  const uniqueRanks = [...new Set(allRanks)].sort((a, b) => a - b);
  let hasStraightDraw = false;
  for (let i = 0; i + 3 < uniqueRanks.length; i++) {
    if (uniqueRanks[i + 3] - uniqueRanks[i] <= 4) {
      hasStraightDraw = true;
      break;
    }
  }

  const topBoard = Math.max(...boardRanks);
  const isOverpair = holeRanks[0] === holeRanks[1] && holeRanks[0] > topBoard;
  const isTopPair = holeRanks.some((r) => r === topBoard);
  const highHole = Math.max(...holeRanks);
  const hasGoodKicker = highHole >= 11;

  if (isOverpair) return "strong";
  if (isTopPair && hasGoodKicker) return "strong";
  if (hasFlushDraw || hasStraightDraw) return "draw";
  if (counts[0] >= 2) return "medium";
  return "weak";
}

function getRecommendedPostflopAction(
  handStrength: PostflopHandStrength,
  heroIsInPosition: boolean,
  villainAction: PostflopVillainAction,
  potBB: number,
  effectiveStackBB: number,
): PostflopDecision {
  const spr = effectiveStackBB / potBB;
  const facingBet = villainAction.action === "bet";
  const betSize = facingBet
    ? (villainAction as { action: "bet"; sizeBB: number }).sizeBB
    : 0;

  if (facingBet) {
    const potOdds = betSize / (potBB + betSize);
    if (handStrength === "monster") {
      return { type: "raise", sizeBB: Math.round(betSize * 3) };
    }
    if (handStrength === "strong") return { type: "call" };
    if (handStrength === "draw") {
      return potOdds < 0.33 ? { type: "call" } : { type: "fold" };
    }
    return { type: "fold" };
  }

  const betAmt = Math.round(potBB * 0.67);
  if (handStrength === "monster" || handStrength === "strong") {
    return { type: "bet", sizeBB: betAmt };
  }
  if (handStrength === "draw") {
    return heroIsInPosition && spr > 2
      ? { type: "bet", sizeBB: Math.round(potBB * 0.5) }
      : { type: "check" };
  }
  return { type: "check" };
}

function comparePostflopDecisions(
  hero: PostflopDecision,
  recommended: PostflopDecision,
  handStrength: PostflopHandStrength,
  facingBet: boolean,
): EvaluationVerdict {
  if (hero.type === recommended.type) {
    if (hero.type === "bet" && recommended.type === "bet") {
      const diff = Math.abs(hero.sizeBB - recommended.sizeBB);
      return diff <= recommended.sizeBB * 0.4 ? "correct" : "acceptable";
    }
    if (hero.type === "raise" && recommended.type === "raise") {
      const diff = Math.abs(hero.sizeBB - recommended.sizeBB);
      return diff <= recommended.sizeBB * 0.4 ? "correct" : "acceptable";
    }
    return "correct";
  }

  if (facingBet) {
    if (recommended.type === "fold" && hero.type !== "fold") return "incorrect";
    if (recommended.type === "call" && hero.type === "fold") return "incorrect";
    if (recommended.type === "call" && hero.type === "raise")
      return "acceptable";
    if (recommended.type === "raise" && hero.type === "call")
      return "acceptable";
  } else {
    if (recommended.type === "bet" && hero.type === "check") {
      return handStrength === "draw" ? "acceptable" : "incorrect";
    }
    if (recommended.type === "check" && hero.type === "bet") {
      return handStrength === "medium" ? "acceptable" : "incorrect";
    }
  }

  return "incorrect";
}

function buildPostflopExplanation(
  verdict: EvaluationVerdict,
  handStrength: PostflopHandStrength,
  heroIsInPosition: boolean,
  facingBet: boolean,
  recommended: PostflopDecision,
): string {
  const strengthDesc: Record<PostflopHandStrength, string> = {
    monster: "a monster hand",
    strong: "a strong hand",
    medium: "a medium-strength hand",
    draw: "a drawing hand",
    weak: "a weak hand",
  };
  const posDesc = heroIsInPosition ? "in position" : "out of position";
  const situationDesc = facingBet ? "facing a bet" : "facing a check";
  const actionDesc = (d: PostflopDecision): string => {
    if (d.type === "fold") return "fold";
    if (d.type === "check") return "check";
    if (d.type === "call") return "call";
    if (d.type === "bet") return `bet ${d.sizeBB}BB`;
    return `raise to ${d.sizeBB}BB`;
  };

  const base = `You have ${strengthDesc[handStrength]} ${posDesc}, ${situationDesc}.`;
  if (verdict === "correct") {
    return `${base} ${actionDesc(recommended).charAt(0).toUpperCase() + actionDesc(recommended).slice(1)} is the correct play.`;
  }
  if (verdict === "acceptable") {
    return `${base} The best play is to ${actionDesc(recommended)}, but your decision is reasonable.`;
  }
  return `${base} The correct play is to ${actionDesc(recommended)}.`;
}

export function evaluatePostflopDecision(
  scenario: PostflopScenario,
  decision: PostflopDecision,
): PostflopEvaluationResult {
  const handStrength = classifyPostflopStrength(
    scenario.holeCards,
    scenario.board,
  );
  const { heroIsInPosition, villainAction, potState, effectiveStackBB } =
    scenario;
  const facingBet = villainAction.action === "bet";
  const betSize = facingBet
    ? (villainAction as { action: "bet"; sizeBB: number }).sizeBB
    : 0;

  const recommended = getRecommendedPostflopAction(
    handStrength,
    heroIsInPosition,
    villainAction,
    potState.potBB,
    effectiveStackBB,
  );

  const verdict = comparePostflopDecisions(
    decision,
    recommended,
    handStrength,
    facingBet,
  );
  const explanation = buildPostflopExplanation(
    verdict,
    handStrength,
    heroIsInPosition,
    facingBet,
    recommended,
  );

  const reasoning: string[] = [];
  if (facingBet) {
    const potOdds = Math.round((betSize / (potState.potBB + betSize)) * 100);
    reasoning.push(
      `Pot odds: ${potOdds}% (calling ${betSize}BB into ${potState.potBB + betSize}BB pot)`,
    );
  }
  reasoning.push(`SPR: ${(effectiveStackBB / potState.potBB).toFixed(1)}`);
  reasoning.push(
    heroIsInPosition
      ? "You are in position (act last)."
      : "You are out of position (act first).",
  );

  return {
    verdict,
    explanation,
    recommendedAction: recommended,
    handStrength,
    reasoning,
  };
}
