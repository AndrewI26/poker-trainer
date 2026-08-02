import { zUserCreate } from "@poker-trainer/api-sdk";

export const PASSWORD_RULES = [
  {
    label: "8 to 72 characters",
    test: (v: string) => v.length >= 8 && v.length <= 72,
  },
  {
    label: "One uppercase letter",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    label: "One lowercase letter",
    test: (v: string) => /[a-z]/.test(v),
  },
  {
    label: "One number",
    test: (v: string) => /\d/.test(v),
  },
  {
    label: "One special character",
    test: (v: string) => /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(v),
  },
] as const;

export function isPasswordValid(password: string) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function isEmailValid(email: string) {
  return zUserCreate.shape.username.safeParse(email).success;
}
