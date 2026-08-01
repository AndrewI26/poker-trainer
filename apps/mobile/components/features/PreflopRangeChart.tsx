import {
  buildRangeChart,
  type ChartAction,
  type FacingPressure,
  type Position,
  positionsForTableSize,
  type TableSize,
} from "@poker-trainer/poker-engine";
import { useMemo, useState } from "react";
import { type LayoutChangeEvent, Pressable, Text, View } from "react-native";
import { type Theme, useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

const CELL_GAP = 2;
const GRID_COLUMNS = 13;

const PRESSURE_LABEL: Record<FacingPressure, string> = {
  open: "Unopened pot",
  "single-raise": "Facing a raise",
  "three-bet": "Facing a 3-bet",
  "four-bet-plus": "Facing a 4-bet+",
};

const ACTION_LABEL: Record<ChartAction, string> = {
  raise: "Raise",
  allin: "All-in",
  call: "Call",
  fold: "Fold",
};

function actionColors(
  action: ChartAction,
  t: Theme,
): { bg: string; text: string } {
  switch (action) {
    case "raise":
      return { bg: t.sentiment.positive, text: t.sentiment.positiveBg };
    case "allin":
      return { bg: theme.palette.gold[500], text: theme.palette.gold[800] };
    case "call":
      return { bg: t.accent.blue, text: theme.palette.blue[800] };
    default:
      return { bg: t.assets.bgCardSecondary, text: t.assets.textDisabled };
  }
}

export function PreflopRangeChart({
  position,
  tableSize = 6,
  pressure = "open",
  heroStackBB,
  potBB,
  callAmountBB,
  facingRaiseSizeBB,
  highlightHand,
  selectablePosition = false,
  onPositionChange,
  showHeader = true,
  showLegend = true,
}: {
  position: Position;
  tableSize?: TableSize;
  pressure?: FacingPressure;
  heroStackBB?: number;
  potBB?: number;
  callAmountBB?: number;
  facingRaiseSizeBB?: number | null;
  highlightHand?: string;
  selectablePosition?: boolean;
  onPositionChange?: (position: Position) => void;
  showHeader?: boolean;
  showLegend?: boolean;
}) {
  const { t } = useTheme();
  const [gridWidth, setGridWidth] = useState(0);
  const [internalPosition, setInternalPosition] = useState(position);

  const positions = positionsForTableSize(tableSize);
  const requestedPosition = selectablePosition ? internalPosition : position;
  const activePosition = positions.includes(requestedPosition)
    ? requestedPosition
    : positions[0];

  const chart = useMemo(
    () =>
      buildRangeChart({
        tableSize,
        heroPosition: activePosition,
        pressure,
        heroStackBB,
        potBB,
        callAmountBB,
        facingRaiseSizeBB,
      }),
    [
      tableSize,
      activePosition,
      pressure,
      heroStackBB,
      potBB,
      callAmountBB,
      facingRaiseSizeBB,
    ],
  );

  function handleLayout(event: LayoutChangeEvent) {
    setGridWidth(event.nativeEvent.layout.width);
  }

  function selectPosition(next: Position) {
    setInternalPosition(next);
    onPositionChange?.(next);
  }

  const cellSize =
    gridWidth > 0
      ? (gridWidth - CELL_GAP * (GRID_COLUMNS - 1)) / GRID_COLUMNS
      : 0;

  const legendActions = (["raise", "allin", "call", "fold"] as ChartAction[])
    .filter((action) => chart.combosByAction[action] > 0)
    .map((action) => ({
      action,
      percent: (chart.combosByAction[action] / chart.totalCombos) * 100,
    }));

  return (
    <View>
      {showHeader && (
        <View style={{ marginBottom: theme.spacing.sm }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.body,
                color: t.assets.text,
                includeFontPadding: false,
              }}
            >
              {activePosition} · {tableSize}-max
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.sm,
                color: t.sentiment.positive,
                includeFontPadding: false,
              }}
            >
              {chart.rangePercent.toFixed(1)}% of hands
            </Text>
          </View>
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: t.assets.subtext,
              includeFontPadding: false,
              marginTop: 2,
            }}
          >
            {PRESSURE_LABEL[pressure]}
          </Text>
        </View>
      )}

      {selectablePosition && (
        <View
          style={{
            flexDirection: "row",
            gap: CELL_GAP * 2,
            marginBottom: theme.spacing.sm,
          }}
        >
          {positions.map((pos) => {
            const active = pos === activePosition;
            return (
              <Pressable
                key={pos}
                onPress={() => selectPosition(pos)}
                style={{
                  flex: 1,
                  paddingVertical: 6,
                  borderRadius: theme.borderRadius.s,
                  alignItems: "center",
                  borderWidth: 1,
                  backgroundColor: active
                    ? t.sentiment.positiveBg
                    : t.assets.bgCardSecondary,
                  borderColor: active
                    ? t.sentiment.positive
                    : t.assets.strokeInactive,
                }}
              >
                <Text
                  style={{
                    fontFamily: theme.fontFamily.bold,
                    fontSize: theme.fontSize.xs,
                    color: active ? t.sentiment.positive : t.assets.subtext,
                    includeFontPadding: false,
                    marginTop: 2,
                  }}
                >
                  {pos}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <View onLayout={handleLayout} style={{ gap: CELL_GAP }}>
        {cellSize > 0 &&
          chart.grid.map((row) => (
            <View
              key={row[0].hand}
              style={{ flexDirection: "row", gap: CELL_GAP }}
            >
              {row.map((cell) => {
                const colors = actionColors(cell.action, t);
                const highlighted = highlightHand === cell.hand;
                return (
                  <View
                    key={cell.hand}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRadius: theme.borderRadius.xxs,
                      backgroundColor: colors.bg,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: highlighted ? 2 : 0,
                      borderColor: t.assets.text,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        fontFamily: theme.fontFamily.bold,
                        fontSize: cellSize * 0.32,
                        color: colors.text,
                        includeFontPadding: false,
                      }}
                    >
                      {cell.hand}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
      </View>

      {showLegend && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.md,
            marginTop: theme.spacing.sm,
          }}
        >
          {legendActions.map(({ action, percent }) => (
            <View
              key={action}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  backgroundColor: actionColors(action, t).bg,
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
                {ACTION_LABEL[action]} {percent.toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
