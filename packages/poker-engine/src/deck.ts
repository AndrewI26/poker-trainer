import type { SeededRng } from "./rng";
import type { Card, Rank, Suit } from "./types";

const SUITS = Object.freeze([
  "spades",
  "hearts",
  "diamonds",
  "clubs",
] as const satisfies readonly Suit[]);
const RANKS = Object.freeze([
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
] as const satisfies readonly Rank[]);

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[], rng: SeededRng): Card[] {
  return rng.shuffle(deck);
}

export function dealCards(
  deck: Card[],
  count: number,
): { dealt: Card[]; remaining: Card[] } {
  return {
    dealt: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
