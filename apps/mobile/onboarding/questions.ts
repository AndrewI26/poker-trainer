export interface OnboardingOption {
  value: string;
  label: string;
  description?: string;
}

export interface OnboardingQuestion {
  id: string;
  prompt: string;
  helper: string;
  multiSelect: boolean;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: "experience",
    prompt: "How long have you played poker?",
    helper: "This sets your starting difficulty.",
    multiSelect: false,
    options: [
      { value: "new", label: "Just starting out" },
      { value: "casual", label: "A year or two" },
      { value: "experienced", label: "Several years" },
      { value: "pro", label: "I play professionally" },
    ],
  },
  {
    id: "stakes",
    prompt: "What stakes do you usually play?",
    helper: "Drills will use pot sizes you actually see.",
    multiSelect: false,
    options: [
      { value: "play_money", label: "Play money" },
      { value: "micro", label: "Micro", description: "up to NL10" },
      { value: "low", label: "Low", description: "NL25 – NL100" },
      { value: "mid_plus", label: "Mid and above", description: "NL200+" },
    ],
  },
  {
    id: "format",
    prompt: "Which formats do you play?",
    helper: "Pick all that apply.",
    multiSelect: true,
    options: [
      { value: "cash_6max", label: "6-max cash" },
      { value: "cash_full_ring", label: "Full ring cash" },
      { value: "tournaments", label: "Tournaments" },
      { value: "sng", label: "Sit & go" },
    ],
  },
  {
    id: "goals",
    prompt: "What do you want to improve?",
    helper: "Pick all that apply.",
    multiSelect: true,
    options: [
      { value: "preflop_ranges", label: "Preflop ranges" },
      { value: "postflop", label: "Postflop decisions" },
      { value: "bet_sizing", label: "Bet sizing" },
      { value: "bluffing", label: "Bluff frequency" },
      { value: "tilt", label: "Tilt control" },
    ],
  },
  {
    id: "commitment",
    prompt: "How often do you want to train?",
    helper: "We use this for your daily goal.",
    multiSelect: false,
    options: [
      { value: "daily", label: "Every day" },
      { value: "few_times_week", label: "A few times a week" },
      { value: "weekly", label: "Once a week" },
      { value: "occasionally", label: "Now and then" },
    ],
  },
];
