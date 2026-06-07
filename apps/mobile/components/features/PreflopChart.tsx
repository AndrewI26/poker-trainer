import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const RANKS = [
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
] as const;

type Action = "raise" | "call" | "fold";
type Position = "UTG" | "HJ" | "CO" | "BTN" | "SB";

const RAISE_HANDS: Record<Position, string[]> = {
  UTG: [
    "AA",
    "KK",
    "QQ",
    "JJ",
    "TT",
    "99",
    "88",
    "77",
    "66",
    "55",
    "44",
    "33",
    "22",
    "AKs",
    "AQs",
    "AJs",
    "ATs",
    "A9s",
    "A8s",
    "A7s",
    "A6s",
    "A5s",
    "A4s",
    "A3s",
    "A2s",
    "KQs",
    "KJs",
    "KTs",
    "K9s",
    "QJs",
    "QTs",
    "Q9s",
    "JTs",
    "J9s",
    "T9s",
    "T8s",
    "98s",
    "97s",
    "87s",
    "86s",
    "76s",
    "75s",
    "65s",
    "64s",
    "54s",
    "53s",
    "43s",
    "AKo",
    "AQo",
    "AJo",
    "ATo",
    "KQo",
    "KJo",
    "KTo",
    "QJo",
    "QTo",
    "JTo",
  ],
  HJ: [
    "AA",
    "KK",
    "QQ",
    "JJ",
    "TT",
    "99",
    "88",
    "77",
    "66",
    "55",
    "44",
    "33",
    "22",
    "AKs",
    "AQs",
    "AJs",
    "ATs",
    "A9s",
    "A8s",
    "A7s",
    "A6s",
    "A5s",
    "A4s",
    "A3s",
    "A2s",
    "KQs",
    "KJs",
    "KTs",
    "K9s",
    "K8s",
    "QJs",
    "QTs",
    "Q9s",
    "Q8s",
    "JTs",
    "J9s",
    "J8s",
    "T9s",
    "T8s",
    "T7s",
    "98s",
    "97s",
    "96s",
    "87s",
    "86s",
    "85s",
    "76s",
    "75s",
    "74s",
    "65s",
    "64s",
    "63s",
    "54s",
    "53s",
    "52s",
    "43s",
    "42s",
    "32s",
    "AKo",
    "AQo",
    "AJo",
    "ATo",
    "A9o",
    "KQo",
    "KJo",
    "KTo",
    "K9o",
    "QJo",
    "QTo",
    "Q9o",
    "JTo",
    "J9o",
    "T9o",
  ],
  CO: [
    "AA",
    "KK",
    "QQ",
    "JJ",
    "TT",
    "99",
    "88",
    "77",
    "66",
    "55",
    "44",
    "33",
    "22",
    "AKs",
    "AQs",
    "AJs",
    "ATs",
    "A9s",
    "A8s",
    "A7s",
    "A6s",
    "A5s",
    "A4s",
    "A3s",
    "A2s",
    "KQs",
    "KJs",
    "KTs",
    "K9s",
    "K8s",
    "K7s",
    "K6s",
    "K5s",
    "QJs",
    "QTs",
    "Q9s",
    "Q8s",
    "Q7s",
    "JTs",
    "J9s",
    "J8s",
    "J7s",
    "T9s",
    "T8s",
    "T7s",
    "T6s",
    "98s",
    "97s",
    "96s",
    "95s",
    "87s",
    "86s",
    "85s",
    "84s",
    "76s",
    "75s",
    "74s",
    "65s",
    "64s",
    "63s",
    "54s",
    "53s",
    "52s",
    "43s",
    "42s",
    "32s",
    "AKo",
    "AQo",
    "AJo",
    "ATo",
    "A9o",
    "A8o",
    "A7o",
    "KQo",
    "KJo",
    "KTo",
    "K9o",
    "K8o",
    "QJo",
    "QTo",
    "Q9o",
    "Q8o",
    "JTo",
    "J9o",
    "J8o",
    "T9o",
    "T8o",
    "98o",
    "97o",
    "87o",
  ],
  BTN: [
    "AA",
    "KK",
    "QQ",
    "JJ",
    "TT",
    "99",
    "88",
    "77",
    "66",
    "55",
    "44",
    "33",
    "22",
    "AKs",
    "AQs",
    "AJs",
    "ATs",
    "A9s",
    "A8s",
    "A7s",
    "A6s",
    "A5s",
    "A4s",
    "A3s",
    "A2s",
    "KQs",
    "KJs",
    "KTs",
    "K9s",
    "K8s",
    "K7s",
    "K6s",
    "K5s",
    "K4s",
    "K3s",
    "K2s",
    "QJs",
    "QTs",
    "Q9s",
    "Q8s",
    "Q7s",
    "Q6s",
    "Q5s",
    "Q4s",
    "JTs",
    "J9s",
    "J8s",
    "J7s",
    "J6s",
    "J5s",
    "T9s",
    "T8s",
    "T7s",
    "T6s",
    "T5s",
    "98s",
    "97s",
    "96s",
    "95s",
    "94s",
    "87s",
    "86s",
    "85s",
    "84s",
    "83s",
    "76s",
    "75s",
    "74s",
    "73s",
    "65s",
    "64s",
    "63s",
    "62s",
    "54s",
    "53s",
    "52s",
    "43s",
    "42s",
    "32s",
    "AKo",
    "AQo",
    "AJo",
    "ATo",
    "A9o",
    "A8o",
    "A7o",
    "A6o",
    "A5o",
    "A4o",
    "A3o",
    "A2o",
    "KQo",
    "KJo",
    "KTo",
    "K9o",
    "K8o",
    "K7o",
    "K6o",
    "K5o",
    "QJo",
    "QTo",
    "Q9o",
    "Q8o",
    "Q7o",
    "Q6o",
    "JTo",
    "J9o",
    "J8o",
    "J7o",
    "J6o",
    "T9o",
    "T8o",
    "T7o",
    "T6o",
    "98o",
    "97o",
    "96o",
    "95o",
    "87o",
    "86o",
    "85o",
    "76o",
    "75o",
    "74o",
    "65o",
    "64o",
    "54o",
    "53o",
    "43o",
  ],
  SB: [
    "AA",
    "KK",
    "QQ",
    "JJ",
    "TT",
    "99",
    "88",
    "77",
    "66",
    "55",
    "44",
    "33",
    "22",
    "AKs",
    "AQs",
    "AJs",
    "ATs",
    "A9s",
    "A8s",
    "A7s",
    "A6s",
    "A5s",
    "A4s",
    "A3s",
    "A2s",
    "KQs",
    "KJs",
    "KTs",
    "K9s",
    "K8s",
    "K7s",
    "K6s",
    "K5s",
    "K4s",
    "K3s",
    "K2s",
    "QJs",
    "QTs",
    "Q9s",
    "Q8s",
    "Q7s",
    "Q6s",
    "Q5s",
    "Q4s",
    "Q3s",
    "Q2s",
    "JTs",
    "J9s",
    "J8s",
    "J7s",
    "J6s",
    "J5s",
    "J4s",
    "T9s",
    "T8s",
    "T7s",
    "T6s",
    "T5s",
    "T4s",
    "98s",
    "97s",
    "96s",
    "95s",
    "94s",
    "93s",
    "87s",
    "86s",
    "85s",
    "84s",
    "83s",
    "82s",
    "76s",
    "75s",
    "74s",
    "73s",
    "72s",
    "65s",
    "64s",
    "63s",
    "62s",
    "54s",
    "53s",
    "52s",
    "43s",
    "42s",
    "32s",
    "AKo",
    "AQo",
    "AJo",
    "ATo",
    "A9o",
    "A8o",
    "A7o",
    "A6o",
    "A5o",
    "A4o",
    "A3o",
    "A2o",
    "KQo",
    "KJo",
    "KTo",
    "K9o",
    "K8o",
    "K7o",
    "K6o",
    "K5o",
    "K4o",
    "QJo",
    "QTo",
    "Q9o",
    "Q8o",
    "Q7o",
    "Q6o",
    "Q5o",
    "JTo",
    "J9o",
    "J8o",
    "J7o",
    "J6o",
    "J5o",
    "T9o",
    "T8o",
    "T7o",
    "T6o",
    "T5o",
    "98o",
    "97o",
    "96o",
    "95o",
    "94o",
    "87o",
    "86o",
    "85o",
    "84o",
    "76o",
    "75o",
    "74o",
    "73o",
    "65o",
    "64o",
    "63o",
    "54o",
    "53o",
    "52o",
    "43o",
    "42o",
    "32o",
  ],
};

function handLabel(r: number, c: number): string {
  if (r === c) return `${RANKS[r]}${RANKS[r]}`;
  if (r < c) return `${RANKS[r]}${RANKS[c]}s`;
  return `${RANKS[c]}${RANKS[r]}o`;
}

function cellAction(r: number, c: number, position: Position): Action {
  const label = handLabel(r, c);
  if (RAISE_HANDS[position].includes(label)) return "raise";
  return "fold";
}

const ACTION_COLOR: Record<Action, string> = {
  raise: "#22c55e",
  call: "#3b82f6",
  fold: "#1a2420",
};

const ACTION_TEXT: Record<Action, string> = {
  raise: "#dcfce7",
  call: "#dbeafe",
  fold: "#374840",
};

const POSITIONS: Position[] = ["UTG", "HJ", "CO", "BTN", "SB"];

export function PreflopChart() {
  const { t } = useTheme();
  const [selectedPosition, setSelectedPosition] = useState<Position>("BTN");

  const cellSize = 26;

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          gap: 6,
          marginBottom: theme.spacing.md,
        }}
      >
        {POSITIONS.map((pos) => (
          <Pressable
            key={pos}
            onPress={() => setSelectedPosition(pos)}
            style={{
              flex: 1,
              paddingVertical: 6,
              borderRadius: theme.borderRadius.s,
              backgroundColor:
                selectedPosition === pos
                  ? t.sentiment.positiveBg
                  : t.assets.bgCardSecondary,
              alignItems: "center",
              borderWidth: 1,
              borderColor:
                selectedPosition === pos
                  ? t.sentiment.positive
                  : t.assets.strokeInactive,
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.xs,
                color:
                  selectedPosition === pos
                    ? t.sentiment.positive
                    : t.assets.subtext,
                includeFontPadding: false,
                marginTop: 2,
              }}
            >
              {pos}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View
            style={{
              flexDirection: "row",
              marginBottom: 2,
              marginLeft: cellSize + 2,
            }}
          >
            {RANKS.map((rank) => (
              <View
                key={rank}
                style={{ width: cellSize, alignItems: "center" }}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    fontSize: 8,
                    color: t.assets.subtext,
                    includeFontPadding: false,
                  }}
                >
                  {rank}
                </Text>
              </View>
            ))}
          </View>

          {RANKS.map((rowRank, r) => (
            <View
              key={rowRank}
              style={{ flexDirection: "row", marginBottom: 2 }}
            >
              <View
                style={{
                  width: cellSize,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    fontSize: 8,
                    color: t.assets.subtext,
                    includeFontPadding: false,
                  }}
                >
                  {rowRank}
                </Text>
              </View>

              {RANKS.map((colRank, c) => {
                const action = cellAction(r, c, selectedPosition);
                const label = handLabel(r, c);
                return (
                  <View
                    key={colRank}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      marginRight: 2,
                      borderRadius: 3,
                      backgroundColor: ACTION_COLOR[action],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: theme.fontFamily.bold,
                        fontSize: r === c ? 6 : 5,
                        color: ACTION_TEXT[action],
                        includeFontPadding: false,
                        textAlign: "center",
                      }}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: "row",
          gap: 12,
          marginTop: theme.spacing.sm,
        }}
      >
        {(["raise", "fold"] as Action[]).map((action) => (
          <View
            key={action}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                backgroundColor: ACTION_COLOR[action],
              }}
            />
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.xs,
                color: t.assets.subtext,
                includeFontPadding: false,
                marginTop: 2,
              }}
            >
              {action.charAt(0).toUpperCase() + action.slice(1)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
