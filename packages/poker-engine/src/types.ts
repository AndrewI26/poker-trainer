export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "T"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export type HoleCards = [Card, Card];

export type Position =
  | "UTG"
  | "UTG+1"
  | "UTG+2"
  | "LJ"
  | "HJ"
  | "CO"
  | "BTN"
  | "SB"
  | "BB";

export type TableSize = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface BlindStructure {
  smallBlind: number;
  bigBlind: number;
  ante: number;
}

export interface PlayerSeat {
  position: Position;
  stackBB: number;
  isHero: boolean;
  hasFolded: boolean;
}

export type ActionType = "fold" | "limp" | "raise" | "reraise" | "allin";

export interface PreflopAction {
  position: Position;
  action: ActionType;
  sizeBB: number | null;
}

export interface PotState {
  potBB: number;
  callAmountBB: number;
  facingRaiseSizeBB: number | null;
  numCallers: number;
  numRaisers: number;
}

export interface TableScenario {
  tableSize: TableSize;
  heroPosition: Position;
  holeCards: HoleCards;
  blindStructure: BlindStructure;
  seats: PlayerSeat[];
  actionsBefore: PreflopAction[];
  potState: PotState;
}

export interface PreflopScenario extends TableScenario {
  id: string;
  seed: number;
  tableSize: TableSize;
  heroPosition: Position;
  heroStackBB: number;
  holeCards: HoleCards;
  blindStructure: BlindStructure;
  seats: PlayerSeat[];
  actionsBefore: PreflopAction[];
  potState: PotState;
  effectiveStackBB: number;
}

export type Decision =
  | { type: "fold" }
  | { type: "call" }
  | { type: "raise"; sizeBB: number }
  | { type: "allin" };

export type HandCategory =
  | "premium"
  | "strong"
  | "speculative"
  | "marginal"
  | "weak";

export type HandTexture =
  | "pocket-pair"
  | "suited-connector"
  | "suited-gapper"
  | "offsuit-connector"
  | "suited-ace"
  | "offsuit-broadways"
  | "other";

export interface HandProfile {
  category: HandCategory;
  texture: HandTexture;
  isSuited: boolean;
  isConnected: boolean;
  gap: number;
  highCard: Rank;
  pairRank: Rank | null;
}

export type EvaluationVerdict = "correct" | "acceptable" | "incorrect";

export interface EvaluationResult {
  verdict: EvaluationVerdict;
  explanation: string;
  recommendedAction: Decision;
  handCategory: HandCategory;
  reasoning: {
    positionAdvantage: "in-position" | "out-of-position" | "neutral";
    potOdds: number | null;
    effectiveSPR: number;
    facingPressure: "open" | "single-raise" | "three-bet" | "four-bet-plus";
  };
}

export interface ScenarioGeneratorOptions {
  seed?: number;
  tableSize?: TableSize;
  heroPosition?: Position;
}

export type Street = "flop" | "turn" | "river";

export type PostflopDecision =
  | { type: "fold" }
  | { type: "call" }
  | { type: "check" }
  | { type: "bet"; sizeBB: number }
  | { type: "raise"; sizeBB: number };

export type PostflopHandStrength =
  | "monster"
  | "strong"
  | "medium"
  | "draw"
  | "weak";

export type BoardTexture = "dry" | "semi-wet" | "wet" | "paired" | "monotone";

export type BetCount = 0 | 1 | 2;

export type RelativeAction =
  | { type: "fold" }
  | { type: "call" }
  | { type: "check" }
  | { type: "bet"; sizeFracPot: number }
  | { type: "raise"; multiplier: number };

export interface ChartEntry {
  action: RelativeAction;
  acceptable?: Array<RelativeAction["type"]>;
}

export type PostflopChart = Record<
  Street,
  Record<
    "inPosition" | "outOfPosition",
    Record<
      BetCount,
      Record<BoardTexture, Record<PostflopHandStrength, ChartEntry>>
    >
  >
>;

export type PostflopStreetAction =
  | { actor: Position; type: "check" }
  | { actor: Position; type: "bet"; sizeBB: number }
  | { actor: Position; type: "raise"; sizeBB: number }
  | { actor: Position; type: "call" }
  | { actor: Position; type: "fold" };

export interface PostflopPosition {
  id: string;
  seed: number;
  street: Street;
  holeCards: HoleCards;
  board: Card[];
  seats: PlayerSeat[];
  activePlayers: Position[];
  heroPosition: Position;
  heroInPosition: boolean;
  potBB: number;
  effectiveStackBB: number;
  preflopActions: PreflopAction[];
  actionHistory: PostflopStreetAction[];
  betCount: BetCount;
  facingBetBB: number;
}
