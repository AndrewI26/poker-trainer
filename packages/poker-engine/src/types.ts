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

export interface PreflopScenario {
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
