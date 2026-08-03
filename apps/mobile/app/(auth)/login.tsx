import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { AuthScreen } from "@/components/features/auth/AuthScreen";
import { TextField } from "@/components/ui";
import { isEmailValid } from "@/lib/validation";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const email = username.trim();
  const emailError = isEmailValid(email) ? null : "Enter a valid email address";
  const passwordError = password ? null : "Enter your password";

  async function handleSubmit() {
    setError(null);

    if (emailError || passwordError) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
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
        label="Email"
        placeholder="poker@gmail.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="username"
        textContentType="username"
        value={username}
        onChangeText={setUsername}
        error={showErrors ? emailError : null}
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
        error={showErrors ? passwordError : null}
      />
    </AuthScreen>
  );
}
