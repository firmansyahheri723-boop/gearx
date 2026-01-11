import { createFileRoute } from '@tanstack/solid-router';
import { createMemo, Show } from 'solid-js';
import { SwitchRoot, SwitchControl, SwitchThumb, SwitchHiddenInput } from '@ark-ui/solid/switch';
import { AeroInputsSection } from '../components/tabs/aero/aero-inputs-section';
import { AeroOutputsSection } from '../components/tabs/aero/aero-outputs-section';
import { AeroExperimentalSection } from '../components/tabs/aero/aero-experimental-section';
import { aeroSettings, aeroExperimentalEnabled, toggleAeroExperimental } from '../stores/vehicle';
import { getSelectedCar } from '../stores/car-data';
import { calculateStandardAero, calculateExperimentalAero } from '../utils/aero';

export const Route = createFileRoute('/aero')({
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
        enabled: aeroExperimentalEnabled.value,
      },
    };
  });

  return (
    <div class="space-y-4">
      <AeroInputsSection />

      <AeroOutputsSection standardOutput={standardOutput()} />

      <div class="border border-border/50 bg-background/50 p-4">
        <SwitchRoot
          checked={aeroExperimentalEnabled.value}
          onCheckedChange={toggleAeroExperimental}
          class="flex items-center gap-3 cursor-pointer"
        >
          <SwitchControl class="relative w-10 h-5 transition-colors border border-border/50 bg-surface data-[state=checked]:bg-amber-500">
            <SwitchThumb class="block w-4 h-4 bg-white shadow transition-transform data-[state=unchecked]:translate-x-0.5 data-[state=checked]:translate-x-[1.375rem]" />
          </SwitchControl>
          <SwitchHiddenInput />
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-foreground">Show Experimental Physics</span>
            <span class="px-1.5 py-0.5 text-[10px] font-bold tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
              EXPERIMENTAL
            </span>
          </div>
        </SwitchRoot>
        <p class="mt-2 text-xs text-foreground-secondary">
          Enable to see estimated real-world aerodynamic values. When enabled, affects suspension and gearbox calculations.
        </p>
      </div>

      <Show when={aeroExperimentalEnabled.value}>
        <AeroExperimentalSection output={experimentalOutput()} />
      </Show>
    </div>
  );
}
