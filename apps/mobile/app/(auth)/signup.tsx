import { useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AuthScreen } from "@/components/features/auth/AuthScreen";
import { TextField } from "@/components/ui";
import theme from "@/theme/theme";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        username: username.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        confirm_password: confirmPassword,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Create your account"
      subtitle="Start drilling in under a minute."
      error={error}
      submitLabel="Sign up"
      onSubmit={handleSubmit}
      submitting={submitting}
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerHref="/login"
    >
      <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <TextField
            label="First name"
            placeholder="Ada"
            autoComplete="given-name"
            textContentType="givenName"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="Last name"
            placeholder="Lovelace"
            autoComplete="family-name"
            textContentType="familyName"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
      </View>
      <TextField
        label="Username"
        placeholder="yourname"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        textContentType="username"
        value={username}
        onChangeText={setUsername}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label="Confirm password"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onSubmitEditing={handleSubmit}
      />
    </AuthScreen>
  );
}
