import { Component, For } from "solid-js";
import { SectionHeader } from "../../../components/ui/section-header";
import type { AeroStandardOutput } from "../../../types";
import { getAeroBalanceDescription } from "../utils/aero";

interface AeroOutputsSectionProps {
  standardOutput: AeroStandardOutput;
}

export function AeroOutputsSection(props: AeroOutputsSectionProps) {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader title="Balance Analysis" variant="output" />

      <div class="p-4 space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-foreground-secondary">Aero Balance</span>
            <span class="font-medium">
              {props.standardOutput.aeroBalancePct.toFixed(1)}% Front
            </span>
          </div>
          <div class="h-6 bg-surface overflow-hidden flex border border-border/30">
            <div
              class="h-full transition-all duration-300 bg-foreground/60"
              style={{
                width: `${props.standardOutput.aeroBalancePct}%`,
              }}
            />
            <div class="h-full transition-all duration-300 flex-1 bg-foreground/30" />
          </div>
          <div class="flex items-center justify-between text-xs text-muted">
            <span>Front</span>
            <span class="font-medium text-foreground">
              {getAeroBalanceDescription(props.standardOutput.aeroBalancePct)}
            </span>
            <span>Rear</span>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="bg-surface/50 p-3 text-center">
            <div class="text-lg font-semibold text-blue-500">
              {props.standardOutput.frontDownforceRelative}
            </div>
            <div class="text-xs text-foreground-secondary">Front (rel)</div>
          </div>
          <div class="bg-surface/50 p-3 text-center">
            <div class="text-lg font-semibold text-emerald-500">
              {props.standardOutput.rearDownforceRelative}
            </div>
            <div class="text-xs text-foreground-secondary">Rear (rel)</div>
          </div>
          <div class="bg-surface/50 p-3 text-center">
            <div
              class="text-lg font-semibold capitalize"
              classList={{
                "text-amber-500":
                  props.standardOutput.predictedBehavior === "understeer",
                "text-emerald-500":
                  props.standardOutput.predictedBehavior === "neutral",
                "text-orange-500":
                  props.standardOutput.predictedBehavior === "oversteer",
                "text-red-500":
                  props.standardOutput.predictedBehavior ===
                  "extreme_oversteer",
              }}
            >
              {props.standardOutput.predictedBehavior === "extreme_oversteer"
                ? "Oversteer+"
                : props.standardOutput.predictedBehavior}
            </div>
            <div class="text-xs text-foreground-secondary">Behavior</div>
          </div>
        </div>

        <div class="space-y-1">
          <div class="text-xs uppercase tracking-wide text-foreground-secondary">
            Recommendations
          </div>
          <ul class="space-y-1">
            <For each={props.standardOutput.recommendations}>
              {(rec) => (
                <li class="text-xs text-foreground-secondary/80 flex items-start gap-2">
                  <span class="text-emerald-500 mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </div>
  );
};
