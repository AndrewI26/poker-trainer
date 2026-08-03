import { getPositionAdvantage, recommendAction } from "./evaluator";
import { classifyHand } from "./hands";
import { ACTION_ORDER_BY_SIZE } from "./scenario";
import type {
  Decision,
  FacingPressure,
  HoleCards,
  Position,
  Rank,
  RecommendationContext,
  TableSize,
} from "./types";

export const MATRIX_RANKS = Object.freeze([
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
] as const satisfies readonly Rank[]);

export type ChartAction = "raise" | "allin" | "call" | "fold";

export interface RangeChartCell {
  hand: string;
  action: ChartAction;
  sizeBB: number | null;
  combos: number;
  isPair: boolean;
  isSuited: boolean;
}

export interface PreflopRangeChart {
  tableSize: TableSize;
  heroPosition: Position;
  context: RecommendationContext;
  ranks: readonly Rank[];
  grid: RangeChartCell[][];
  combosByAction: Record<ChartAction, number>;
  totalCombos: number;
  rangePercent: number;
}

export interface RangeChartOptions {
  tableSize: TableSize;
  heroPosition: Position;
  pressure?: FacingPressure;
  heroStackBB?: number;
  potBB?: number;
  callAmountBB?: number;
  facingRaiseSizeBB?: number | null;
}

export function positionsForTableSize(
  tableSize: TableSize,
): readonly Position[] {
  return ACTION_ORDER_BY_SIZE[tableSize];
}

export function isPositionAtTable(
  position: Position,
  tableSize: TableSize,
): boolean {
  return positionsForTableSize(tableSize).includes(position);
}

export function handNotation(row: number, col: number): string {
  const high = MATRIX_RANKS[Math.min(row, col)];
  const low = MATRIX_RANKS[Math.max(row, col)];
  if (row === col) return `${high}${low}`;
  return `${high}${low}${row < col ? "s" : "o"}`;
}

export function toHandNotation(cards: HoleCards): string {
  const [a, b] = cards;
  const indexA = MATRIX_RANKS.indexOf(a.rank);
  const indexB = MATRIX_RANKS.indexOf(b.rank);
  const highIndex = Math.min(indexA, indexB);
  const lowIndex = Math.max(indexA, indexB);
  if (a.rank === b.rank) return `${a.rank}${b.rank}`;
  const suited = a.suit === b.suit;
  return `${MATRIX_RANKS[highIndex]}${MATRIX_RANKS[lowIndex]}${suited ? "s" : "o"}`;
}

function representativeHand(row: number, col: number): HoleCards {
  const high = MATRIX_RANKS[Math.min(row, col)];
  const low = MATRIX_RANKS[Math.max(row, col)];
  const suited = row < col;
  return [
    { rank: high, suit: "spades" },
    { rank: low, suit: suited ? "spades" : "hearts" },
  ];
}

function comboCount(row: number, col: number): number {
  if (row === col) return 6;
  return row < col ? 4 : 12;
}

const DEFAULT_POT_BY_PRESSURE: Record<
  FacingPressure,
  { potBB: number; callAmountBB: number; facingRaiseSizeBB: number | null }
> = {
  open: { potBB: 1.5, callAmountBB: 1, facingRaiseSizeBB: null },
  "single-raise": { potBB: 4.5, callAmountBB: 3, facingRaiseSizeBB: 3 },
  "three-bet": { potBB: 13.5, callAmountBB: 9, facingRaiseSizeBB: 9 },
  "four-bet-plus": { potBB: 35.5, callAmountBB: 22, facingRaiseSizeBB: 22 },
};

function chartAction(decision: Decision): ChartAction {
  return decision.type;
}

function decisionSize(decision: Decision): number | null {
  return decision.type === "raise" ? decision.sizeBB : null;
}

export function buildRangeChart(options: RangeChartOptions): PreflopRangeChart {
  const pressure = options.pressure ?? "open";
  const defaults = DEFAULT_POT_BY_PRESSURE[pressure];

  const context: RecommendationContext = {
    pressure,
    positionAdvantage: getPositionAdvantage(options.heroPosition),
    heroStackBB: options.heroStackBB ?? 100,
    potBB: options.potBB ?? defaults.potBB,
    callAmountBB: options.callAmountBB ?? defaults.callAmountBB,
    facingRaiseSizeBB:
      options.facingRaiseSizeBB === undefined
        ? defaults.facingRaiseSizeBB
        : options.facingRaiseSizeBB,
  };

  const combosByAction: Record<ChartAction, number> = {
    raise: 0,
    allin: 0,
    call: 0,
    fold: 0,
  };
  let totalCombos = 0;

  const grid = MATRIX_RANKS.map((_, row) =>
    MATRIX_RANKS.map((__, col) => {
      const profile = classifyHand(representativeHand(row, col));
      const decision = recommendAction(
        context,
        profile.category,
        profile.pairRank,
      );
      const action = chartAction(decision);
      const combos = comboCount(row, col);

      combosByAction[action] += combos;
      totalCombos += combos;

      return {
        hand: handNotation(row, col),
        action,
        sizeBB: decisionSize(decision),
        combos,
        isPair: row === col,
        isSuited: row < col,
      };
    }),
  );

  return {
    tableSize: options.tableSize,
    heroPosition: options.heroPosition,
    context,
    ranks: MATRIX_RANKS,
    grid,
    combosByAction,
    totalCombos,
    rangePercent:
      totalCombos === 0 ? 0 : (1 - combosByAction.fold / totalCombos) * 100,
  };
}
