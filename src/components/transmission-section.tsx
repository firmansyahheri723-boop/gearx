import { Component, For, createMemo } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from './ui/section-header';
import { EditableCell } from './ui/editable-cell';
import { GearSlider } from './ui/gear-slider';
import { DataTable } from './ui/data-table';
import { HelpTooltip, HelpLink } from './ui/help-tooltip';
import { torqueRpmData, setTorqueRpmData, gearRatios, setGearRatios } from '../stores/vehicle';
import type { TorqueRpmRow, GearRatio } from '../types';

// Help tooltip content for transmission sections
const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  transmission: {
    description:
      "Configure your vehicle's transmission characteristics including the engine's torque curve and individual gear ratios. This data is used to calculate acceleration, optimal shift points, and wheel torque output.",
    articles: [
      { label: "Wikipedia: Transmission", url: "https://en.wikipedia.org/wiki/Transmission_(mechanics)" },
    ],
    videos: [
      { label: "Engine & Transmission Swap Guide", url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz" },
      { label: "Transmission Talk", url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M" },
    ],
  },
  torqueCurve: {
    description:
      "Engine torque output at various RPM points. This data defines the engine's power characteristics and is used to calculate acceleration, optimal shift points, and gear ratios. Higher torque at lower RPM provides better drivability, while peak torque at higher RPM favors top-end power.",
    articles: [
      { label: "Wikipedia: Torque Curve", url: "https://en.wikipedia.org/wiki/Torque_curve" },
      { label: "Wikipedia: Engine Power", url: "https://en.wikipedia.org/wiki/Power_(physics)" },
    ],
    videos: [
      { label: "Engine & Transmission Swap Guide", url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz" },
      { label: "Engine Talk", url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10" },
    ],
  },
  gearRatios: {
    description:
      "Individual gear multipliers that determine the mechanical advantage at each gear. Lower gears have higher ratios for acceleration, while higher gears have lower ratios for speed and fuel efficiency. Adjust the slider within the min/max range, or click the min/max values to expand the range.",
    articles: [
      { label: "Wikipedia: Gear Ratio", url: "https://en.wikipedia.org/wiki/Gear_ratio" },
      { label: "Wikipedia: Transmission", url: "https://en.wikipedia.org/wiki/Transmission_(mechanics)" },
    ],
    videos: [
      { label: "Gear Ratios Guide", url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN" },
      { label: "Transmission Talk", url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M" },
    ],
  },
  gearGap: {
    description:
      "The difference between the previous gear ratio and current gear ratio. Gaps naturally decrease for higher gears due to logarithmic gear spacing, helping maintain the engine in its powerband across shifts.",
  },
};

// Column definitions for Torque/RPM table
const torqueColumns: ColumnDef<TorqueRpmRow & { index: number }>[] = [
  {
    accessorKey: 'torque',
    header: 'Torque, Nm',
    cell: (info) => {
      const rowData = info.row.original;
      return (
        <EditableCell
          value={rowData.torque}
          onChange={(v) => setTorqueRpmData(rowData.index, 'torque', parseFloat(v) || 0)}
          tableId="torque"
          row={rowData.index}
          col={0}
          asContent
        />
      );
    },
  },
  {
    accessorKey: 'rpm',
    header: 'RPM',
    cell: (info) => {
      const rowData = info.row.original;
      return (
        <EditableCell
          value={rowData.rpm}
          onChange={(v) => setTorqueRpmData(rowData.index, 'rpm', parseFloat(v) || 0)}
          tableId="torque"
          row={rowData.index}
          col={1}
          asContent
        />
      );
    },
  },
];

export const TransmissionSection: Component = () => {
  // Add index to torque data for cell tracking
  const torqueDataWithIndex = createMemo(() =>
    torqueRpmData.map((row, index) => ({ ...row, index }))
  );

  // Calculate gear gaps (difference from previous gear ratio, skipping final drive)
  const gearGaps = createMemo(() => {
    return gearRatios.map((gear, index) => {
      // Skip final drive and first numbered gear (no previous gear to compare)
      const isFinalDrive = gear.gear.toLowerCase().includes('final');
      if (isFinalDrive) return null;

      // Find previous numbered gear (skip final drive)
      let prevIndex = index - 1;
      while (prevIndex >= 0 && gearRatios[prevIndex].gear.toLowerCase().includes('final')) {
        prevIndex--;
      }

      // No previous numbered gear found (this is 1st gear)
      if (prevIndex < 0) return null;

      const prevGear = gearRatios[prevIndex];
      return prevGear.ratio - gear.ratio;
    });
  });

  return (
    <div class="border border-slate-800/50 bg-slate-950/50">
      <SectionHeader
        title="Transmission"
        variant="input"
        help={{
          description: HELP_CONTENT.transmission.description,
          articles: HELP_CONTENT.transmission.articles,
          videos: HELP_CONTENT.transmission.videos,
          position: "bottom",
        }}
      />

      <div class="flex flex-col lg:flex-row">
        {/* Torque/RPM Table - Scrollable */}
        <div class="flex-1 border-r border-slate-800/30">
          <div class="px-3 py-2 border-b border-slate-800/30 bg-slate-900/30 flex items-center justify-between">
            <span class="text-[10px] uppercase tracking-wider text-slate-500">
              Torque Curve Data
            </span>
            <HelpTooltip
              description={HELP_CONTENT.torqueCurve.description}
              articles={HELP_CONTENT.torqueCurve.articles}
              videos={HELP_CONTENT.torqueCurve.videos}
              position="bottom"
            />
          </div>
          <DataTable
            data={torqueDataWithIndex()}
            columns={torqueColumns}
          />
        </div>

        {/* Gear Ratios with Sliders */}
        <div class="flex-1">
          <div class="px-3 py-2 border-b border-slate-800/30 bg-slate-900/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider text-slate-500">
                Gear Ratios
              </span>
              <HelpTooltip
                description={HELP_CONTENT.gearRatios.description}
                articles={HELP_CONTENT.gearRatios.articles}
                videos={HELP_CONTENT.gearRatios.videos}
                position="bottom"
              />
            </div>
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
                <th class="border-r border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center w-24">
                  Ratio
                </th>
                <th class="border-b border-slate-800/50 bg-slate-900/50 px-2 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center w-16">
                  <div class="flex items-center justify-center gap-1">
                    Gap
                    <HelpTooltip
                      description={HELP_CONTENT.gearGap.description}
                      position="left"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={gearRatios}>
                {(gear, index) => (
                  <GearSlider
                    gear={gear}
                    index={index()}
                    gap={gearGaps()[index()]}
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
