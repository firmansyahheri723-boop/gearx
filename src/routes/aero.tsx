import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, Show } from "solid-js";
import {
  SwitchRoot,
  SwitchControl,
  SwitchThumb,
  SwitchHiddenInput,
} from "@ark-ui/solid/switch";
import { AeroInputsSection } from "@/features/aero/components/aero-inputs-section";
import { AeroOutputsSection } from "@/features/aero/components/aero-outputs-section";
import { AeroExperimentalSection } from "@/features/aero/components/aero-experimental-section";
import {
  aeroSettings,
  aeroExperimentalEnabled,
  toggleAeroExperimental,
} from "@/features/aero/store";
import { getSelectedCar } from "@/features/database/store";
import {
  calculateStandardAero,
  calculateExperimentalAero,
} from "@/features/aero/aero";

export const Route = createFileRoute("/aero")({
  component: Aero,
});

function Aero() {
  const standardOutput = createMemo(() => calculateStandardAero(aeroSettings));

  const experimentalOutput = createMemo(() => {
    const carData = getSelectedCar();
    return calculateExperimentalAero(aeroSettings, carData, 200);
  });

  const effectiveOutputs = createMemo(() => {
    const std = standardOutput();
    const exp = experimentalOutput();
    return {
      ...std,
      experimental: {
        ...exp,
        enabled: aeroExperimentalEnabled(),
      },
    };
  });

  return (
    <div class="space-y-4">
      <AeroInputsSection />

      <AeroOutputsSection standardOutput={standardOutput()} />

      <div class="border border-border/50 bg-background/50 p-4">
        <SwitchRoot
          checked={aeroExperimentalEnabled()}
          onCheckedChange={toggleAeroExperimental}
          class="flex items-center gap-3 cursor-pointer"
        >
          <SwitchControl class="relative w-10 h-5 transition-colors border border-border/50 bg-surface data-[state=checked]:bg-amber-500">
            <SwitchThumb class="block w-4 h-4 bg-white shadow transition-transform data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-5.5" />
          </SwitchControl>
          <SwitchHiddenInput />
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-foreground">
              Show Experimental Physics
            </span>
            <span class="px-1.5 py-0.5 text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
              EXPERIMENTAL
            </span>
          </div>
        </SwitchRoot>
        <p class="mt-2 text-xs text-foreground-secondary">
          Enable to see estimated real-world aerodynamic values. When enabled,
          affects suspension and gearbox calculations.
        </p>
      </div>

      <Show when={aeroExperimentalEnabled()}>
        <AeroExperimentalSection output={experimentalOutput()} />
      </Show>
    </div>
  );
}
