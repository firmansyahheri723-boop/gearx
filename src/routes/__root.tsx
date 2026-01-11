import {
  Outlet,
  useLocation,
  createRootRoute,
  Link,
} from "@tanstack/solid-router";
import { DashboardHeader } from "../components/dashboard-header";
import {
  setIsSelecting,
  selectionStart,
  clearSelection,
} from "../stores/selection";
import {
  torqueRpmData,
  setTorqueRpmData,
  gearRatios,
  setGearRatios,
} from "../stores/vehicle";
import { initThemeListener } from "../stores/theme";
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

    const handleMouseUp = () => {
      setIsSelecting(false);
    };

    const handlePaste = (e: ClipboardEvent) => {
      const start = selectionStart();
      if (!start) return;

      const text = e.clipboardData?.getData("text");
      if (!text) return;

      const rows = text
        .trim()
        .split("\n")
        .map((r) => r.split("\t"));

      if (start.tableId === "torque") {
        rows.forEach((row, rowOffset) => {
          row.forEach((value, colOffset) => {
            const targetRow = start.row + rowOffset;
            const targetCol = start.col + colOffset;

            if (targetRow < torqueRpmData.length && targetCol < 2) {
              const numValue = parseFloat(value) || 0;
              if (targetCol === 0) {
                setTorqueRpmData(targetRow, "torque", numValue);
              } else {
                setTorqueRpmData(targetRow, "rpm", numValue);
              }
            }
          });
        });
        e.preventDefault();
      } else if (start.tableId === "gears") {
        rows.forEach((row, rowOffset) => {
          const targetRow = start.row + rowOffset;
          if (targetRow < gearRatios.length && row[0]) {
            setGearRatios(targetRow, "ratio", parseFloat(row[0]) || 0);
          }
        });
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      cleanupThemeListener();
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("paste", handlePaste);
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
