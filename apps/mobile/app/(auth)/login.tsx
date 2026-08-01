import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { AuthScreen } from "@/components/features/auth/AuthScreen";
import { TextField } from "@/components/ui";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Log in to pick up where you left off."
      error={error}
      submitLabel="Log in"
      onSubmit={handleSubmit}
      submitting={submitting}
      footerText="New here?"
      footerLinkLabel="Create an account"
      footerHref="/signup"
    >
      <TextField
        label="Username"
        placeholder="yourname"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        textContentType="username"
        value={username}
        onChangeText={setUsername}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleSubmit}
      />
    </AuthScreen>
  );
}
