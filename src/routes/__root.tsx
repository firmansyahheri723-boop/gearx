import {
	createRootRoute,
	Link,
	Outlet,
	useLocation,
} from "@tanstack/solid-router";
import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { DashboardHeader } from "@/components/ui/dashboard-header";
import { initDatabase } from "@/features/database/store";
import { deserializeSetup } from "@/features/setups/sharing";
import { applySharedSetup } from "@/features/suspension/store";
import { clearSelection } from "@/stores/selection";
import { initThemeListener } from "@/stores/theme";

const TABS = [
	{ id: "main", label: "Input", to: "/" },
	{ id: "suspension", label: "Suspension", to: "/suspension" },
	{ id: "gearbox", label: "Gearbox", to: "/gearbox" },
	{ id: "aero", label: "Aero", to: "/aero" },
	{ id: "alignment", label: "Alignment", to: "/alignment" },
	{ id: "setups", label: "Setups", to: "/setups" },
	{ id: "data", label: "Database", to: "/database" },
	{ id: "chat", label: "Chat", to: "/chat" },
] as const;

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	const location = useLocation();
	const [showLoadedBanner, setShowLoadedBanner] = createSignal(false);

	onMount(() => {
		const cleanupThemeListener = initThemeListener();
		initDatabase();

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				clearSelection();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		const params = new URLSearchParams(window.location.search);
		const encoded = params.get("setup");
		if (encoded) {
			const data = deserializeSetup(encoded);
			if (data) {
				applySharedSetup(data);
				setShowLoadedBanner(true);
				window.history.replaceState(null, "", window.location.pathname);
			}
		}

		onCleanup(() => {
			cleanupThemeListener();
			document.removeEventListener("keydown", handleKeyDown);
		});
	});

	return (
		<div class="min-h-screen p-2 sm:p-4 lg:p-6 font-mono flex justify-center">
			<div class="w-full max-w-full lg:max-w-7xl">
				<DashboardHeader />

				<Show when={showLoadedBanner()}>
					<div class="mb-4 px-3 py-2 bg-foreground/10 border border-foreground/20 text-foreground-secondary text-xs uppercase tracking-wider flex items-center justify-between">
						<span>Setup loaded from URL</span>
						<button
							type="button"
							onClick={() => setShowLoadedBanner(false)}
							class="hover:text-foreground"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M18 6 6 18" />
								<path d="m6 6 12 12" />
							</svg>
						</button>
					</div>
				</Show>

				<div class="border border-border/50 bg-background/50 mb-4">
					<div class="flex overflow-x-auto scrollbar-hide">
						<For each={TABS}>
							{(tab) => (
								<Link
									to={tab.to}
									class={`relative flex items-center gap-2 px-3 sm:px-4 py-2 text-[10px] sm:text-xs uppercase tracking-wider transition-colors focus:outline-none shrink-0 whitespace-nowrap border-b-2 cursor-pointer ${
										location().pathname === tab.to ||
										(
											tab.to === "/" &&
												(location().pathname === "/" ||
													location().pathname === "")
										)
											? "bg-surface/80 text-foreground border-border"
											: "bg-transparent text-muted hover:text-foreground-secondary hover:bg-surface/30 border-transparent"
									}`}
								>
									<span class="font-semibold">{tab.label}</span>
								</Link>
							)}
						</For>
						<div class="flex-1 border-b border-border/30 shrink-0" />
					</div>
				</div>

				<Outlet />

				<footer class="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-muted text-[10px] sm:text-xs">
					<span class="text-foreground-secondary">{"///"}</span>
					<span>GEARX SUSPENSION CALCULATOR v1.0.0</span>
					<span class="text-foreground-secondary">{"///"}</span>
				</footer>
			</div>
		</div>
	);
}
