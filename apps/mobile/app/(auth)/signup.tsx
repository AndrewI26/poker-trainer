import { useState } from "react";
import { View } from "react-native";
import { useAuth } from "@/auth/AuthContext";
import { AuthScreen } from "@/components/features/auth/AuthScreen";
import { PasswordRequirements } from "@/components/features/auth/PasswordRequirements";
import { TextField } from "@/components/ui";
import { isEmailValid, isPasswordValid } from "@/lib/validation";
import theme from "@/theme/theme";

export default function SignupScreen() {
  const { signup } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const email = username.trim();
  const fieldErrors = {
    firstName: firstName.trim() ? null : "Enter your first name",
    lastName: lastName.trim() ? null : "Enter your last name",
    username: isEmailValid(email) ? null : "Enter a valid email address",
    password: isPasswordValid(password)
      ? null
      : "Password does not meet the requirements below",
    confirmPassword:
      password === confirmPassword ? null : "Passwords do not match",
  };
  const isValid = Object.values(fieldErrors).every((e) => e === null);

  async function handleSubmit() {
    setError(null);

    if (!isValid) {
      setShowErrors(true);
      return;
    }

    setSubmitting(true);
    try {
      await signup({
        username: email,
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

  function errorFor(field: keyof typeof fieldErrors) {
    return showErrors ? fieldErrors[field] : null;
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
            placeholder="John"
            autoComplete="given-name"
            textContentType="givenName"
            value={firstName}
            onChangeText={setFirstName}
            error={errorFor("firstName")}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="Last name"
            placeholder="Doe"
            autoComplete="family-name"
            textContentType="familyName"
            value={lastName}
            onChangeText={setLastName}
            error={errorFor("lastName")}
          />
        </View>
      </View>
      <TextField
        label="Email"
        placeholder="poker@gmail.com"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="username-new"
        textContentType="username"
        value={username}
        onChangeText={setUsername}
        error={errorFor("username")}
      />
      <TextField
        label="Password"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={password}
        onChangeText={setPassword}
        error={errorFor("password")}
      />
      <PasswordRequirements password={password} />
      <TextField
        label="Confirm password"
        placeholder="••••••••"
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onSubmitEditing={handleSubmit}
        error={errorFor("confirmPassword")}
      />
    </AuthScreen>
  );
}
