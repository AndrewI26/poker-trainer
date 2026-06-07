import { createContext, type ReactNode, useContext, useState } from "react";
import theme from "./theme";

type ColorScheme = "light" | "dark";

export type Theme = typeof theme.light | typeof theme.dark;

interface ThemeContextValue {
  colorScheme: ColorScheme;
  toggle: () => void;
  t: typeof theme.light | typeof theme.dark;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const t = colorScheme === "dark" ? theme.dark : theme.light;

  function toggle() {
    setColorScheme((s) => (s === "dark" ? "light" : "dark"));
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, toggle, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
