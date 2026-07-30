import { createDeck, dealCards, shuffleDeck } from "./deck";
import { rankToNumber } from "./hands";
import { SeededRng } from "./rng";
import type {
  BetCount,
  BoardTexture,
  Card,
  ChartEntry,
  EvaluationVerdict,
  HoleCards,
  PlayerSeat,
  Position,
  PostflopChart,
  PostflopDecision,
  PostflopHandStrength,
  PostflopPosition,
  PostflopStreetAction,
  PreflopAction,
  RelativeAction,
  Street,
  Suit,
} from "./types";

export function classifyBoardTexture(board: Card[]): BoardTexture {
  const ranks = board.map((c) => rankToNumber(c.rank));
  const suits = board.map((c) => c.suit);

  const rankCounts: Record<number, number> = {};
  for (const r of ranks) rankCounts[r] = (rankCounts[r] ?? 0) + 1;
  if (Object.values(rankCounts).some((c) => c >= 2)) return "paired";

  if (new Set(suits).size === 1) return "monotone";

  const suitCounts: Record<string, number> = {};
  for (const s of suits) suitCounts[s] = (suitCounts[s] ?? 0) + 1;
  const hasFlushDraw = Object.values(suitCounts).some((c) => c >= 2);

  const sortedRanks = [...new Set(ranks)].sort((a, b) => a - b);
  let hasStraightDraw = false;
  outer: for (let i = 0; i < sortedRanks.length; i++) {
    for (let j = i + 1; j < sortedRanks.length; j++) {
      if ((sortedRanks[j] ?? 0) - (sortedRanks[i] ?? 0) <= 3) {
        hasStraightDraw = true;
        break outer;
      }
    }
  }

  if (hasFlushDraw && hasStraightDraw) return "wet";
  if (hasFlushDraw || hasStraightDraw) return "semi-wet";
  return "dry";
}

export function classifyHandStrength(
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
    if ((uniqueRanks[i + 3] ?? 0) - (uniqueRanks[i] ?? 0) <= 4) {
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

const fold: ChartEntry = { action: { type: "fold" } };
const check: ChartEntry = { action: { type: "check" } };
const call: ChartEntry = { action: { type: "call" } };
const callOrRaise: ChartEntry = {
  action: { type: "call" },
  acceptable: ["raise"],
};
const checkOrBet: ChartEntry = {
  action: { type: "check" },
  acceptable: ["bet"],
};
const foldOrCall: ChartEntry = {
  action: { type: "fold" },
  acceptable: ["call"],
};

function bet(
  sizeFracPot: number,
  acceptable?: Array<RelativeAction["type"]>,
): ChartEntry {
  return {
    action: { type: "bet", sizeFracPot },
    ...(acceptable ? { acceptable } : {}),
  };
}

function raise(
  multiplier: number,
  acceptable?: Array<RelativeAction["type"]>,
): ChartEntry {
  return {
    action: { type: "raise", multiplier },
    ...(acceptable ? { acceptable } : {}),
  };
}

export const POSTFLOP_DECISION_CHART: PostflopChart = {
  flop: {
    inPosition: {
      0: {
        dry: {
          monster: bet(0.67),
          strong: bet(0.67),
          medium: checkOrBet,
          draw: check,
          weak: check,
        },
        "semi-wet": {
          monster: bet(0.67),
          strong: bet(0.67),
          medium: check,
          draw: bet(0.5, ["check"]),
          weak: check,
        },
        wet: {
          monster: bet(0.75),
          strong: bet(0.67),
          medium: check,
          draw: bet(0.5, ["check"]),
          weak: check,
        },
        paired: {
          monster: bet(0.67),
          strong: bet(0.5, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        monotone: {
          monster: bet(0.67),
          strong: bet(0.5, ["check"]),
          medium: check,
          draw: bet(0.5, ["check"]),
          weak: check,
        },
      },
      1: {
        dry: {
          monster: raise(3),
          strong: { action: { type: "call" }, acceptable: ["raise"] },
          medium: fold,
          draw: foldOrCall,
          weak: fold,
        },
        "semi-wet": {
          monster: raise(3),
          strong: callOrRaise,
          medium: fold,
          draw: call,
          weak: fold,
        },
        wet: {
          monster: raise(3),
          strong: callOrRaise,
          medium: fold,
          draw: { action: { type: "call" }, acceptable: ["raise"] },
          weak: fold,
        },
        paired: {
          monster: raise(3),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: raise(3),
          strong: call,
          medium: fold,
          draw: callOrRaise,
          weak: fold,
        },
      },
      2: {
        dry: {
          monster: callOrRaise,
          strong: { action: { type: "call" }, acceptable: ["fold"] },
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: callOrRaise,
          strong: { action: { type: "fold" }, acceptable: ["call"] },
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
    },
    outOfPosition: {
      0: {
        dry: {
          monster: bet(0.67, ["check"]),
          strong: bet(0.5, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        "semi-wet": {
          monster: bet(0.67),
          strong: bet(0.5, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        wet: {
          monster: bet(0.75),
          strong: bet(0.67, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        paired: {
          monster: bet(0.67),
          strong: { action: { type: "check" }, acceptable: ["bet"] },
          medium: check,
          draw: check,
          weak: check,
        },
        monotone: {
          monster: bet(0.67),
          strong: { action: { type: "check" }, acceptable: ["bet"] },
          medium: check,
          draw: check,
          weak: check,
        },
      },
      1: {
        dry: {
          monster: raise(3),
          strong: callOrRaise,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: raise(3),
          strong: callOrRaise,
          medium: fold,
          draw: callOrRaise,
          weak: fold,
        },
        wet: {
          monster: raise(3),
          strong: call,
          medium: fold,
          draw: callOrRaise,
          weak: fold,
        },
        paired: {
          monster: raise(3),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: raise(3),
          strong: call,
          medium: fold,
          draw: call,
          weak: fold,
        },
      },
      2: {
        dry: {
          monster: callOrRaise,
          strong: { action: { type: "call" }, acceptable: ["fold"] },
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: callOrRaise,
          strong: foldOrCall,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
    },
  },
  turn: {
    inPosition: {
      0: {
        dry: {
          monster: bet(0.75),
          strong: bet(0.67),
          medium: check,
          draw: checkOrBet,
          weak: check,
        },
        "semi-wet": {
          monster: bet(0.75),
          strong: bet(0.67),
          medium: check,
          draw: bet(0.5, ["check"]),
          weak: check,
        },
        wet: {
          monster: bet(0.75),
          strong: bet(0.75),
          medium: check,
          draw: bet(0.5, ["check"]),
          weak: check,
        },
        paired: {
          monster: bet(0.75),
          strong: bet(0.5, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        monotone: {
          monster: bet(0.75),
          strong: bet(0.67, ["check"]),
          medium: check,
          draw: checkOrBet,
          weak: check,
        },
      },
      1: {
        dry: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: foldOrCall,
          weak: fold,
        },
        "semi-wet": {
          monster: raise(2.5),
          strong: callOrRaise,
          medium: fold,
          draw: call,
          weak: fold,
        },
        wet: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: call,
          weak: fold,
        },
        paired: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: foldOrCall,
          weak: fold,
        },
      },
      2: {
        dry: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
    },
    outOfPosition: {
      0: {
        dry: {
          monster: bet(0.75, ["check"]),
          strong: bet(0.67, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        "semi-wet": {
          monster: bet(0.75),
          strong: bet(0.67, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        wet: {
          monster: bet(0.75),
          strong: bet(0.75, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        paired: {
          monster: bet(0.75),
          strong: check,
          medium: check,
          draw: check,
          weak: check,
        },
        monotone: {
          monster: bet(0.75),
          strong: { action: { type: "check" }, acceptable: ["bet"] },
          medium: check,
          draw: check,
          weak: check,
        },
      },
      1: {
        dry: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: raise(2.5),
          strong: callOrRaise,
          medium: fold,
          draw: call,
          weak: fold,
        },
        wet: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: call,
          weak: fold,
        },
        paired: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: foldOrCall,
          weak: fold,
        },
      },
      2: {
        dry: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
    },
  },
  river: {
    inPosition: {
      0: {
        dry: {
          monster: bet(0.75),
          strong: bet(0.67),
          medium: check,
          draw: checkOrBet,
          weak: check,
        },
        "semi-wet": {
          monster: bet(1.0),
          strong: bet(0.75),
          medium: check,
          draw: checkOrBet,
          weak: check,
        },
        wet: {
          monster: bet(1.0),
          strong: bet(0.75),
          medium: check,
          draw: check,
          weak: check,
        },
        paired: {
          monster: bet(0.75),
          strong: bet(0.67, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        monotone: {
          monster: bet(1.0),
          strong: { action: { type: "check" }, acceptable: ["bet"] },
          medium: check,
          draw: check,
          weak: check,
        },
      },
      1: {
        dry: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: foldOrCall,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
      2: {
        dry: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
    },
    outOfPosition: {
      0: {
        dry: {
          monster: bet(0.75),
          strong: bet(0.67),
          medium: check,
          draw: check,
          weak: check,
        },
        "semi-wet": {
          monster: bet(1.0),
          strong: bet(0.75),
          medium: check,
          draw: check,
          weak: check,
        },
        wet: {
          monster: bet(1.0),
          strong: bet(0.75, ["check"]),
          medium: check,
          draw: check,
          weak: check,
        },
        paired: {
          monster: bet(0.75),
          strong: { action: { type: "check" }, acceptable: ["bet"] },
          medium: check,
          draw: check,
          weak: check,
        },
        monotone: {
          monster: bet(1.0),
          strong: check,
          medium: check,
          draw: check,
          weak: check,
        },
      },
      1: {
        dry: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: raise(2.5),
          strong: call,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: foldOrCall,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
      2: {
        dry: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        "semi-wet": {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        wet: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        paired: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
        monotone: {
          monster: callOrRaise,
          strong: fold,
          medium: fold,
          draw: fold,
          weak: fold,
        },
      },
    },
  },
};

export function lookupChartEntry(
  street: Street,
  inPosition: boolean,
  betCount: BetCount,
  texture: BoardTexture,
  strength: PostflopHandStrength,
): ChartEntry {
  return POSTFLOP_DECISION_CHART[street][
    inPosition ? "inPosition" : "outOfPosition"
  ][betCount][texture][strength];
}

export function resolveAction(
  action: RelativeAction,
  potBB: number,
  facingBetBB = 0,
): PostflopDecision {
  switch (action.type) {
    case "fold":
      return { type: "fold" };
    case "call":
      return { type: "call" };
    case "check":
      return { type: "check" };
    case "bet":
      return {
        type: "bet",
        sizeBB: Math.round(potBB * action.sizeFracPot * 2) / 2,
      };
    case "raise":
      return {
        type: "raise",
        sizeBB: Math.round(facingBetBB * action.multiplier * 2) / 2,
      };
  }
}

export function evaluateHeroAction(
  heroAction: PostflopDecision,
  entry: ChartEntry,
): EvaluationVerdict {
  if (heroAction.type === entry.action.type) return "correct";
  if (entry.acceptable?.includes(heroAction.type)) return "acceptable";
  return "incorrect";
}

const PREFLOP_ACTION_ORDER_ALL: Position[] = [
  "UTG",
  "UTG+1",
  "UTG+2",
  "LJ",
  "HJ",
  "CO",
  "BTN",
  "SB",
  "BB",
];

function simulatePreflopActions(
  tablePositions: Position[],
  activePlayers: Position[],
  rng: SeededRng,
): { actions: PreflopAction[]; startPotBB: number } {
  const ordered = PREFLOP_ACTION_ORDER_ALL.filter((p) =>
    tablePositions.includes(p),
  );
  const actions: PreflopAction[] = [];
  const contributions = new Map<Position, number>();
  let potBB = 0;

  if (ordered.includes("SB")) {
    actions.push({ position: "SB", action: "limp", sizeBB: 0.5 });
    contributions.set("SB", 0.5);
    potBB += 0.5;
  }
  if (ordered.includes("BB")) {
    actions.push({ position: "BB", action: "limp", sizeBB: 1 });
    contributions.set("BB", 1);
    potBB += 1;
  }

  const raiseSize = Math.round((rng.next() * 1.5 + 2.5) * 2) / 2;

  const nonBlinds = ordered.filter((p) => p !== "SB" && p !== "BB");
  const opener =
    nonBlinds.find((p) => activePlayers.includes(p)) ??
    (ordered.includes("SB") && activePlayers.includes("SB") ? "SB" : null);

  if (!opener) return { actions, startPotBB: potBB };

  const fullOrder = [
    ...nonBlinds,
    ...(ordered.includes("SB") ? (["SB"] as Position[]) : []),
    ...(ordered.includes("BB") ? (["BB"] as Position[]) : []),
  ];

  let hasRaised = false;

  for (const pos of fullOrder) {
    const isBlind = pos === "SB" || pos === "BB";
    if (isBlind && !hasRaised && pos !== opener) continue;

    if (pos === opener && !hasRaised) {
      const alreadyIn = contributions.get(pos) ?? 0;
      actions.push({ position: pos, action: "raise", sizeBB: raiseSize });
      potBB += raiseSize - alreadyIn;
      contributions.set(pos, raiseSize);
      hasRaised = true;
    } else if (!activePlayers.includes(pos)) {
      actions.push({ position: pos, action: "fold", sizeBB: null });
    } else if (hasRaised) {
      const alreadyIn = contributions.get(pos) ?? 0;
      potBB += raiseSize - alreadyIn;
      contributions.set(pos, raiseSize);
      actions.push({ position: pos, action: "limp", sizeBB: raiseSize });
    }
  }

  return { actions, startPotBB: potBB };
}

const POSITIONS_BY_TABLE_SIZE: Record<number, Position[]> = {
  3: ["BTN", "SB", "BB"],
  4: ["CO", "BTN", "SB", "BB"],
  5: ["HJ", "CO", "BTN", "SB", "BB"],
  6: ["LJ", "HJ", "CO", "BTN", "SB", "BB"],
};

const POSTFLOP_ACTION_ORDER: Position[] = [
  "SB",
  "BB",
  "UTG",
  "UTG+1",
  "UTG+2",
  "LJ",
  "HJ",
  "CO",
  "BTN",
];

export function generatePostflopPosition(seed?: number): PostflopPosition {
  const s = seed ?? (Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0;
  const rng = new SeededRng(s);

  const tableSize = rng.nextInt(3, 6);
  const positions = POSITIONS_BY_TABLE_SIZE[tableSize] ?? [];

  const heroIdx = rng.nextInt(0, tableSize - 1);
  const heroPosition: Position = positions[heroIdx] ?? "BTN";

  const deck = shuffleDeck(createDeck(), rng);
  const { dealt: holeDealt, remaining: r1 } = dealCards(deck, 2);
  const holeCards = holeDealt as [Card, Card];
  const { remaining: r2 } = dealCards(r1, (tableSize - 1) * 2);
  const { dealt: boardDealt } = dealCards(r2, 3);
  const board = boardDealt as [Card, Card, Card];

  const numActive = rng.nextInt(2, Math.min(tableSize, 4) + 1);
  const others = positions.filter((p) => p !== heroPosition);
  for (let i = others.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i + 1);
    const a = others[i];
    const b = others[j];
    if (a !== undefined && b !== undefined) {
      others[i] = b;
      others[j] = a;
    }
  }
  const activeOthersSet = new Set(others.slice(0, numActive - 1));
  const activePlayers = positions.filter(
    (p) => p === heroPosition || activeOthersSet.has(p),
  );

  const stackMap = new Map<Position, number>();
  for (const p of positions) {
    stackMap.set(p, rng.nextInt(20, 120));
  }

  const seats: PlayerSeat[] = positions.map((pos) => ({
    position: pos,
    stackBB: stackMap.get(pos) ?? 0,
    isHero: pos === heroPosition,
    hasFolded: !activePlayers.includes(pos),
  }));

  const { actions: preflopActions, startPotBB } = simulatePreflopActions(
    positions,
    activePlayers,
    rng,
  );
  const effectiveStackBB = Math.min(
    ...activePlayers.map((p) => stackMap.get(p) ?? 0),
  );

  const actionOrder = POSTFLOP_ACTION_ORDER.filter((p) =>
    activePlayers.includes(p),
  );
  const heroActionIdx = actionOrder.indexOf(heroPosition);
  const heroInPosition = heroActionIdx === actionOrder.length - 1;

  const actionHistory: PostflopStreetAction[] = [];
  let currentPot = startPotBB;
  let currentBetCount: BetCount = 0;
  let facingBetBB = 0;
  const foldedDuringStreet = new Set<Position>();

  for (let i = 0; i < heroActionIdx; i++) {
    const actor = actionOrder[i];
    if (actor === undefined) continue;
    if (foldedDuringStreet.has(actor)) continue;

    if (currentBetCount === 0) {
      if (rng.next() < 0.45) {
        const betSize =
          Math.round(currentPot * (rng.next() * 0.42 + 0.33) * 2) / 2;
        actionHistory.push({ actor, type: "bet", sizeBB: betSize });
        currentPot += betSize;
        facingBetBB = betSize;
        currentBetCount = 1;
      } else {
        actionHistory.push({ actor, type: "check" });
      }
    } else if (currentBetCount === 1) {
      const r = rng.next();
      if (r < 0.35) {
        actionHistory.push({ actor, type: "fold" });
        foldedDuringStreet.add(actor);
      } else if (r < 0.8) {
        actionHistory.push({ actor, type: "call" });
        currentPot += facingBetBB;
      } else {
        const raiseSize = Math.round(facingBetBB * (rng.next() + 2) * 2) / 2;
        actionHistory.push({ actor, type: "raise", sizeBB: raiseSize });
        currentPot += raiseSize;
        facingBetBB = raiseSize;
        currentBetCount = 2;
      }
    } else {
      if (rng.next() < 0.5) {
        actionHistory.push({ actor, type: "fold" });
        foldedDuringStreet.add(actor);
      } else {
        actionHistory.push({ actor, type: "call" });
        currentPot += facingBetBB;
      }
    }
  }

  return {
    id: `postflop-${s}`,
    seed: s,
    street: "flop",
    holeCards,
    board,
    seats,
    activePlayers,
    heroPosition,
    heroInPosition,
    potBB: currentPot,
    effectiveStackBB,
    preflopActions,
    actionHistory,
    betCount: currentBetCount,
    facingBetBB,
  };
}
