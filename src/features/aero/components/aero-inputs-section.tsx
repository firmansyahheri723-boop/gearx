import { Component } from 'solid-js';
import { SectionHeader } from '@/components/ui/section-header';
import { RangeSliderInput } from '@/components/ui/range-slider-input';
import { aeroSettings, setAeroSettings } from '@/features/aero/store';

export function AeroInputsSection() {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader title="Aero Settings" variant="input" />

      <table class="w-full border-collapse text-sm">
        <tbody>
          <tr>
            <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50 w-1/3">
              <div class="flex items-center justify-between">
                <span>Front Aero</span>
              </div>
            </td>
            <td class="border-b border-border/50 p-0 bg-surface-elevated/40">
              <RangeSliderInput
                min={0}
                max={10}
                step={1}
                value={aeroSettings.frontAero}
                onChange={(val) => setAeroSettings('frontAero', val)}
                minLabel="0"
                maxLabel="10"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>

          <tr>
            <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
              <div class="flex items-center justify-between">
                <span>Rear Aero</span>
              </div>
            </td>
            <td class="border-b border-border/50 p-0 bg-surface-elevated/40">
              <RangeSliderInput
                min={0}
                max={10}
                step={1}
                value={aeroSettings.rearAero}
                onChange={(val) => setAeroSettings('rearAero', val)}
                minLabel="0"
                maxLabel="10"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>

          <tr>
            <td class="border-r border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
              <div class="flex items-center justify-between">
                <span>Air Resistance</span>
              </div>
            </td>
            <td class="border-border/50 p-0 bg-surface-elevated/40">
              <RangeSliderInput
                min={0}
                max={10}
                step={1}
                value={aeroSettings.airResistance}
                onChange={(val) => setAeroSettings('airResistance', val)}
                minLabel="0"
                maxLabel="10"
                showNumberInput={true}
                numberInputWidth="w-14"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="p-3 text-[10px] text-foreground-secondary/70 bg-surface/30">
        <span class="font-medium">Tip:</span> Front aero at maximum provides best grip. Reduce rear aero if experiencing high-speed understeer.
      </div>
    </div>
  );
};
