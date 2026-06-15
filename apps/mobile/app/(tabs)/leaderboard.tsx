import { LeaderboardRow } from "@/components/features/LeaderboardRow";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Card, Divider, Label, StatRow } from "@/components/ui";

const PLAYERS = [
  {
    rank: 1,
    name: "PokerKing",
    score: 9840,
    accuracy: "91%",
    trend: "up" as const,
  },
  {
    rank: 2,
    name: "AceHunter",
    score: 9210,
    accuracy: "88%",
    trend: "up" as const,
  },
  {
    rank: 3,
    name: "BluffMaster",
    score: 8750,
    accuracy: "83%",
    trend: "down" as const,
  },
  {
    rank: 4,
    name: "You",
    score: 7430,
    accuracy: "74%",
    trend: "up" as const,
    isMe: true,
  },
  {
    rank: 5,
    name: "RiverRat",
    score: 7100,
    accuracy: "71%",
    trend: "down" as const,
  },
  {
    rank: 6,
    name: "FlopKing",
    score: 6800,
    accuracy: "69%",
    trend: "down" as const,
  },
];

export default function LeaderboardScreen() {
  return (
    <ScreenWrapper>
      <Card>
        <Label>Your Stats</Label>
        <StatRow label="Global Rank" value="#4" />
        <Divider />
        <StatRow label="Total Score" value="7,430" trend="up" />
        <StatRow label="Accuracy" value="74%" trend="up" />
        <StatRow label="Weekly Change" value="+320" trend="up" />
      </Card>

      <Label>Top Players</Label>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {PLAYERS.map((player, i) => (
          <LeaderboardRow
            key={player.name}
            rank={player.rank}
            name={player.name}
            score={player.score}
            accuracy={player.accuracy}
            trend={player.trend}
            isMe={player.isMe}
            last={i === PLAYERS.length - 1}
          />
        ))}
      </Card>
    </ScreenWrapper>
  );
}
