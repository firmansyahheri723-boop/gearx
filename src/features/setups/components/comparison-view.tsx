import { createSignal, For, Show, createMemo } from "solid-js";
import { getSetups, getSetupById } from "../store";
import type { SetupDiff } from "@/types";
import { compareTwoSetups } from "../utils/setup-compare";
import { ComparisonTable } from "./comparison-table";

interface ComparisonViewProps {
  onApplyValue: (path: string, value: unknown) => void;
}

export function ComparisonView(props: ComparisonViewProps) {
  const [setupAId, setSetupAId] = createSignal<string>("");
  const [setupBId, setSetupBId] = createSignal<string>("");
  const [viewMode, setViewMode] = createSignal<"select" | "compare">("select");

  const allSetups = getSetups();
  const selectedSetupA = createMemo(() => getSetupById(setupAId()));
  const selectedSetupB = createMemo(() => getSetupById(setupBId()));

  const comparisonDiff = createMemo<SetupDiff | null>(() => {
    const a = selectedSetupA();
    const b = selectedSetupB();
    if (!a || !b) return null;
    return compareTwoSetups(a, b);
  });

  const handleStartComparison = () => {
    if (setupAId() && setupBId()) {
      setViewMode("compare");
    }
  };

  const handleSelectForA = (id: string) => {
    setSetupAId(id);
  };

  const handleSelectForB = (id: string) => {
    setSetupBId(id);
  };

  const handleReset = () => {
    setViewMode("select");
    setSetupAId("");
    setSetupBId("");
  };

  return (
    <div class="space-y-4">
      <Show when={viewMode() === "select"}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-border/50 bg-surface/50 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Setup A (Base)
            </h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <For each={allSetups}>
                {(setup) => (
                  <button
                    type="button"
                    class={`w-full text-left p-2 border transition-colors ${
                      setupAId() === setup.id
                        ? "border-foreground bg-foreground/10"
                        : "border-border/30 hover:border-foreground/30"
                    }`}
                    onClick={() => handleSelectForA(setup.id)}
                  >
                    <div class="text-xs font-bold text-foreground">
                      {setup.name}
                    </div>
                    <div class="text-[10px] text-muted">{setup.carName}</div>
                  </button>
                )}
              </For>
            </div>
            <Show when={allSetups.length === 0}>
              <p class="text-xs text-muted">No setups available</p>
            </Show>
          </div>

          <div class="border border-border/50 bg-surface/50 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-muted mb-3">
              Setup B (Compare)
            </h3>
            <div class="space-y-2 max-h-60 overflow-y-auto">
              <For each={allSetups}>
                {(setup) => (
                  <button
                    type="button"
                    class={`w-full text-left p-2 border transition-colors ${
                      setupBId() === setup.id
                        ? "border-foreground bg-foreground/10"
                        : "border-border/30 hover:border-foreground/30"
                    }`}
                    onClick={() => handleSelectForB(setup.id)}
                  >
                    <div class="text-xs font-bold text-foreground">
                      {setup.name}
                    </div>
                    <div class="text-[10px] text-muted">{setup.carName}</div>
                  </button>
                )}
              </For>
            </div>
            <Show when={allSetups.length === 0}>
              <p class="text-xs text-muted">No setups available</p>
            </Show>
          </div>
        </div>

        <div class="flex justify-center">
          <button
            type="button"
            onClick={handleStartComparison}
            disabled={!setupAId() || !setupBId() || setupAId() === setupBId()}
            class="px-6 py-2 bg-foreground text-background font-bold text-xs uppercase tracking-wider hover:bg-foreground-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare Setups
          </button>
        </div>
      </Show>

      <Show when={viewMode() === "compare" && comparisonDiff()}>
        <div class="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handleReset}
            class="px-3 py-1.5 bg-foreground/10 border border-foreground/20 text-foreground-secondary hover:text-foreground text-xs uppercase tracking-wider"
          >
            ← Back to Selection
          </button>
          <div class="flex items-center gap-2 text-xs text-muted">
            <span class="text-foreground">
              {comparisonDiff()?.summary.totalDiffs} of{" "}
              {comparisonDiff()?.categories.reduce(
                (acc, cat) => acc + cat.fields.length,
                0,
              )}{" "}
              fields differ
            </span>
            <span class="w-1 h-1 bg-muted" />
            <span class="text-red-500">
              {comparisonDiff()?.summary.highImpact} high
            </span>
            <span class="w-1 h-1 bg-muted" />
            <span class="text-yellow-500">
              {comparisonDiff()?.summary.mediumImpact} medium
            </span>
            <span class="w-1 h-1 bg-muted" />
            <span class="text-green-500">
              {comparisonDiff()?.summary.lowImpact} low
            </span>
          </div>
        </div>

        <ComparisonTable
          diff={comparisonDiff()!}
          onApplyField={(field, value) => props.onApplyValue(field.path, value)}
        />
      </Show>
    </div>
  );
}
