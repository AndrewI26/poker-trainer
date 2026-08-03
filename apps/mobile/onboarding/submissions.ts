import { ONBOARDING_QUESTIONS } from "./questions";

export type OnboardingAnswers = Record<string, string[]>;

export type OnboardingSubmission = Record<string, unknown>;

export function buildOnboardingSubmissions(
  answers: OnboardingAnswers,
): OnboardingSubmission[] {
  return ONBOARDING_QUESTIONS.flatMap((question) => {
    const selected = answers[question.id];
    if (!selected?.length) return [];

    const labels = selected.map(
      (value) =>
        question.options.find((option) => option.value === value)?.label ??
        value,
    );

    return [{ [question.prompt]: labels }];
  });
}
