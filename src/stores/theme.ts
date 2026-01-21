import { makePersisted } from "@solid-primitives/storage";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";

const THEME_STORAGE_KEY = "gearx_theme";

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

createEffect(() => {
	const pref = themePreference();
	const resolved = resolveTheme(pref);
	setTheme(resolved);
});

export function changeThemePreference(value: ThemePreference): void {
	setThemePreference(value);
	const resolved = resolveTheme(value);
	document.documentElement.setAttribute("data-theme", resolved);
	setTheme(resolved);
}

export function initThemeListener(): () => void {
	onMount(() => {
		const pref = themePreference();
		const resolved = resolveTheme(pref);
		document.documentElement.setAttribute("data-theme", resolved);
	});

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.attributeName === "data-theme") {
				const dataTheme = document.documentElement.getAttribute("data-theme");
				if (dataTheme === "light" || dataTheme === "dark") {
					setThemePreference(dataTheme);
				}
			}
		}
	});

	observer.observe(document.documentElement, { attributes: true });

	onCleanup(() => observer.disconnect());

	return () => {};
}
