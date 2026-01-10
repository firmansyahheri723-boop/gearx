import { Component, For, createMemo, Show } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from '../ui/section-header';
import { DataTable } from '../ui/data-table';
import {
  vehicleInputs,
  torqueRpmData,
  gearRatios,
  tireCompound,
  setTireCompound,
} from '../../stores/vehicle';
import { calculateGearboxOutputs } from '../../utils/gearbox';
import type { TireCompound, SpeedRpmPoint } from '../../types';

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
  const activeGears = createMemo(() => {
    const gears: { index: number; name: string; ratio: number }[] = [];
    for (let i = 0; i < gearRatios.length - 1; i++) {
      if (gearRatios[i].ratio > 0) {
        gears.push({ index: i, name: gearRatios[i].gear, ratio: gearRatios[i].ratio });
      }
    }
    return gears;
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
        <div class="lg:col-span-2 border border-slate-800/50 bg-slate-950/50 overflow-hidden">
          <SectionHeader title="Calculated Metrics" variant="output" />
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
              value={gearRatios[gearRatios.length - 1].ratio.toFixed(2)}
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
        <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
          <SectionHeader title="Tire Compound" variant="input" />
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
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Effective Drive Ratios (Gear x Final)" variant="output" />
        <div class="p-4">
          <div class="flex flex-wrap gap-3">
            <For each={activeGears()}>
              {(gear) => (
                <div class="flex flex-col items-center px-4 py-2 border border-slate-700/50 bg-slate-900/30">
                  <span class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                    {gear.name}
                  </span>
                  <span class="text-lg font-bold text-amber-400">
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

      {/* Speed vs RPM Table */}
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Speed vs RPM per Gear" variant="output" />
        <DataTable
          data={speedRpmTableData()}
          columns={speedRpmColumns()}
          stickyHeader
        />
      </div>

      {/* Wheel Torque Table */}
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Wheel Torque Output" variant="output" />
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
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Traction Analysis" variant="output" />
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
                    <div class="h-2 bg-slate-800 rounded overflow-hidden mb-2">
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
