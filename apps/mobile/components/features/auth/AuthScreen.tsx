import { Link } from "expo-router";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export function AuthScreen({
  title,
  subtitle,
  error,
  children,
  submitLabel,
  onSubmit,
  submitting,
  footerText,
  footerLinkLabel,
  footerHref,
}: {
  title: string;
  subtitle: string;
  error: string | null;
  children: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
  submitting: boolean;
  footerText: string;
  footerLinkLabel: string;
  footerHref: "/login" | "/signup";
}) {
  const { t } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.assets.bgPage }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: theme.spacing.md,
            gap: theme.spacing.md,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.h3,
                color: t.assets.text,
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.body,
                color: t.assets.subtext,
              }}
            >
              {subtitle}
            </Text>
          </View>

          <View style={{ gap: theme.spacing.sm }}>{children}</View>

          {error && (
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.sm,
                color: t.sentiment.negative,
              }}
            >
              {error}
            </Text>
          )}

          <Button
            label={submitting ? "Please wait…" : submitLabel}
            onPress={onSubmit}
            disabled={submitting}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: theme.spacing.xs,
            }}
          >
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.sm,
                color: t.assets.subtext,
              }}
            >
              {footerText}
            </Text>
            <Link href={footerHref} replace>
              <Text
                style={{
                  fontFamily: theme.fontFamily.bold,
                  fontSize: theme.fontSize.sm,
                  color: t.assets.text,
                }}
              >
                {footerLinkLabel}
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
