import { Ionicons } from "@expo/vector-icons";
import type { UserPublic } from "@poker-trainer/api-sdk";
import { Text, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function ProfileHeader({
  name,
  memberSince,
  role,
}: {
  name: string;
  memberSince: string;
  role: UserPublic["role"];
}) {
  const { t } = useTheme();
  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: t.assets.bgDisabled,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person-outline" size={28} color={t.assets.subtext} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: theme.fontFamily.bold,
              fontSize: theme.fontSize.h5,
              color: t.assets.text,
            }}
          >
            {name}
          </Text>
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: t.assets.subtext,
            }}
          >
            Member since {memberSince}
          </Text>
        </View>
        <Badge label={role} variant="informative" />
      </View>
    </Card>
  );
}
