import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OptionRow } from "@/components/features/onboarding/OptionRow";
import { ProgressBar } from "@/components/features/onboarding/ProgressBar";
import { Button } from "@/components/ui";
import { ONBOARDING_QUESTIONS } from "@/onboarding/questions";
import { saveOnboardingAnswers } from "@/onboarding/storage";
import type { OnboardingAnswers } from "@/onboarding/submissions";
import { useTheme } from "@/theme/ThemeContext";
import theme from "@/theme/theme";

export default function OnboardingScreen() {
  const { t } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>({});
  const [saving, setSaving] = useState(false);

  const question = ONBOARDING_QUESTIONS[step];
  const selected = answers[question.id] ?? [];
  const isLast = step === ONBOARDING_QUESTIONS.length - 1;

  function toggle(value: string) {
    setAnswers((current) => {
      const existing = current[question.id] ?? [];

      if (!question.multiSelect) {
        return { ...current, [question.id]: [value] };
      }

      return {
        ...current,
        [question.id]: existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value],
      };
    });
  }

  async function finish() {
    setSaving(true);
    try {
      await saveOnboardingAnswers(answers);
      router.replace("/signup");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (isLast) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }

  function back() {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.assets.bgPage }}>
      <View
        style={{ flex: 1, padding: theme.spacing.md, gap: theme.spacing.md }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <Pressable onPress={back} hitSlop={12} accessibilityLabel="Go back">
            <Ionicons name="chevron-back" size={24} color={t.assets.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ProgressBar progress={(step + 1) / ONBOARDING_QUESTIONS.length} />
          </View>
          <Text
            style={{
              fontFamily: theme.fontFamily.regular,
              fontSize: theme.fontSize.sm,
              color: t.assets.subtext,
            }}
          >
            {step + 1}/{ONBOARDING_QUESTIONS.length}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.md,
            paddingBottom: theme.spacing.md,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Text
              style={{
                fontFamily: theme.fontFamily.bold,
                fontSize: theme.fontSize.h4,
                color: t.assets.text,
              }}
            >
              {question.prompt}
            </Text>
            <Text
              style={{
                fontFamily: theme.fontFamily.regular,
                fontSize: theme.fontSize.body,
                color: t.assets.subtext,
              }}
            >
              {question.helper}
            </Text>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            {question.options.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                selected={selected.includes(option.value)}
                multiSelect={question.multiSelect}
                onPress={() => toggle(option.value)}
              />
            ))}
          </View>
        </ScrollView>

        <View style={{ gap: theme.spacing.sm }}>
          <Button
            label={isLast ? "Create my account" : "Continue"}
            onPress={next}
            disabled={selected.length === 0 || saving}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
