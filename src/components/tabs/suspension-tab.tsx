import { Component, For, createMemo, Show } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from '../ui/section-header';
import { DataTable } from '../ui/data-table';
import { HelpLink } from '../ui/help-tooltip';
import { vehicleInputs, setVehicleInputs } from '../../stores/vehicle';
import { calculateSuspensionOutputs } from '../../utils/suspension';
import { SuspensionOutput } from '../suspension-output';

// Help tooltip content for suspension sections
const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  suspensionParameters: {
    description:
      "Core suspension settings that define how your car handles bumps and cornering. Ride frequency controls how quickly the suspension oscillates, damping ratio affects how oscillations decay, and roll gradient determines body roll during turns. Higher values generally mean stiffer, more responsive handling.",
    articles: [
      { label: "Wikipedia: Suspension", url: "https://en.wikipedia.org/wiki/Suspension_(vehicle)" },
    ],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  springsStiffness: {
    description:
      "Calculated spring rates based on ride frequency and sprung mass. Stiffer springs reduce body roll and improve responsiveness but compromise ride comfort. Front/rear balance affects handling characteristics - stiffer front promotes understeer, stiffer rear promotes oversteer.",
    articles: [
      { label: "Wikipedia: Spring Rate", url: "https://en.wikipedia.org/wiki/Spring_(device)#Spring_rate" },
    ],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  antiRollBars: {
    description:
      "Anti-roll bars (sway bars) connect left and right wheels to resist body roll during cornering. FARB is Front Anti-Roll Bar, RARB is Rear Anti-Roll Bar. The front/rear balance determines handling balance - more front ARB causes understeer, more rear ARB causes oversteer.",
    articles: [
      { label: "Wikipedia: Anti-roll Bar", url: "https://en.wikipedia.org/wiki/Anti-roll_bar" },
    ],
    videos: [
      { label: "Anti-Roll Bars Guide", url: "https://youtu.be/It-V_Yt_PDc?si=njpT1_KasdUdZGxY" },
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  damperSettings: {
    description:
      "Dampers (shock absorbers) control the rate of spring compression and extension. Bump controls compression, rebound controls extension. Fast settings handle quick impacts, slow settings handle body movements. Proper damping prevents oscillation and maintains tire contact.",
    articles: [
      { label: "Wikipedia: Shock Absorber", url: "https://en.wikipedia.org/wiki/Shock_absorber" },
    ],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  accelerationWeightTransfer: {
    description:
      "Under acceleration, weight transfers from front to rear, affecting traction. Longitudinal G is forward/braking acceleration, lateral G is cornering acceleration. Understanding weight transfer helps optimize suspension settings for your driving style and track characteristics.",
    articles: [
      { label: "Wikipedia: Weight Transfer", url: "https://en.wikipedia.org/wiki/Weight_transfer" },
    ],
    videos: [
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  formulaReference: {
    description:
      "Reference formulas used to calculate suspension parameters. These physics-based equations ensure your suspension is properly matched to your vehicle's weight and desired handling characteristics. Spring stiffness, critical damping, and damping ratios all follow established engineering principles.",
    articles: [
      { label: "Wikipedia: Suspension Geometry", url: "https://en.wikipedia.org/wiki/Suspension_(vehicle)#Geometry" },
    ],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
    ],
  },
};

// Input slider configuration
interface SliderConfig {
  key: keyof typeof vehicleInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

const SUSPENSION_SLIDERS: SliderConfig[] = [
  {
    key: 'desiredRideFrequency',
    label: 'Ride Frequency',
    min: 2.0,
    max: 6.0,
    step: 0.1,
    unit: 'Hz',
    description: 'Racecars: 3.0 - 5.0+ Hz',
  },
  {
    key: 'dampingRatio',
    label: 'Damping Ratio',
    min: 0.5,
    max: 1.5,
    step: 0.05,
    unit: 'ζ',
    description: 'Racecars: 0.65+',
  },
  {
    key: 'desiredRollGradient',
    label: 'Roll Gradient',
    min: 0.02,
    max: 0.7,
    step: 0.01,
    unit: 'deg/g',
    description: 'Lower = stiffer roll',
  },
  {
    key: 'magicNumber',
    label: 'Front ARB Bias',
    min: 40,
    max: 70,
    step: 0.5,
    unit: '%',
    description: 'Front roll stiffness distribution',
  },
  {
    key: 'wheelWeight',
    label: 'Wheel Weight',
    min: 8,
    max: 20,
    step: 0.5,
    unit: 'kg',
    description: 'Per wheel (unsprung mass)',
  },
];

// Type for damper table row
interface DamperTableRow {
  label: string;
  description: string;
  front: number;
  rear: number;
  highlight?: boolean;
}

export const SuspensionTab: Component = () => {
  // Convert cogHeight from inches to meters for calculation
  const cogHeightM = () => vehicleInputs.cogHeight * 0.0254;

  const outputs = createMemo(() =>
    calculateSuspensionOutputs({
      weight: vehicleInputs.weight,
      frontWeightDistribution: vehicleInputs.frontWeightDistribution,
      wheelWeight: vehicleInputs.wheelWeight,
      rideFrequency: vehicleInputs.desiredRideFrequency,
      dampingRatio: vehicleInputs.dampingRatio,
      acceleration0to100: vehicleInputs.acceleration0to100,
      maxSpeed118mRadius: vehicleInputs.maxSpeed118mRadius,
      cogHeight: cogHeightM(),
      wheelbase: vehicleInputs.wheelbase,
      frontTrackWidth: vehicleInputs.frontTrackWidth,
      rearTrackWidth: vehicleInputs.rearTrackWidth,
      desiredRollGradient: vehicleInputs.desiredRollGradient,
      magicNumber: vehicleInputs.magicNumber,
      tireRate: vehicleInputs.tireRate,
    })
  );

  // Damper table data
  const damperData = createMemo((): DamperTableRow[] => [
    { label: 'Bump', description: 'C × 2/3', front: outputs().dampers.bumpFront, rear: outputs().dampers.bumpRear },
    { label: 'Fast Bump', description: 'C × 1/3', front: outputs().dampers.fastBumpFront, rear: outputs().dampers.fastBumpRear },
    { label: 'Rebound', description: 'C × 3/2', front: outputs().dampers.reboundFront, rear: outputs().dampers.reboundRear, highlight: true },
    { label: 'Fast Rebound', description: 'C × 3/4', front: outputs().dampers.fastReboundFront, rear: outputs().dampers.fastReboundRear },
  ]);

  // Damper table columns
  const damperColumns: ColumnDef<DamperTableRow>[] = [
    {
      accessorKey: 'label',
      header: 'Damper Type',
      cell: (info) => {
        const row = info.row.original;
        return (
          <div
            class="px-4 py-2"
            classList={{
              'bg-amber-500/5': row.highlight,
              'bg-neutral-900/30': !row.highlight,
            }}
          >
            <div class="text-neutral-300">{row.label}</div>
            <div class="text-[10px] text-neutral-600">{row.description}</div>
          </div>
        );
      },
      meta: { align: 'left' as const },
    },
    {
      accessorKey: 'front',
      header: 'Front',
      cell: (info) => {
        const row = info.row.original;
        return (
          <span
            class="block px-4 py-2 text-center"
            classList={{
              'bg-amber-500/5 text-amber-400 font-medium': row.highlight,
              'bg-neutral-900/30 text-neutral-300': !row.highlight,
            }}
          >
            {info.getValue<number>().toFixed(0)}
          </span>
        );
      },
    },
    {
      accessorKey: 'rear',
      header: 'Rear',
      cell: (info) => {
        const row = info.row.original;
        return (
          <span
            class="block px-4 py-2 text-center"
            classList={{
              'bg-amber-500/5 text-amber-400 font-medium': row.highlight,
              'bg-neutral-900/30 text-neutral-300': !row.highlight,
            }}
          >
            {info.getValue<number>().toFixed(0)}
          </span>
        );
      },
    },
  ];

  return (
    <div class="space-y-4">
      {/* Suspension Output Card */}
      <SuspensionOutput />

      {/* Top Row: Key Metrics + Input Sliders */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Suspension Parameters Input */}
        <div class="border border-neutral-800/50 bg-neutral-950/50">
          <SectionHeader
            title="Suspension Parameters"
            variant="input"
            help={{
              ...HELP_CONTENT.suspensionParameters,
              position: "bottom",
            }}
          />
          <div class="p-4 space-y-4">
            <For each={SUSPENSION_SLIDERS}>
              {(slider) => (
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-400">{slider.label}</span>
                    <div class="flex items-baseline gap-1">
                      <span class="text-sm font-bold text-neutral-400">
                        {(vehicleInputs[slider.key] as number).toFixed(
                          slider.step < 1 ? (slider.step < 0.1 ? 2 : 1) : 0
                        )}
                      </span>
                      <span class="text-[10px] text-neutral-500">{slider.unit}</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={vehicleInputs[slider.key] as number}
                    onInput={(e) =>
                      setVehicleInputs(slider.key, parseFloat(e.currentTarget.value))
                    }
                    class="w-full h-1.5 bg-neutral-700 rounded appearance-none cursor-pointer accent-neutral-500"
                    aria-label={slider.label}
                  />
                  <div class="text-[10px] text-neutral-600">{slider.description}</div>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Springs Stiffness */}
        <div class="border border-neutral-800/50 bg-neutral-950/50">
          <SectionHeader
            title="Springs Stiffness"
            variant="output"
            help={{
              ...HELP_CONTENT.springsStiffness,
              position: "bottom",
            }}
          />
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <MetricCard
                label="Front Springs"
                value={(outputs().springs.frontStiffness / 1000).toFixed(2)}
                unit="kN/m"
                highlight
              />
              <MetricCard
                label="Rear Springs"
                value={(outputs().springs.rearStiffness / 1000).toFixed(2)}
                unit="kN/m"
                highlight
              />
            </div>
            <div class="border-t border-neutral-800/50 pt-4">
              <div class="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
                Sprung Masses
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-lg font-bold text-neutral-300">
                    {outputs().springs.frontSprungMass.toFixed(1)}
                  </div>
                  <div class="text-[10px] text-neutral-500">Front kg</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-neutral-300">
                    {outputs().springs.rearSprungMass.toFixed(1)}
                  </div>
                  <div class="text-[10px] text-neutral-500">Rear kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Roll Bars */}
        <div class="border border-neutral-800/50 bg-neutral-950/50">
          <SectionHeader
            title="Anti-Roll Bars"
            variant="output"
            help={{
              ...HELP_CONTENT.antiRollBars,
              position: "bottom",
            }}
          />
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <MetricCard
                label="FARB"
                value={outputs().antiRollBars.farb.toFixed(2)}
                unit="kNm"
                highlight
              />
              <MetricCard
                label="RARB"
                value={outputs().antiRollBars.rarb.toFixed(2)}
                unit="kNm"
                highlight
              />
            </div>
            <div class="border-t border-neutral-800/50 pt-4 space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-neutral-500">Roll Center to CoG</span>
                <span class="text-neutral-300">
                  {(outputs().antiRollBars.rollCenterToCoG * 100).toFixed(1)} cm
                </span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-neutral-500">Total Roll Rate</span>
                <span class="text-neutral-300">
                  {outputs().antiRollBars.totalRollRate.toFixed(0)} Nm/deg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dampers Section */}
      <div class="border border-neutral-800/50 bg-neutral-950/50">
        <SectionHeader
          title="Damper Settings"
          variant="output"
          help={{
            ...HELP_CONTENT.damperSettings,
            position: "bottom",
          }}
        />
        <DataTable
          data={damperData()}
          columns={damperColumns}
        />
        <div class="px-4 py-2 border-t border-neutral-800/30 bg-neutral-900/30 flex items-center gap-6">
          <span class="text-[10px] text-neutral-500">
            Critical Damping Front:{' '}
            <span class="text-neutral-400">
              {outputs().dampers.critDampingFront.toFixed(0)} N·s/m
            </span>
          </span>
          <span class="text-[10px] text-neutral-500">
            Critical Damping Rear:{' '}
            <span class="text-neutral-400">
              {outputs().dampers.critDampingRear.toFixed(0)} N·s/m
            </span>
          </span>
        </div>
      </div>

      {/* Acceleration Metrics */}
      <div class="border border-neutral-800/50 bg-neutral-950/50">
        <SectionHeader
          title="Acceleration & Weight Transfer"
          variant="output"
          help={{
            ...HELP_CONTENT.accelerationWeightTransfer,
            position: "bottom",
          }}
        />
        <div class="p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCard
              label="Long. Accel"
              value={outputs().acceleration.longitudinalAccelG.toFixed(2)}
              unit="g"
              highlight
            />
            <MetricCard
              label="Lat. Accel"
              value={outputs().acceleration.lateralAccelG.toFixed(2)}
              unit="g"
              highlight
            />
            <MetricCard
              label="Weight Transfer"
              value={outputs().acceleration.weightTransfer.toFixed(1)}
              unit="kg"
            />
            <MetricCard
              label="Front on Accel"
              value={outputs().acceleration.frontWeightOnAccel.toFixed(1)}
              unit="kg"
            />
            <MetricCard
              label="Rear on Accel"
              value={outputs().acceleration.rearWeightOnAccel.toFixed(1)}
              unit="kg"
            />
            <MetricCard
              label="Front Bias"
              value={outputs().acceleration.frontBiasOnAccel.toFixed(1)}
              unit="%"
            />
          </div>

          {/* Visual weight distribution bar */}
          <div class="mt-4 pt-4 border-t border-neutral-800/50">
            <div class="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
              Weight Distribution Under Acceleration
            </div>
            <div class="relative h-6 bg-neutral-800 rounded">
              <div
                class="absolute left-0 top-0 h-full bg-neutral-500/30 border-r border-neutral-400 transition-all"
                style={{ width: `${outputs().acceleration.frontBiasOnAccel}%` }}
              />
              <div class="absolute inset-0 flex items-center justify-between px-2 text-[10px]">
                <span class="text-neutral-400 font-medium">
                  Front: {outputs().acceleration.frontBiasOnAccel.toFixed(1)}%
                </span>
                <span class="text-amber-400 font-medium">
                  Rear: {outputs().acceleration.rearBiasOnAccel.toFixed(1)}%
                </span>
              </div>
            </div>
            <div class="mt-1 flex justify-between text-[10px] text-neutral-600">
              <span>Static: {vehicleInputs.frontWeightDistribution}% front</span>
              <span>
                Change: {(vehicleInputs.frontWeightDistribution - outputs().acceleration.frontBiasOnAccel).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Reference */}
      <div class="border border-neutral-800/50 bg-neutral-950/50">
        <SectionHeader
          title="Formula Reference"
          variant="input"
          help={{
            ...HELP_CONTENT.formulaReference,
            position: "top",
          }}
        />
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            <FormulaCard
              title="Spring Stiffness"
              formula="K = 4 × π² × f² × m"
              variables={['K = stiffness (N/m)', 'f = ride frequency (Hz)', 'm = sprung mass (kg)']}
            />
            <FormulaCard
              title="Critical Damping"
              formula="Ccrit = 2 × √(K × m)"
              variables={['Ccrit = critical damping (N·s/m)', 'K = stiffness', 'm = sprung mass']}
            />
            <FormulaCard
              title="Damping Ratios"
              formula="C = Ccrit × ζ"
              variables={[
                'Bump = C × 2/3',
                'Fast Bump = C × 1/3',
                'Rebound = C × 3/2',
                'Fast Rebound = C × 3/4',
              ]}
            />
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
        'border-neutral-700/50 bg-neutral-900/30': !props.highlight,
      }}
    >
      <span class="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
        {props.label}
      </span>
      <div class="flex items-baseline gap-1">
        <span
          class="text-xl font-bold"
          classList={{
            'text-amber-400': props.highlight,
            'text-neutral-300': !props.highlight,
          }}
        >
          {props.value}
        </span>
        <Show when={props.unit}>
          <span class="text-xs text-neutral-500">{props.unit}</span>
        </Show>
      </div>
    </div>
  );
};

// Helper component for formula reference cards
const FormulaCard: Component<{
  title: string;
  formula: string;
  variables: string[];
}> = (props) => {
  return (
    <div class="border border-neutral-700/50 bg-neutral-900/30 p-3">
      <div class="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
        {props.title}
      </div>
      <div class="text-neutral-400 mb-2">{props.formula}</div>
      <div class="space-y-0.5">
        <For each={props.variables}>
          {(variable) => <div class="text-neutral-500 text-[10px]">{variable}</div>}
        </For>
      </div>
    </div>
  );
};
