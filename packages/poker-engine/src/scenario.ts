import { createDeck, dealCards, shuffleDeck } from "./deck";
import { SeededRng } from "./rng";
import type {
  BlindStructure,
  HoleCards,
  PlayerSeat,
  Position,
  PotState,
  PreflopAction,
  PreflopScenario,
  ScenarioGeneratorOptions,
  TableSize,
} from "./types";

export const ACTION_ORDER_BY_SIZE = Object.freeze({
  2: Object.freeze(["SB", "BB"] as const),
  3: Object.freeze(["BTN", "SB", "BB"] as const),
  4: Object.freeze(["CO", "BTN", "SB", "BB"] as const),
  5: Object.freeze(["HJ", "CO", "BTN", "SB", "BB"] as const),
  6: Object.freeze(["LJ", "HJ", "CO", "BTN", "SB", "BB"] as const),
  7: Object.freeze(["UTG", "LJ", "HJ", "CO", "BTN", "SB", "BB"] as const),
  8: Object.freeze([
    "UTG",
    "UTG+1",
    "LJ",
    "HJ",
    "CO",
    "BTN",
    "SB",
    "BB",
  ] as const),
  9: Object.freeze([
    "UTG",
    "UTG+1",
    "UTG+2",
    "LJ",
    "HJ",
    "CO",
    "BTN",
    "SB",
    "BB",
  ] as const),
} satisfies Record<TableSize, readonly Position[]>);

export const ACTION_ORDER = Object.freeze([
  "UTG",
  "UTG+1",
  "UTG+2",
  "LJ",
  "HJ",
  "CO",
  "BTN",
  "SB",
  "BB",
] as const satisfies readonly Position[]);

function actionOrder(tableSize: TableSize): readonly Position[] {
  return ACTION_ORDER_BY_SIZE[tableSize];
}

function randomStackBB(rng: SeededRng): number {
  const roll = rng.next();
  if (roll < 0.2) return rng.nextInt(15, 40); // short
  if (roll < 0.6) return rng.nextInt(40, 100); // standard
  return rng.nextInt(100, 150); // deep
}

function simulateActionsBefore(
  tableSize: TableSize,
  heroPosition: Position,
  stacks: Map<Position, number>,
  rng: SeededRng,
): PreflopAction[] {
  const order = actionOrder(tableSize);
  const heroIndex = order.indexOf(heroPosition);
  const actingBefore = order.slice(0, heroIndex);

  const actions: PreflopAction[] = [];
  let numRaisers = 0;
  let lastRaiseBB = 0;

  for (const pos of actingBefore) {
    const stack = stacks.get(pos) ?? 100;
    const roll = rng.next();

    if (numRaisers === 0) {
      // Unopened pot: fold, limp, or open-raise
      if (roll < 0.45) {
        actions.push({ position: pos, action: "fold", sizeBB: null });
      } else if (roll < 0.55) {
        actions.push({ position: pos, action: "limp", sizeBB: 1 });
      } else {
        const size = stack < 20 ? stack : rng.next() < 0.5 ? 2.5 : 3;
        actions.push({ position: pos, action: "raise", sizeBB: size });
        numRaisers++;
        lastRaiseBB = size;
      }
    } else if (numRaisers === 1) {
      // Facing one raise: fold, call, or 3-bet
      if (roll < 0.6) {
        actions.push({ position: pos, action: "fold", sizeBB: null });
      } else if (roll < 0.85) {
        actions.push({ position: pos, action: "limp", sizeBB: lastRaiseBB });
      } else {
        const size = stack < 20 ? stack : lastRaiseBB * 3;
        actions.push({ position: pos, action: "reraise", sizeBB: size });
        numRaisers++;
        lastRaiseBB = size;
      }
    } else {
      // Facing 3-bet+: mostly fold, occasionally call or 4-bet
      if (roll < 0.75) {
        actions.push({ position: pos, action: "fold", sizeBB: null });
      } else if (roll < 0.9) {
        actions.push({ position: pos, action: "limp", sizeBB: lastRaiseBB });
      } else {
        actions.push({ position: pos, action: "allin", sizeBB: stack });
        numRaisers++;
        lastRaiseBB = stack;
      }
    }
  }

  return actions;
}

function computePotState(
  actions: PreflopAction[],
  blindStructure: BlindStructure,
): PotState {
  let potBB = blindStructure.smallBlind / blindStructure.bigBlind + 1; // SB + BB
  let callAmountBB = 1; // cost to call the BB minimum
  let facingRaiseSizeBB: number | null = null;
  let numCallers = 0;
  let numRaisers = 0;

  for (const action of actions) {
    if (action.action === "fold") continue;
    if (action.action === "limp" && action.sizeBB !== null) {
      potBB += action.sizeBB;
      numCallers++;
    } else if (
      (action.action === "raise" ||
        action.action === "reraise" ||
        action.action === "allin") &&
      action.sizeBB !== null
    ) {
      potBB += action.sizeBB;
      facingRaiseSizeBB = action.sizeBB;
      callAmountBB = action.sizeBB;
      numRaisers++;
      numCallers = 0;
    }
  }

  return { potBB, callAmountBB, facingRaiseSizeBB, numCallers, numRaisers };
}

export function generateScenario(
  options?: ScenarioGeneratorOptions,
): PreflopScenario {
  const seed =
    options?.seed ?? (Date.now() ^ Math.floor(Math.random() * 2 ** 32)) >>> 0;
  const rng = new SeededRng(seed);

  const tableSize: TableSize = options?.tableSize ?? 6;

  const positions = ACTION_ORDER_BY_SIZE[tableSize];
  const heroPosition: Position =
    options?.heroPosition ?? rng.nextFrom(positions);

  const stacks = new Map<Position, number>();
  for (const pos of positions) {
    stacks.set(pos, randomStackBB(rng));
  }
  const heroStackBB = stacks.get(heroPosition) ?? 100;

  const deck = shuffleDeck(createDeck(), rng);
  const { dealt } = dealCards(deck, 2);
  const holeCards = dealt as HoleCards;

  const blindStructure: BlindStructure = {
    smallBlind: 50,
    bigBlind: 100,
    ante: 0,
  };

  const actionsBefore = simulateActionsBefore(
    tableSize,
    heroPosition,
    stacks,
    rng,
  );
  const potState = computePotState(actionsBefore, blindStructure);

  const activeOpponents = positions
    .filter((p) => p !== heroPosition)
    .filter((p) => {
      const action = actionsBefore.find((a) => a.position === p);
      return action?.action !== "fold";
    });

  const effectiveStackBB = Math.min(
    heroStackBB,
    ...activeOpponents.map((p) => stacks.get(p) ?? heroStackBB),
  );

  const seats: PlayerSeat[] = positions.map((pos) => ({
    position: pos,
    stackBB: stacks.get(pos) ?? 100,
    isHero: pos === heroPosition,
    hasFolded: actionsBefore.find((a) => a.position === pos)?.action === "fold",
  }));

  const id = `${seed}-${tableSize}-${heroPosition}`;

  return {
    id,
    seed,
    tableSize,
    heroPosition,
    heroStackBB,
    holeCards,
    blindStructure,
    seats,
    actionsBefore,
    potState,
    effectiveStackBB,
  };
}
