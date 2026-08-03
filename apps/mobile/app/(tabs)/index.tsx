import { useRouter } from "expo-router";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { IconCard } from "@/components/ui";
import theme from "@/theme/theme";

export default function TrainScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <IconCard
        icon="albums-outline"
        iconBg={theme.palette.purple[800]}
        iconColor={theme.palette.purple[300]}
        heading="Preflop Trainer"
        body="Practice preflop decisions and get instant feedback on every hand."
        onPress={() => router.push("/train/preflop")}
      />
      <IconCard
        icon="layers-outline"
        iconBg={theme.palette.blue[800]}
        iconColor={theme.palette.blue[300]}
        heading="Postflop Trainer"
        body="Train flop decisions — betting, calling, and folding with real board textures."
        onPress={() => router.push("/train/postflop")}
      />
    </ScreenWrapper>
  );
}
