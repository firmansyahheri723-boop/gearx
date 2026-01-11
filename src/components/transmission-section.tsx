import { Component, For, createMemo, createSignal, Show } from "solid-js";
import type { ColumnDef } from "@tanstack/solid-table";
import { SectionHeader } from "./ui/section-header";
import { EditableCell } from "./ui/editable-cell";
import { GearSlider } from "./ui/gear-slider";
import { DataTable } from "./ui/data-table";
import { GearSpeedChart } from "./ui/gear-speed-chart";
import { GearTorqueChart } from "./ui/gear-torque-chart";
import { HelpTooltip, HelpLink } from "./ui/help-tooltip";
import { TorqueExtractor } from "./ui/torque-extractor";
import {
  torqueRpmData,
  setTorqueRpmData,
  gearRatios,
  setGearRatios,
  finalDrive,
  setFinalDrive,
  vehicleInputs,
  tireCompound,
} from "../stores/vehicle";
import { calculateGearboxOutputs } from "../utils/gearbox";
import type { TorqueRpmRow } from "../types";
import { GEAR_LABELS } from "../types";

// Help tooltip content for transmission sections
const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  transmission: {
    description:
      "Configure your vehicle's transmission characteristics including the engine's torque curve and individual gear ratios. This data is used to calculate acceleration, optimal shift points, and wheel torque output.",
    articles: [
      {
        label: "Wikipedia: Transmission",
        url: "https://en.wikipedia.org/wiki/Transmission_(mechanics)",
      },
    ],
    videos: [
      {
        label: "Engine & Transmission Swap Guide",
        url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz",
      },
      {
        label: "Transmission Talk",
        url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
      },
    ],
  },
  torqueCurve: {
    description:
      "Engine torque output at various RPM points. This data defines the engine's power characteristics and is used to calculate acceleration, optimal shift points, and gear ratios. Higher torque at lower RPM provides better drivability, while peak torque at higher RPM favors top-end power.",
    articles: [
      {
        label: "Wikipedia: Torque Curve",
        url: "https://en.wikipedia.org/wiki/Torque_curve",
      },
      {
        label: "Wikipedia: Engine Power",
        url: "https://en.wikipedia.org/wiki/Power_(physics)",
      },
    ],
    videos: [
      {
        label: "Engine & Transmission Swap Guide",
        url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz",
      },
      {
        label: "Engine Talk",
        url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10",
      },
    ],
  },
  gearRatios: {
    description:
      "Individual gear multipliers that determine the mechanical advantage at each gear. Lower gears have higher ratios for acceleration, while higher gears have lower ratios for speed and fuel efficiency. Adjust the slider within the min/max range, or click the min/max values to expand the range.",
    articles: [
      {
        label: "Wikipedia: Gear Ratio",
        url: "https://en.wikipedia.org/wiki/Gear_ratio",
      },
      {
        label: "Wikipedia: Transmission",
        url: "https://en.wikipedia.org/wiki/Transmission_(mechanics)",
      },
    ],
    videos: [
      {
        label: "Gear Ratios Guide",
        url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
      },
      {
        label: "Transmission Talk",
        url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
      },
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
    accessorKey: "torque",
    header: "Torque, Nm",
    cell: (info) => {
      const rowData = info.row.original;
      return (
        <EditableCell
          value={rowData.torque}
          onChange={(v) =>
            setTorqueRpmData(rowData.index, "torque", parseFloat(v) || 0)
          }
          tableId="torque"
          row={rowData.index}
          col={0}
          asContent
        />
      );
    },
  },
  {
    accessorKey: "rpm",
    header: "RPM",
    cell: (info) => {
      const rowData = info.row.original;
      return (
        <EditableCell
          value={rowData.rpm}
          onChange={(v) =>
            setTorqueRpmData(rowData.index, "rpm", parseFloat(v) || 0)
          }
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
  const [showExtractor, setShowExtractor] = createSignal(false);
  const [importedImageUrl, setImportedImageUrl] = createSignal<string | null>(
    null,
  );

  const handleApplyExtractedData = (
    data: { torque: number; rpm: number }[],
    imageUrl?: string,
  ) => {
    // Store the image URL for display
    if (imageUrl) {
      setImportedImageUrl(imageUrl);
    }
    // Clear existing data and replace with extracted data
    // First, we need to resize the store to match the new data length
    for (let i = 0; i < data.length; i++) {
      if (i < torqueRpmData.length) {
        setTorqueRpmData(i, "torque", data[i].torque);
        setTorqueRpmData(i, "rpm", data[i].rpm);
      }
    }
  };

  const torqueDataWithIndex = createMemo(() =>
    torqueRpmData.map((row, index) => ({ ...row, index })),
  );

  // Calculate gear gaps (difference from previous gear ratio)
  const gearGaps = createMemo(() => {
    return gearRatios.map((gear, index) => {
      // First gear has no previous gear to compare
      if (index === 0) return null;
      const prevGear = gearRatios[index - 1];
      return prevGear.ratio - gear.ratio;
    });
  });

  // Calculate gearbox outputs for charts
  const outputs = createMemo(() =>
    calculateGearboxOutputs({
      tireWidth: vehicleInputs.tireWidth,
      profile: vehicleInputs.profile,
      wheelDiameter: vehicleInputs.wheelDiameter,
      gearRatios: [...gearRatios],
      finalDrive: finalDrive.ratio,
      torqueRpmData: [...torqueRpmData],
      weight: vehicleInputs.weight,
      frontWeightDistribution: vehicleInputs.frontWeightDistribution,
      cogHeight: vehicleInputs.cogHeight,
      wheelbase: vehicleInputs.wheelbase,
      drivetrain: vehicleInputs.drivetrain,
      tireCompound: tireCompound.value,
      acceleration0to100: vehicleInputs.acceleration0to100,
    }),
  );

  const activeGears = createMemo(() => {
    const gears: { index: number; name: string; ratio: number }[] = [];
    for (let i = 0; i < gearRatios.length; i++) {
      if (gearRatios[i].ratio > 0) {
        gears.push({
          index: i,
          name: GEAR_LABELS[i],
          ratio: gearRatios[i].ratio,
        });
      }
    }
    return gears;
  });

  // Chart data - only include active gears with data
  const chartSpeedRpmData = createMemo(() => {
    return activeGears()
      .map((gear) => outputs().speedRpmData[gear.index])
      .filter((data) => data && data.length > 0);
  });

  const chartGearNames = createMemo(() => {
    return activeGears()
      .filter((gear) => outputs().speedRpmData[gear.index]?.length > 0)
      .map((gear) => gear.name);
  });

  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50">
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

      {/* Compact Charts Row */}
      <div class="border-t border-neutral-800/30">
        <div class="px-3 py-2 border-b border-neutral-800/30 bg-neutral-900/30">
          <span class="text-[10px] uppercase tracking-wider text-neutral-500">
            Speed & Torque Preview
          </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 mb-10">
          <div class="p-2 sm:p-3 border-r border-neutral-800/30">
            <GearSpeedChart
              speedRpmData={chartSpeedRpmData()}
              gearNames={chartGearNames()}
              redlineRpm={vehicleInputs.redlineRpm}
              height={220}
            />
          </div>
          <div class="p-2 sm:p-3">
            <GearTorqueChart
              speedRpmData={chartSpeedRpmData()}
              gearNames={chartGearNames()}
              tractionLimit={outputs().tractionLimitTorque}
              peakHpRpm={outputs().peakHpRpm}
              height={220}
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row">
        {/* Torque/RPM Table */}
        <div class="flex-1 border-r border-neutral-800/30">
          <div class="px-3 py-2 border-b border-neutral-800/30 bg-neutral-900/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider text-neutral-500">
                Torque Curve Data
              </span>
              <HelpTooltip
                description={HELP_CONTENT.torqueCurve.description}
                articles={HELP_CONTENT.torqueCurve.articles}
                videos={HELP_CONTENT.torqueCurve.videos}
                position="bottom"
              />
            </div>
          </div>

          {/* Image Import Placeholder */}
          <div class="p-3 border-b border-neutral-800/30">
            <Show
              when={importedImageUrl()}
              fallback={
                <button
                  type="button"
                  onClick={() => setShowExtractor(true)}
                  class="w-full aspect-[4/3] max-h-48 border border-neutral-800 hover:border-neutral-600 bg-neutral-900/50 hover:bg-neutral-900 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group"
                >
                  <div class="w-10 h-10 border border-neutral-700 group-hover:border-neutral-500 bg-neutral-800/50 flex items-center justify-center transition-colors">
                    <svg
                      class="w-5 h-5 text-neutral-600 group-hover:text-neutral-400 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span class="text-[10px] uppercase tracking-wider text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    Import from Image
                  </span>
                </button>
              }
            >
              <div class="flex flex-col gap-2">
                <div class="w-full aspect-[4/3] max-h-48 border border-neutral-800 bg-neutral-900/50 overflow-hidden">
                  <img
                    src={importedImageUrl()!}
                    alt="Imported torque curve"
                    class="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowExtractor(true)}
                  class="w-full border border-neutral-700 hover:border-neutral-600 bg-neutral-800 hover:bg-neutral-700 text-neutral-500 hover:text-neutral-400 px-4 py-2 text-xs uppercase tracking-wider transition-colors"
                >
                  Replace Torque Curve Image
                </button>
              </div>
            </Show>
          </div>

          <DataTable data={torqueDataWithIndex()} columns={torqueColumns} />
        </div>

        {/* Gear Ratios with Sliders */}
        <div class="flex-1">
          <div class="px-3 py-2 border-b border-neutral-800/30 bg-neutral-900/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-[10px] uppercase tracking-wider text-neutral-500">
                Gear Ratios
              </span>
              <HelpTooltip
                description={HELP_CONTENT.gearRatios.description}
                articles={HELP_CONTENT.gearRatios.articles}
                videos={HELP_CONTENT.gearRatios.videos}
                position="bottom"
              />
            </div>
            <span class="text-[9px] text-neutral-600">
              click min/max to edit
            </span>
          </div>
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th class="border-r border-b border-neutral-800/50 bg-neutral-900/50 px-3 py-2 text-neutral-500 text-[10px] uppercase tracking-wider text-center w-20">
                  Gear
                </th>
                <th class="border-r border-b border-neutral-800/50 bg-neutral-900/50 px-3 py-2 text-neutral-500 text-[10px] uppercase tracking-wider text-center">
                  Range
                </th>
                <th class="border-r border-b border-neutral-800/50 bg-neutral-900/50 px-3 py-2 text-neutral-500 text-[10px] uppercase tracking-wider text-center w-24">
                  Ratio
                </th>
                <th class="border-b border-neutral-800/50 bg-neutral-900/50 px-2 py-2 text-neutral-500 text-[10px] uppercase tracking-wider text-center w-16">
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
              {/* Final Drive slider */}
              <GearSlider
                gear={finalDrive}
                label="Final"
                index={0}
                gap={null}
                isFinalDrive
                onRatioChange={(v) => setFinalDrive("ratio", v)}
                onMinChange={(v) => setFinalDrive("min", v)}
                onMaxChange={(v) => setFinalDrive("max", v)}
              />
              {/* Gear ratio sliders */}
              <For each={gearRatios}>
                {(gear, index) => (
                  <GearSlider
                    gear={gear}
                    label={GEAR_LABELS[index()]}
                    index={index()}
                    gap={gearGaps()[index()]}
                    onRatioChange={(v) => setGearRatios(index(), "ratio", v)}
                    onMinChange={(v) => setGearRatios(index(), "min", v)}
                    onMaxChange={(v) => setGearRatios(index(), "max", v)}
                  />
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      {/* Torque Curve Extractor Modal */}
      <Show when={showExtractor()}>
        <TorqueExtractor
          onClose={() => setShowExtractor(false)}
          onApply={handleApplyExtractedData}
        />
      </Show>
    </div>
  );
};
