import type {
  HandCategory,
  HandProfile,
  HandTexture,
  HoleCards,
  Rank,
} from "./types";

export function rankToNumber(rank: Rank): number {
  const map: Record<Rank, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    T: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return map[rank];
}

export function isPocketPair(cards: HoleCards): boolean {
  return cards[0].rank === cards[1].rank;
}

export function isSuited(cards: HoleCards): boolean {
  return cards[0].suit === cards[1].suit;
}

export function classifyHand(cards: HoleCards): HandProfile {
  const [a, b] = cards;
  const suited = isSuited(cards);
  const pair = isPocketPair(cards);

  const rankA = rankToNumber(a.rank);
  const rankB = rankToNumber(b.rank);
  const high = rankA >= rankB ? a.rank : b.rank;
  const low = rankA < rankB ? a.rank : b.rank;
  const highN = Math.max(rankA, rankB);
  const lowN = Math.min(rankA, rankB);
  const gap = pair ? 0 : highN - lowN - 1;
  const connected = gap === 0;

  let texture: HandTexture;
  if (pair) texture = "pocket-pair";
  else if (low === "A" || high === "A")
    texture = suited ? "suited-ace" : "other";
  else if (suited && connected) texture = "suited-connector";
  else if (suited && gap === 1) texture = "suited-gapper";
  else if (!suited && connected) texture = "offsuit-connector";
  else if (highN >= 10 && lowN >= 10)
    texture = suited ? "suited-connector" : "offsuit-broadways";
  else texture = "other";

  const category = getCategory(high, low, suited, pair, highN, lowN);

  return {
    category,
    texture,
    isSuited: suited,
    isConnected: connected,
    gap,
    highCard: high,
    pairRank: pair ? high : null,
  };
}

function getCategory(
  high: Rank,
  low: Rank,
  suited: boolean,
  pair: boolean,
  highN: number,
  lowN: number,
): HandCategory {
  // Premium: AA, KK, QQ, AKs, AKo
  if (pair && highN >= 12) return "premium";
  if (high === "A" && low === "K") return "premium";

  // Strong: JJ, TT, AQs, AQo, AJs, ATs, KQs, KJs
  if (pair && highN >= 10) return "strong";
  if (high === "A" && low === "Q") return "strong";
  if (high === "A" && low === "J") return "strong";
  if (high === "A" && low === "T" && suited) return "strong";
  if (high === "K" && low === "Q" && suited) return "strong";
  if (high === "K" && low === "J" && suited) return "strong";

  // Speculative: 99–55, suited connectors 54s+, KQo, QJs, JTs, KJo
  if (pair && highN >= 5) return "speculative";
  if (suited && highN >= 5 && lowN >= 4 && highN - lowN === 1)
    return "speculative";
  if (high === "K" && low === "Q") return "speculative";
  if (high === "K" && low === "J") return "speculative";
  if (high === "Q" && low === "J" && suited) return "speculative";
  if (high === "J" && low === "T" && suited) return "speculative";
  if (suited && highN >= 7 && highN - lowN <= 2) return "speculative";

  // Marginal: 22–44, A2s–A9s, weak offsuit broadways
  if (pair) return "marginal";
  if (high === "A" && suited) return "marginal";
  if (highN >= 10 && lowN >= 9) return "marginal";

  return "weak";
}
