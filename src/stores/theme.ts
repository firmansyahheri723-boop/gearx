import { createSignal, onMount, onCleanup } from "solid-js";
import { makePersisted } from "@solid-primitives/storage";

const THEME_STORAGE_KEY = "gearx-theme";

export type ThemePreference = "system" | "light" | "dark";

const deserializeTheme = (value: string | null): ThemePreference => {
  if (value === "system" || value === "light" || value === "dark") {
    return value;
  }
  return "system";
};

export const [themePreference, setThemePreference] = makePersisted(
  createSignal<ThemePreference>("dark"),
  { name: THEME_STORAGE_KEY, deserialize: deserializeTheme },
);

export type ResolvedTheme = "dark" | "light";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference === "light" ? "light" : "dark";
};

export const [theme, setTheme] = createSignal<ResolvedTheme>(
  resolveTheme(themePreference()),
);

export function changeThemePreference(value: ThemePreference): void {
  setThemePreference(value);
  document.documentElement.classList.toggle("light", value === "light");
}

export function initThemeListener(): () => void {
  onMount(() => {
    const pref = themePreference();
    if (pref === "light" || pref === "dark") {
      document.documentElement.classList.toggle("light", pref === "light");
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      document.documentElement.classList.add("light");
    }
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "class") {
        const isLight = document.documentElement.classList.contains("light");
        setThemePreference(isLight ? "light" : "dark");
      }
    }
  });

  observer.observe(document.documentElement, { attributes: true });

  onCleanup(() => observer.disconnect());

  return () => {};
}
