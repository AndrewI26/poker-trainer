import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ACTION_ORDER_BY_SIZE,
  type Card,
  type HoleCards,
  type PlayerSeat,
  type PreflopAction,
  type Suit,
  type TableScenario,
} from "@poker-trainer/poker-engine";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Text, useWindowDimensions, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const TABLE_GREEN = "#041209";
const TABLE_BORDER = "#0f2215";
export const TOKEN_SIZE = 48;
const CARDS_REVEAL_DELAY_MS = 500;
const TOKEN_SLOT_W = TOKEN_SIZE + 32;
const TOKEN_SLOT_H = TOKEN_SIZE + 60;
const CIRCLE_SCALE = 1;
const ARC_HEIGHT_RATIO = CIRCLE_SCALE / 2;
const EDGE_MARGIN = 12;
const COMMUNITY_CARD_W_RATIO = 0.16;

function suitColor(suit: Suit) {
  if (suit === "hearts" || suit === "diamonds") return "#cc0000";
  return "#111111";
}

function suitIcon(suit: Suit): keyof typeof MaterialCommunityIcons.glyphMap {
  if (suit === "hearts") return "cards-heart";
  if (suit === "diamonds") return "cards-diamond";
  if (suit === "clubs") return "cards-club";
  return "cards-spade";
}

function ChipBet({ action }: { action: PreflopAction }) {
  if (action.action === "fold" || action.sizeBB == null) return null;
  const amount = action.sizeBB;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        marginTop: 4,
      }}
    >
      <View style={{ width: 16, height: 20, justifyContent: "flex-end" }}>
        {[0, 1, 2].map((i) => (
          <MaterialCommunityIcons
            key={i}
            name="poker-chip"
            size={16}
            color={i === 2 ? theme.palette.gold[400] : theme.palette.gold[600]}
            style={{
              position: "absolute",
              bottom: i * 4,
              transform: [{ scaleY: 0.35 }],
            }}
          />
        ))}
      </View>
      <Text
        style={{
          fontFamily: theme.fontFamily.bold,
          fontSize: theme.fontSize.xs,
          color: theme.palette.gold[500],
        }}
      >
        {amount % 1 === 0 ? `${amount}BB` : `${amount.toFixed(1)}BB`}
      </Text>
    </View>
  );
}

function HeroCards({
  holeCards,
  trigger,
}: {
  holeCards: HoleCards;
  trigger: number;
}) {
  const translateY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (trigger === 0) {
      hasAnimated.current = false;
      translateY.setValue(-40);
      opacity.setValue(0);
      return;
    }
    if (hasAnimated.current) return;
    hasAnimated.current = true;
    translateY.setValue(-40);
    opacity.setValue(0);
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 12,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, CARDS_REVEAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, [trigger, translateY, opacity]);

  return (
    <View style={{ flexDirection: "row", gap: 3, marginTop: 16 }}>
      {holeCards.map((card) => (
        <View
          key={`${card.rank}${card.suit}`}
          style={{ width: 34, height: 46 }}
        >
          <View
            style={{
              position: "absolute",
              width: 34,
              height: 46,
              borderRadius: theme.borderRadius.xs,
              backgroundColor: "rgba(255,255,255,0.07)",
              borderWidth: 1.5,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          />
          <Animated.View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: theme.borderRadius.xs,
              borderWidth: 1,
              borderColor: "#e5e5e5",
              paddingHorizontal: 7,
              paddingVertical: 5,
              alignItems: "center",
              opacity,
              transform: [{ translateY }],
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.h6,
                color: suitColor(card.suit),
                lineHeight: theme.fontSize.h6 * 1.1,
              }}
            >
              {card.rank}
            </Text>
            <MaterialCommunityIcons
              name={suitIcon(card.suit)}
              size={14}
              color={suitColor(card.suit)}
            />
          </Animated.View>
        </View>
      ))}
    </View>
  );
}

function PlayerToken({
  seat,
  action,
  holeCards,
  cardsTrigger,
  suppressBet,
}: {
  seat: PlayerSeat;
  action: PreflopAction | null;
  holeCards: HoleCards;
  cardsTrigger?: number;
  suppressBet?: boolean;
}) {
  const { t } = useTheme();
  const isHero = seat.isHero;
  const avatarBg = isHero ? t.accent.blue : t.assets.bgCardSecondary;
  const avatarBorder = isHero ? t.accent.blue : t.assets.strokeInactive;

  return (
    <View style={{ alignItems: "center", width: TOKEN_SIZE + 24 }}>
      <View
        style={{
          width: TOKEN_SIZE,
          height: TOKEN_SIZE,
          borderRadius: TOKEN_SIZE / 2,
          backgroundColor: avatarBg,
          borderWidth: 2,
          borderColor: avatarBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.xs,
            color: isHero ? "#fff" : t.assets.subtext,
          }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {seat.position}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: theme.fontFamily.regular,
          fontSize: theme.fontSize.xs,
          color: t.assets.subtext,
          marginTop: 2,
        }}
      >
        {seat.stackBB}BB
      </Text>

      {action && !suppressBet && <ChipBet action={action} />}

      {isHero && (
        <HeroCards holeCards={holeCards} trigger={cardsTrigger ?? 0} />
      )}
    </View>
  );
}

export function PokerTable({
  scenario,
  revealedCount,
  blindRevealedCount,
  cardsTrigger,
  communityCards,
  heroAction,
}: {
  scenario: TableScenario;
  revealedCount: number;
  blindRevealedCount: number;
  cardsTrigger: number;
  communityCards?: Card[];
  heroAction?: PreflopAction | null;
}) {
  const { width } = useWindowDimensions();

  const circleD = width * CIRCLE_SCALE;
  const circleR = circleD / 2;
  const circleLeft = -(circleD - width) / 2;

  const arcH = width * ARC_HEIGHT_RATIO;

  const screenCX = width / 2;
  const screenCY = circleR;

  const playerArcR = circleR - TOKEN_SIZE / 2;

  const maxHalfSpread = Math.asin(
    Math.min(1, (screenCX - TOKEN_SLOT_W / 2 - EDGE_MARGIN) / playerArcR),
  );
  const spreadRad = maxHalfSpread * 2;

  const { seats, actionsBefore, holeCards, potState } = scenario;
  const heroSeat = seats.find((s) => s.isHero) ?? seats[seats.length - 1];

  const tablePositions = ACTION_ORDER_BY_SIZE[
    scenario.tableSize
  ] as readonly string[];
  const btnIdx = tablePositions.indexOf("BTN");
  const clockwiseFromBtn = [
    ...tablePositions.slice(btnIdx),
    ...tablePositions.slice(0, btnIdx),
  ];
  const heroIdx = clockwiseFromBtn.indexOf(scenario.heroPosition);
  const nonHeroClockwise: PlayerSeat[] = Array.from(
    { length: clockwiseFromBtn.length - 1 },
    (_, i) => {
      const pos = clockwiseFromBtn[(heroIdx + 1 + i) % clockwiseFromBtn.length];
      return seats.find((s) => s.position === pos);
    },
  ).filter((s): s is PlayerSeat => s !== undefined);
  const nonHero = nonHeroClockwise;
  const actingSeats = nonHero.filter((s) =>
    actionsBefore.some((a) => a.position === s.position),
  );
  const positions = nonHero.map((seat, i) => {
    const t = nonHero.length === 1 ? 0.5 : i / (nonHero.length - 1);
    const angle = -Math.PI / 2 - spreadRad / 2 + t * spreadRad;
    const x = screenCX + playerArcR * Math.cos(angle);
    const y = screenCY + playerArcR * Math.sin(angle);
    return { seat, x, y };
  });

  const lowestPlayerY = positions.length
    ? Math.max(...positions.map((p) => p.y))
    : arcH * 0.72;
  const communityCardsTop = lowestPlayerY + TOKEN_SLOT_H / 2 + theme.spacing.lg;
  const communityCardW = width * COMMUNITY_CARD_W_RATIO;
  const communityCardH = communityCardW * (50 / 36);

  const topPad = 40;
  const rectExtH = TOKEN_SLOT_H + 300;

  return (
    <View style={{ width, flex: 1 }}>
      <View
        style={{
          position: "absolute",
          top: topPad,
          left: circleLeft,
          width: circleD,
          height: arcH + 8,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: circleD,
            height: circleD,
            borderRadius: circleR,
            backgroundColor: TABLE_GREEN,
            borderWidth: 8,
            borderColor: TABLE_BORDER,
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            width: circleD - 12,
            height: circleD - 12,
            borderRadius: circleR - 6,
            borderWidth: 2,
            borderColor: TABLE_BORDER,
            backgroundColor: "transparent",
          }}
        />
      </View>

      <LinearGradient
        colors={[TABLE_BORDER, "transparent"]}
        style={{
          position: "absolute",
          top: topPad + arcH,
          left: circleLeft,
          width: 8,
          height: rectExtH,
        }}
      />
      <LinearGradient
        colors={[TABLE_BORDER, "transparent"]}
        style={{
          position: "absolute",
          top: topPad + arcH,
          left: circleLeft + circleD - 8,
          width: 8,
          height: rectExtH,
        }}
      />
      <LinearGradient
        colors={[TABLE_GREEN, "transparent"]}
        style={{
          position: "absolute",
          top: topPad + arcH,
          left: circleLeft + 8,
          width: circleD - 16,
          height: rectExtH,
        }}
      />

      <View
        style={{
          position: "absolute",
          top: topPad + communityCardsTop,
          width: "100%",
          paddingHorizontal: 15,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {["c1", "c2", "c3", "c4", "c5"].map((id, i) => {
          const card = communityCards?.[i];
          return card ? (
            <View
              key={id}
              style={{
                width: communityCardW,
                height: communityCardH,
                borderRadius: 5,
                backgroundColor: "#ffffff",
                borderWidth: 1,
                borderColor: "#e5e5e5",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.fontSize.body,
                  color: suitColor(card.suit),
                  lineHeight: theme.fontSize.body * 1.1,
                  includeFontPadding: false,
                }}
              >
                {card.rank}
              </Text>
              <MaterialCommunityIcons
                name={suitIcon(card.suit)}
                size={14}
                color={suitColor(card.suit)}
              />
            </View>
          ) : (
            <View
              key={id}
              style={{
                width: communityCardW,
                height: communityCardH,
                borderRadius: 5,
                backgroundColor: "rgba(255, 255, 255, 0.01)",
                borderWidth: 1.5,
                borderColor: "rgba(255, 255, 255, 0.03)",
              }}
            />
          );
        })}
      </View>

      <View
        style={{
          position: "absolute",
          top: topPad + arcH * 0.42,
          left: width / 2 - 40,
          width: 80,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.xs,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          POT
        </Text>
        <Text
          style={{
            fontFamily: theme.fontFamily.bold,
            fontSize: theme.fontSize.h5,
            color: "rgba(255,255,255,0.9)",
          }}
        >
          {potState.potBB.toFixed(1)}BB
        </Text>
      </View>

      {positions.map(({ seat, x, y }) => {
        const sbBB = scenario.blindStructure.bigBlind;
        const blindAction: PreflopAction | null =
          seat.position === "SB" && blindRevealedCount >= 1
            ? {
                position: "SB",
                action: "limp",
                sizeBB: scenario.blindStructure.smallBlind / sbBB,
              }
            : seat.position === "BB" && blindRevealedCount >= 2
              ? { position: "BB", action: "limp", sizeBB: 1 }
              : null;

        const clockwiseRevealIndex = actingSeats.findIndex(
          (s) => s.position === seat.position,
        );
        const acted = actionsBefore.find((a) => a.position === seat.position);
        const revealed =
          clockwiseRevealIndex >= 0 && clockwiseRevealIndex < revealedCount;
        const displayAction = revealed && acted ? acted : blindAction;

        return (
          <View
            key={seat.position}
            style={{
              position: "absolute",
              left: x - TOKEN_SLOT_W / 2,
              top: topPad + y - TOKEN_SLOT_H / 2,
            }}
          >
            <PlayerToken
              seat={seat}
              action={displayAction}
              holeCards={holeCards}
            />
          </View>
        );
      })}

      {(() => {
        const heroBlindAction =
          heroSeat.position === "SB" && blindRevealedCount >= 1
            ? {
                position: "SB" as const,
                action: "limp" as const,
                sizeBB:
                  scenario.blindStructure.smallBlind /
                  scenario.blindStructure.bigBlind,
              }
            : heroSeat.position === "BB" && blindRevealedCount >= 2
              ? { position: "BB" as const, action: "limp" as const, sizeBB: 1 }
              : null;
        const heroActionRevealed =
          Boolean(heroAction) && revealedCount > actionsBefore.length;
        const displayHeroAction = heroActionRevealed
          ? (heroAction ?? null)
          : heroBlindAction;
        return (
          <View
            style={{
              position: "absolute",
              left: width / 2 - TOKEN_SLOT_W / 2,
              bottom: 16,
              width: TOKEN_SLOT_W,
              alignItems: "center",
            }}
          >
            {displayHeroAction && (
              <View style={{ marginBottom: 8 }}>
                <ChipBet action={displayHeroAction} />
              </View>
            )}
            <PlayerToken
              key={holeCards.map((c) => `${c.rank}${c.suit}`).join("")}
              seat={heroSeat}
              action={displayHeroAction}
              holeCards={holeCards}
              cardsTrigger={cardsTrigger}
              suppressBet
            />
          </View>
        );
      })()}
    </View>
  );
}
