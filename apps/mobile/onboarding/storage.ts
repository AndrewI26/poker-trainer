import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  buildOnboardingSubmissions,
  type OnboardingAnswers,
  type OnboardingSubmission,
} from "./submissions";

const ONBOARDING_KEY = "poker-trainer.onboarding";

export async function getStoredOnboarding(): Promise<OnboardingAnswers | null> {
  const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OnboardingAnswers;
  } catch {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
    return null;
  }
}

export async function saveOnboardingAnswers(
  answers: OnboardingAnswers,
): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(answers));
}

export async function clearStoredOnboarding(): Promise<void> {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
}

export async function getOnboardingSubmissions(): Promise<
  OnboardingSubmission[]
> {
  const answers = await getStoredOnboarding();
  return answers ? buildOnboardingSubmissions(answers) : [];
}
