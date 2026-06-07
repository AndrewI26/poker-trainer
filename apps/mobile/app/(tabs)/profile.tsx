import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { ProfileHeader } from "../../components/features/ProfileHeader";
import { ScreenWrapper } from "../../components/layout/ScreenWrapper";
import { Button, Card, Label } from "../../components/ui";
import { useTheme } from "../../theme/ThemeContext";
import theme from "../../theme/theme";

export default function ProfileScreen() {
  const { t } = useTheme();

  return (
    <ScreenWrapper>
      <ProfileHeader
        t={t}
        name="You"
        memberSince="2024"
        rank="#4"
        drillsCompleted={17}
        winRate="68%"
      />

      <Label t={t}>Settings</Label>
      <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
        {[
          {
            icon: "notifications-outline" as const,
            label: "Notifications",
            sub: "Daily reminders on",
          },
          {
            icon: "shield-outline" as const,
            label: "Privacy",
            sub: "Profile visible to all",
          },
          {
            icon: "color-palette-outline" as const,
            label: "Appearance",
            sub: "System default",
          },
          {
            icon: "help-circle-outline" as const,
            label: "Help & Support",
            sub: null,
          },
        ].map((item, i, arr) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.md,
              borderBottomWidth: i < arr.length - 1 ? 1 : 0,
              borderBottomColor: t.assets.strokeInactive,
              gap: theme.spacing.md,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: theme.borderRadius.s,
                backgroundColor: t.assets.bgDisabled,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name={item.icon} size={18} color={t.assets.subtext} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.fontSize.body,
                  color: t.assets.text,
                }}
              >
                {item.label}
              </Text>
              {item.sub && (
                <Text
                  style={{
                    fontFamily: theme.fontFamily.regular,
                    fontSize: theme.fontSize.xs,
                    color: t.assets.subtext,
                  }}
                >
                  {item.sub}
                </Text>
              )}
            </View>
            <Ionicons
              name="chevron-forward-outline"
              size={16}
              color={t.assets.strokeInactive}
            />
          </View>
        ))}
      </Card>

      <Label t={t}>Danger Zone</Label>
      <Card t={t}>
        <Button t={t} label="Log Out" variant="warning" />
      </Card>
    </ScreenWrapper>
  );
}
