import { createSignal, createEffect } from 'solid-js';

// ThemePreference is what the user selects: system follows OS, or explicit dark/light
export type ThemePreference = 'system' | 'dark' | 'light';
// ResolvedTheme is what actually gets applied to the DOM
export type ResolvedTheme = 'dark' | 'light';

const STORAGE_KEY = 'gearx-theme';

// Get the system's preferred theme
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Get initial preference from localStorage
const getInitialPreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'system' || saved === 'dark' || saved === 'light') {
    return saved;
  }
  return 'system';
};

// Resolve preference to actual theme
const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
};

// Get initial resolved theme from DOM (set by inline script)
const getInitialResolvedTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'dark';
  return (document.documentElement.getAttribute('data-theme') as ResolvedTheme) || 'dark';
};

export const [themePreference, setThemePreference] = createSignal<ThemePreference>(getInitialPreference());
export const [theme, setTheme] = createSignal<ResolvedTheme>(getInitialResolvedTheme());

// Apply theme to DOM
const applyTheme = (resolvedTheme: ResolvedTheme) => {
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  setTheme(resolvedTheme);
};

// Change theme preference
export const changeThemePreference = (preference: ThemePreference) => {
  setThemePreference(preference);
  localStorage.setItem(STORAGE_KEY, preference);
  applyTheme(resolveTheme(preference));
};

// Initialize theme listener for system preference changes
export const initThemeListener = () => {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = () => {
    // Only update if user preference is 'system'
    if (themePreference() === 'system') {
      applyTheme(getSystemTheme());
    }
  };
  
  media.addEventListener('change', handleChange);
  
  return () => media.removeEventListener('change', handleChange);
};
