import {
  Outlet,
  useLocation,
  createRootRoute,
  Link,
} from "@tanstack/solid-router";
import { DashboardHeader } from "../components/dashboard-header";
import { initThemeListener } from "../stores/theme";
import { clearSelection } from "../stores/selection";
import { onMount, onCleanup, For } from "solid-js";

const TABS = [
  { id: "main", label: "Input", to: "/" },
  { id: "suspension", label: "Suspension", to: "/suspension" },
  { id: "gearbox", label: "Gearbox", to: "/gearbox" },
  { id: "data", label: "Database", to: "/database" },
] as const;

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();

  onMount(() => {
    const cleanupThemeListener = initThemeListener();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      cleanupThemeListener();
      document.removeEventListener("keydown", handleKeyDown);
    });
  });

  return (
    <div class="min-h-screen p-2 sm:p-4 lg:p-6 font-mono flex justify-center">
      <div class="w-full max-w-full lg:max-w-7xl">
        <DashboardHeader />

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
