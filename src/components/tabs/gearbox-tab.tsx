import { Component, For, createMemo, Show } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from '../ui/section-header';
import { DataTable } from '../ui/data-table';
import { GearSpeedChart } from '../ui/gear-speed-chart';
import { GearTorqueChart } from '../ui/gear-torque-chart';
import { HelpLink } from '../ui/help-tooltip';
import { GEAR_COLORS } from '../../constants/colors';
import {
  vehicleInputs,
  torqueRpmData,
  gearRatios,
  finalDrive,
  tireCompound,
  setTireCompound,
} from '../../stores/vehicle';
import { calculateGearboxOutputs } from '../../utils/gearbox';
import type { TireCompound, SpeedRpmPoint } from '../../types';
import { GEAR_LABELS } from '../../types';

// Help tooltip content for gearbox sections
const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  calculatedMetrics: {
    description:
      "Key performance metrics calculated from your engine and drivetrain setup. Peak HP shows maximum power output, traction limit is the maximum torque the tires can handle before wheelspin, and final drive is the differential ratio that multiplies all gear ratios.",
    articles: [
      { label: "Wikipedia: Horsepower", url: "https://en.wikipedia.org/wiki/Horsepower" },
      { label: "Wikipedia: Final Drive", url: "https://en.wikipedia.org/wiki/Final_drive" },
    ],
    videos: [
      { label: "Gear Ratios Guide", url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN" },
      { label: "Transmission Talk", url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M" },
    ],
  },
  tireCompound: {
    description:
      "Select the tire compound to calculate traction limits. Higher friction coefficient (u) means more grip but also faster wear. Street tires are durable but have less grip, racing compounds offer maximum grip but wear quickly. This affects wheelspin calculations.",
    articles: [
      { label: "Wikipedia: Tire", url: "https://en.wikipedia.org/wiki/Tire" },
    ],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  effectiveDriveRatios: {
    description:
      "The effective gear ratio is each gear ratio multiplied by the final drive ratio. This determines the actual mechanical advantage at each gear. Lower gears have higher effective ratios for acceleration, while higher gears have lower ratios for top speed.",
    articles: [
      { label: "Wikipedia: Gear Ratio", url: "https://en.wikipedia.org/wiki/Gear_ratio" },
    ],
    videos: [
      { label: "Gear Ratios Guide", url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN" },
      { label: "Transmission Talk", url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M" },
    ],
  },
  speedVsRpm: {
    description:
      "Vehicle speed at each RPM point for all gears. Use this to identify optimal shift points and match gears to track requirements. Red cells indicate speeds where the engine would exceed traction limits. Higher gears reach higher speeds but at reduced acceleration.",
    articles: [
      { label: "Wikipedia: Gear Ratio", url: "https://en.wikipedia.org/wiki/Gear_ratio" },
    ],
    videos: [
      { label: "Gear Ratios Guide", url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN" },
    ],
  },
  wheelTorqueOutput: {
    description:
      "Torque delivered to the wheels at each RPM in each gear. Wheel torque determines acceleration capability. Red cells show RPM ranges where wheel torque exceeds traction limit, causing wheelspin. Peak HP row is highlighted - shifting near peak HP maximizes power delivery.",
    articles: [
      { label: "Wikipedia: Torque", url: "https://en.wikipedia.org/wiki/Torque" },
    ],
    videos: [
      { label: "Gear Ratios Guide", url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN" },
      { label: "Transmission Talk", url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M" },
    ],
  },
  tractionAnalysis: {
    description:
      "Per-gear breakdown of traction behavior. Shows what percentage of the RPM range exceeds traction limits (wheelspin zone). Lower gears typically have more wheelspin due to higher torque multiplication. Adjust final drive or tire compound to optimize traction.",
    articles: [
      { label: "Wikipedia: Traction", url: "https://en.wikipedia.org/wiki/Traction_(engineering)" },
    ],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  speedRpmChart: {
    description:
      "Visual representation of vehicle speed at each RPM point across all gears. Each line represents a gear - use this to visualize speed overlap between gears and identify optimal shift points for your target speed range.",
    articles: [
      { label: "Wikipedia: Gear Ratio", url: "https://en.wikipedia.org/wiki/Gear_ratio" },
    ],
  },
  wheelTorqueChart: {
    description:
      "Wheel torque output visualization showing torque delivered to wheels across the RPM range. The red dashed line indicates traction limit - any torque above this line will cause wheelspin. Lower gears produce higher torque but are more likely to exceed traction limits.",
    articles: [
      { label: "Wikipedia: Torque", url: "https://en.wikipedia.org/wiki/Torque" },
    ],
  },
};

const TIRE_OPTIONS: { value: TireCompound; label: string; friction: number }[] = [
  { value: 'street', label: 'Street', friction: 1.12 },
  { value: 'street+', label: 'Street+', friction: 1.16 },
  { value: 'sport', label: 'Sport', friction: 1.40 },
  { value: 'sport+', label: 'Sport+', friction: 1.45 },
  { value: 'racing', label: 'Racing', friction: 1.70 },
  { value: 'racing+', label: 'Racing+', friction: 1.836 },
];

// Row type for Speed vs RPM table
interface SpeedRpmTableRow {
  rpmIndex: number;
  rpm: number;
  gearSpeeds: { gearIndex: number; gearName: string; speed: number; exceedsTraction: boolean }[];
}

// Row type for Wheel Torque table
interface WheelTorqueTableRow {
  rpmIndex: number;
  rpm: number;
  torque: number;
  hp: number;
  isAtPeakHp: boolean;
  gearTorques: { gearIndex: number; gearName: string; wheelTorque: number; exceedsTraction: boolean }[];
}

export const GearboxTab: Component = () => {
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
    })
  );

  // Get active gears (ratio > 0)
  // index corresponds directly to position in gearRatios array and outputs arrays
  const activeGears = createMemo(() => {
    const gears: { index: number; name: string; ratio: number }[] = [];
    for (let i = 0; i < gearRatios.length; i++) {
      const gear = gearRatios[i];
      if (gear.ratio > 0) {
        gears.push({ index: i, name: GEAR_LABELS[i], ratio: gear.ratio });
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

  // Speed vs RPM table data
  const speedRpmTableData = createMemo((): SpeedRpmTableRow[] => {
    return torqueRpmData.map((row, rpmIndex) => ({
      rpmIndex,
      rpm: row.rpm,
      gearSpeeds: activeGears().map((gear) => {
        const data = outputs().speedRpmData[gear.index]?.[rpmIndex];
        return {
          gearIndex: gear.index,
          gearName: gear.name,
          speed: data?.speed ?? 0,
          exceedsTraction: data?.exceedsTraction ?? false,
        };
      }),
    }));
  });

  // Wheel Torque table data
  const wheelTorqueTableData = createMemo((): WheelTorqueTableRow[] => {
    return torqueRpmData.map((row, rpmIndex) => {
      const firstGearData = outputs().speedRpmData[activeGears()[0]?.index]?.[rpmIndex];
      return {
        rpmIndex,
        rpm: row.rpm,
        torque: row.torque,
        hp: firstGearData?.hp ?? 0,
        isAtPeakHp: row.rpm === outputs().peakHpRpm,
        gearTorques: activeGears().map((gear) => {
          const data = outputs().speedRpmData[gear.index]?.[rpmIndex];
          return {
            gearIndex: gear.index,
            gearName: gear.name,
            wheelTorque: data?.wheelTorque ?? 0,
            exceedsTraction: data?.exceedsTraction ?? false,
          };
        }),
      };
    });
  });

  // Speed vs RPM columns (dynamic based on active gears)
  const speedRpmColumns = createMemo((): ColumnDef<SpeedRpmTableRow>[] => {
    const cols: ColumnDef<SpeedRpmTableRow>[] = [
      {
        accessorKey: 'rpm',
        header: 'RPM',
        cell: (info) => (
          <span class="block px-3 py-1.5 text-center text-slate-400 bg-slate-900/30">
            {info.getValue() as number}
          </span>
        ),
      },
    ];

    // Add dynamic gear columns
    for (const gear of activeGears()) {
      cols.push({
        id: `gear-${gear.index}`,
        header: `${gear.name} (kph)`,
        cell: (info) => {
          const gearData = info.row.original.gearSpeeds.find((g) => g.gearIndex === gear.index);
          return (
            <span
              class="block px-3 py-1.5 text-center"
              classList={{
                'bg-red-500/10 text-red-400': gearData?.exceedsTraction,
                'bg-slate-900/30 text-amber-400': !gearData?.exceedsTraction,
              }}
            >
              {gearData?.speed.toFixed(1) ?? '-'}
            </span>
          );
        },
      });
    }

    return cols;
  });

  // Wheel Torque columns (dynamic based on active gears)
  const wheelTorqueColumns = createMemo((): ColumnDef<WheelTorqueTableRow>[] => {
    const cols: ColumnDef<WheelTorqueTableRow>[] = [
      {
        accessorKey: 'rpm',
        header: 'RPM',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span
              class="block px-3 py-1.5 text-center"
              classList={{
                'bg-emerald-500/10 text-emerald-400 font-medium': row.isAtPeakHp,
                'bg-slate-900/30 text-slate-400': !row.isAtPeakHp,
              }}
            >
              {row.rpm}
              {row.isAtPeakHp && <span class="ml-1 text-[9px]">(peak)</span>}
            </span>
          );
        },
      },
      {
        accessorKey: 'torque',
        header: 'Engine Nm',
        cell: (info) => (
          <span class="block px-3 py-1.5 text-center text-slate-300 bg-slate-900/30">
            {info.getValue() as number}
          </span>
        ),
      },
      {
        accessorKey: 'hp',
        header: 'HP',
        cell: (info) => {
          const row = info.row.original;
          return (
            <span
              class="block px-3 py-1.5 text-center"
              classList={{
                'bg-emerald-500/10 text-emerald-400 font-medium': row.isAtPeakHp,
                'bg-slate-900/30 text-slate-400': !row.isAtPeakHp,
              }}
            >
              {row.hp.toFixed(1)}
            </span>
          );
        },
      },
    ];

    // Add dynamic gear columns for wheel torque
    for (const gear of activeGears()) {
      cols.push({
        id: `gear-torque-${gear.index}`,
        header: `${gear.name} Wheel Nm`,
        cell: (info) => {
          const gearData = info.row.original.gearTorques.find((g) => g.gearIndex === gear.index);
          return (
            <span
              class="block px-3 py-1.5 text-center"
              classList={{
                'bg-red-500/10 text-red-400 font-medium': gearData?.exceedsTraction,
                'bg-slate-900/30 text-amber-400': !gearData?.exceedsTraction,
              }}
            >
              {gearData?.wheelTorque.toFixed(0) ?? '-'}
            </span>
          );
        },
      });
    }

    return cols;
  });

  return (
    <div class="space-y-4">
      {/* Top Row: Metrics + Tire Selector */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Key Metrics */}
        <div class="lg:col-span-2 border border-slate-800/50 bg-slate-950/50">
          <SectionHeader
            title="Calculated Metrics"
            variant="output"
            help={{
              ...HELP_CONTENT.calculatedMetrics,
              position: "bottom",
            }}
          />
          <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Peak HP"
              value={outputs().peakHp.toFixed(1)}
              unit="hp"
              highlight
            />
            <MetricCard
              label="Peak HP @ RPM"
              value={outputs().peakHpRpm.toFixed(0)}
              unit="rpm"
            />
            <MetricCard
              label="Wheel Circumference"
              value={outputs().wheelCircumference.toFixed(2)}
              unit="in"
            />
            <MetricCard
              label="Wheel Radius"
              value={(outputs().wheelRadiusM * 100).toFixed(2)}
              unit="cm"
            />
            <MetricCard
              label="Traction Limit"
              value={outputs().tractionLimitTorque.toFixed(0)}
              unit="Nm"
              highlight
            />
            <MetricCard
              label="Final Drive"
              value={finalDrive.ratio.toFixed(2)}
              unit="x"
            />
            <MetricCard
              label="Top Speed (max gear)"
              value={Math.max(...outputs().maxSpeedPerGear).toFixed(1)}
              unit="kph"
            />
            <MetricCard
              label="Active Gears"
              value={activeGears().length.toString()}
              unit=""
            />
          </div>
        </div>

        {/* Tire Compound Selector */}
        <div class="border border-slate-800/50 bg-slate-950/50">
          <SectionHeader
            title="Tire Compound"
            variant="input"
            help={{
              ...HELP_CONTENT.tireCompound,
              position: "bottom",
            }}
          />
          <div class="p-4">
            <div class="space-y-2">
              <For each={TIRE_OPTIONS}>
                {(option) => (
                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-3 py-2 border transition-colors"
                    classList={{
                      'border-cyan-500/50 bg-cyan-500/10 text-cyan-400':
                        tireCompound.value === option.value,
                      'border-slate-700/50 bg-slate-900/30 text-slate-400 hover:border-slate-600/50 hover:bg-slate-800/30':
                        tireCompound.value !== option.value,
                    }}
                    onClick={() => setTireCompound('value', option.value)}
                  >
                    <span class="text-sm font-medium">{option.label}</span>
                    <span class="text-xs opacity-70">u = {option.friction.toFixed(2)}</span>
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>

      {/* Effective Ratios Row */}
      <div class="border border-slate-800/50 bg-slate-950/50">
        <SectionHeader
          title="Effective Drive Ratios (Gear x Final)"
          variant="output"
          help={{
            ...HELP_CONTENT.effectiveDriveRatios,
            position: "right",
          }}
        />
        <div class="p-4">
          <div class="flex flex-wrap gap-3">
            <For each={activeGears()}>
              {(gear, idx) => (
                <div
                  class="flex flex-col items-center px-4 py-2 border bg-slate-900/30"
                  style={{ "border-color": `${GEAR_COLORS[idx() % GEAR_COLORS.length]}50` }}
                >
                  <span
                    class="text-[10px] uppercase tracking-wider mb-1"
                    style={{ color: GEAR_COLORS[idx() % GEAR_COLORS.length] }}
                  >
                    {gear.name}
                  </span>
                  <span
                    class="text-lg font-bold"
                    style={{ color: GEAR_COLORS[idx() % GEAR_COLORS.length] }}
                  >
                    {outputs().effectiveRatios[gear.index].toFixed(2)}
                  </span>
                  <span class="text-[10px] text-slate-600">
                    max {outputs().maxSpeedPerGear[gear.index].toFixed(0)} kph
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Speed vs RPM Chart */}
        <div class="border border-slate-800/50 bg-slate-950/50">
          <SectionHeader
            title="Speed vs RPM Chart"
            variant="output"
            help={{
              ...HELP_CONTENT.speedRpmChart,
              position: "bottom",
            }}
          />
          <div class="p-4">
            <GearSpeedChart
              speedRpmData={chartSpeedRpmData()}
              gearNames={chartGearNames()}
              height={280}
            />
          </div>
        </div>

        {/* Wheel Torque Chart */}
        <div class="border border-slate-800/50 bg-slate-950/50">
          <SectionHeader
            title="Wheel Torque vs RPM Chart"
            variant="output"
            help={{
              ...HELP_CONTENT.wheelTorqueChart,
              position: "bottom",
            }}
          />
          <div class="p-4">
            <GearTorqueChart
              speedRpmData={chartSpeedRpmData()}
              gearNames={chartGearNames()}
              tractionLimit={outputs().tractionLimitTorque}
              height={280}
            />
          </div>
        </div>
      </div>

      {/* Speed vs RPM Table */}
      <div class="border border-slate-800/50 bg-slate-950/50">
        <SectionHeader
          title="Speed vs RPM per Gear"
          variant="output"
          help={{
            ...HELP_CONTENT.speedVsRpm,
            position: "right",
          }}
        />
        <DataTable
          data={speedRpmTableData()}
          columns={speedRpmColumns()}
          stickyHeader
        />
      </div>

      {/* Wheel Torque Table */}
      <div class="border border-slate-800/50 bg-slate-950/50">
        <SectionHeader
          title="Wheel Torque Output"
          variant="output"
          help={{
            ...HELP_CONTENT.wheelTorqueOutput,
            position: "right",
          }}
        />
        <div class="px-3 py-2 border-b border-slate-800/30 bg-slate-900/30 flex items-center gap-4">
          <span class="text-[10px] uppercase tracking-wider text-slate-500">
            Traction limit: {outputs().tractionLimitTorque.toFixed(0)} Nm
          </span>
          <span class="flex items-center gap-2 text-[10px] text-slate-500">
            <span class="w-3 h-3 bg-red-500/30 border border-red-500/50" />
            Exceeds traction
          </span>
        </div>
        <DataTable
          data={wheelTorqueTableData()}
          columns={wheelTorqueColumns()}
          stickyHeader
          maxHeight="400px"
        />
      </div>

      {/* Traction Analysis */}
      <div class="border border-slate-800/50 bg-slate-950/50">
        <SectionHeader
          title="Traction Analysis"
          variant="output"
          help={{
            ...HELP_CONTENT.tractionAnalysis,
            position: "top",
          }}
        />
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={activeGears()}>
              {(gear) => {
                const gearData = () => outputs().speedRpmData[gear.index] ?? [];
                const tractionExceededPoints = () =>
                  gearData().filter((p) => p.exceedsTraction);
                const tractionOkPoints = () =>
                  gearData().filter((p) => !p.exceedsTraction);
                const percentExceeded = () =>
                  gearData().length > 0
                    ? (tractionExceededPoints().length / gearData().length) * 100
                    : 0;

                return (
                  <div class="border border-slate-700/50 bg-slate-900/30 p-3">
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-sm font-medium text-slate-300">{gear.name}</span>
                      <span
                        class="text-xs px-2 py-0.5"
                        classList={{
                          'bg-red-500/20 text-red-400 border border-red-500/30':
                            percentExceeded() > 50,
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30':
                            percentExceeded() > 0 && percentExceeded() <= 50,
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30':
                            percentExceeded() === 0,
                        }}
                      >
                        {percentExceeded() > 0
                          ? `${percentExceeded().toFixed(0)}% wheelspin`
                          : 'Full traction'}
                      </span>
                    </div>

                    {/* Visual bar */}
                    <div class="h-2 bg-slate-800 rounded">
                      <div
                        class="h-full bg-red-500/70 transition-all"
                        style={{ width: `${percentExceeded()}%` }}
                      />
                    </div>

                    <div class="flex justify-between text-[10px] text-slate-500">
                      <span>
                        Grip zone:{' '}
                        {tractionOkPoints().length > 0
                          ? `${tractionOkPoints()[0]?.rpm} - ${tractionOkPoints()[tractionOkPoints().length - 1]?.rpm} RPM`
                          : 'None'}
                      </span>
                      <span>Max: {outputs().maxSpeedPerGear[gear.index].toFixed(0)} kph</span>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for metric cards
const MetricCard: Component<{
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
}> = (props) => {
  return (
    <div
      class="flex flex-col items-center p-3 border"
      classList={{
        'border-amber-500/30 bg-amber-500/5': props.highlight,
        'border-slate-700/50 bg-slate-900/30': !props.highlight,
      }}
    >
      <span class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        {props.label}
      </span>
      <div class="flex items-baseline gap-1">
        <span
          class="text-xl font-bold"
          classList={{
            'text-amber-400': props.highlight,
            'text-slate-300': !props.highlight,
          }}
        >
          {props.value}
        </span>
        <Show when={props.unit}>
          <span class="text-xs text-slate-500">{props.unit}</span>
        </Show>
      </div>
    </div>
  );
};
