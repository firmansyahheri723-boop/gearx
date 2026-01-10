import { Component, For } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { EditableCell } from './ui/editable-cell';
import { GearSlider } from './ui/gear-slider';
import { torqueRpmData, setTorqueRpmData, gearRatios, setGearRatios } from '../stores/vehicle';

export const TransmissionSection: Component = () => {
  return (
    <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
      <SectionHeader title="Transmission" variant="input" />

      <div class="flex flex-col lg:flex-row">
        {/* Torque/RPM Table - Scrollable */}
        <div class="flex-1 border-r border-slate-800/30">
          <div class="px-3 py-2 border-b border-slate-800/30 bg-slate-900/30">
            <span class="text-[10px] uppercase tracking-wider text-slate-500">
              Torque Curve Data
            </span>
          </div>
          <div class="max-h-[350px] overflow-y-auto">
            <table class="w-full border-collapse text-sm">
              <thead class="sticky top-0 z-10">
                <tr>
                  <th class="border-r border-b border-slate-800/50 bg-slate-900 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center">
                    Torque, Nm
                  </th>
                  <th class="border-b border-slate-800/50 bg-slate-900 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center">
                    RPM
                  </th>
                </tr>
              </thead>
              <tbody>
                <For each={torqueRpmData}>
                  {(row, index) => (
                    <tr>
                      <EditableCell
                        value={row.torque}
                        onChange={(v) => setTorqueRpmData(index(), 'torque', parseFloat(v) || 0)}
                        tableId="torque"
                        row={index()}
                        col={0}
                      />
                      <EditableCell
                        value={row.rpm}
                        onChange={(v) => setTorqueRpmData(index(), 'rpm', parseFloat(v) || 0)}
                        tableId="torque"
                        row={index()}
                        col={1}
                      />
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>

        {/* Gear Ratios with Sliders */}
        <div class="w-full lg:w-[420px]">
          <div class="px-3 py-2 border-b border-slate-800/30 bg-slate-900/30 flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-slate-500">
              Gear Ratios
            </span>
            <span class="text-[9px] text-slate-600">click min/max to edit</span>
          </div>
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th class="border-r border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center w-20">
                  Gear
                </th>
                <th class="border-r border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center">
                  Range
                </th>
                <th class="border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center w-24">
                  Ratio
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={gearRatios}>
                {(gear, index) => (
                  <GearSlider
                    gear={gear}
                    index={index()}
                    onRatioChange={(v) => setGearRatios(index(), 'ratio', v)}
                    onMinChange={(v) => setGearRatios(index(), 'min', v)}
                    onMaxChange={(v) => setGearRatios(index(), 'max', v)}
                  />
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
