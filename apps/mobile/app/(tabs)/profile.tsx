import { useAuth } from "@/auth/AuthContext";
import { ProfileHeader } from "@/components/features/ProfileHeader";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Button } from "@/components/ui";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenWrapper>
      <ProfileHeader
        name={user?.username ?? "Loading"}
        memberSince="2024"
        role={user?.role ?? "free"}
      />

      <Button label="Log Out" variant="warning" onPress={logout} />
    </ScreenWrapper>
  );
}
