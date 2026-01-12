import { createSignal, onMount, onCleanup } from "solid-js";

const THEME_STORAGE_KEY = "gearx-theme";

export type ThemePreference = "system" | "light" | "dark";

const getThemeFromClass = (): ThemePreference => {
  const isLight = document.documentElement.classList.contains("light");
  return isLight ? "light" : "dark";
};

export const [themePreference, setThemePreference] = createSignal<ThemePreference>("dark");

export type ResolvedTheme = "dark" | "light";

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference === "light" ? "light" : "dark";
};

const getInitialResolvedTheme = (): ResolvedTheme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "system" || stored === "dark" || stored === "light") {
    return resolveTheme(stored as ThemePreference);
  }
  return getSystemTheme();
};

export const [theme, setTheme] = createSignal<ResolvedTheme>(getInitialResolvedTheme());

export function changeThemePreference(value: ThemePreference): void {
  setThemePreference(value);
  localStorage.setItem(THEME_STORAGE_KEY, value);
  document.documentElement.classList.toggle("light", value === "light");
}

export function initThemeListener(): () => void {
  onMount(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      setThemePreference(stored);
      document.documentElement.classList.toggle("light", stored === "light");
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setThemePreference("light");
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

