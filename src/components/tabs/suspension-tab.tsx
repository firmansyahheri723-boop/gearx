import { Component, For, createMemo, Show } from 'solid-js';
import { SectionHeader } from '../ui/section-header';
import { vehicleInputs, setVehicleInputs } from '../../stores/vehicle';
import { calculateSuspensionOutputs } from '../../utils/suspension';

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

  return (
    <div class="space-y-4">
      {/* Top Row: Key Metrics + Input Sliders */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Suspension Parameters Input */}
        <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
          <SectionHeader title="Suspension Parameters" variant="input" />
          <div class="p-4 space-y-4">
            <For each={SUSPENSION_SLIDERS}>
              {(slider) => (
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">{slider.label}</span>
                    <div class="flex items-baseline gap-1">
                      <span class="text-sm font-bold text-cyan-400">
                        {(vehicleInputs[slider.key] as number).toFixed(
                          slider.step < 1 ? (slider.step < 0.1 ? 2 : 1) : 0
                        )}
                      </span>
                      <span class="text-[10px] text-slate-500">{slider.unit}</span>
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
                    class="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-500"
                    aria-label={slider.label}
                  />
                  <div class="text-[10px] text-slate-600">{slider.description}</div>
                </div>
              )}
            </For>
          </div>
        </div>

        {/* Springs Stiffness */}
        <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
          <SectionHeader title="Springs Stiffness" variant="output" />
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
            <div class="border-t border-slate-800/50 pt-4">
              <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                Sprung Masses
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-lg font-bold text-slate-300">
                    {outputs().springs.frontSprungMass.toFixed(1)}
                  </div>
                  <div class="text-[10px] text-slate-500">Front kg</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-slate-300">
                    {outputs().springs.rearSprungMass.toFixed(1)}
                  </div>
                  <div class="text-[10px] text-slate-500">Rear kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anti-Roll Bars */}
        <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
          <SectionHeader title="Anti-Roll Bars" variant="output" />
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
            <div class="border-t border-slate-800/50 pt-4 space-y-2">
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">Roll Center to CoG</span>
                <span class="text-slate-300">
                  {(outputs().antiRollBars.rollCenterToCoG * 100).toFixed(1)} cm
                </span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-slate-500">Total Roll Rate</span>
                <span class="text-slate-300">
                  {outputs().antiRollBars.totalRollRate.toFixed(0)} Nm/deg
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dampers Section */}
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Damper Settings" variant="output" />
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th class="border-r border-b border-slate-800/50 bg-slate-900 px-4 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-left min-w-[140px]">
                  Damper Type
                </th>
                <th class="border-r border-b border-slate-800/50 bg-slate-900 px-4 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center min-w-[120px]">
                  Front
                </th>
                <th class="border-b border-slate-800/50 bg-slate-900 px-4 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center min-w-[120px]">
                  Rear
                </th>
              </tr>
            </thead>
            <tbody>
              <DamperRow
                label="Bump"
                description="C × 2/3"
                front={outputs().dampers.bumpFront}
                rear={outputs().dampers.bumpRear}
              />
              <DamperRow
                label="Fast Bump"
                description="C × 1/3"
                front={outputs().dampers.fastBumpFront}
                rear={outputs().dampers.fastBumpRear}
              />
              <DamperRow
                label="Rebound"
                description="C × 3/2"
                front={outputs().dampers.reboundFront}
                rear={outputs().dampers.reboundRear}
                highlight
              />
              <DamperRow
                label="Fast Rebound"
                description="C × 3/4"
                front={outputs().dampers.fastReboundFront}
                rear={outputs().dampers.fastReboundRear}
              />
            </tbody>
          </table>
        </div>
        <div class="px-4 py-2 border-t border-slate-800/30 bg-slate-900/30 flex items-center gap-6">
          <span class="text-[10px] text-slate-500">
            Critical Damping Front:{' '}
            <span class="text-slate-400">
              {outputs().dampers.critDampingFront.toFixed(0)} N·s/m
            </span>
          </span>
          <span class="text-[10px] text-slate-500">
            Critical Damping Rear:{' '}
            <span class="text-slate-400">
              {outputs().dampers.critDampingRear.toFixed(0)} N·s/m
            </span>
          </span>
        </div>
      </div>

      {/* Acceleration Metrics */}
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Acceleration & Weight Transfer" variant="output" />
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
          <div class="mt-4 pt-4 border-t border-slate-800/50">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
              Weight Distribution Under Acceleration
            </div>
            <div class="relative h-6 bg-slate-800 rounded overflow-hidden">
              <div
                class="absolute left-0 top-0 h-full bg-cyan-500/30 border-r border-cyan-400 transition-all"
                style={{ width: `${outputs().acceleration.frontBiasOnAccel}%` }}
              />
              <div class="absolute inset-0 flex items-center justify-between px-2 text-[10px]">
                <span class="text-cyan-400 font-medium">
                  Front: {outputs().acceleration.frontBiasOnAccel.toFixed(1)}%
                </span>
                <span class="text-amber-400 font-medium">
                  Rear: {outputs().acceleration.rearBiasOnAccel.toFixed(1)}%
                </span>
              </div>
            </div>
            <div class="mt-1 flex justify-between text-[10px] text-slate-600">
              <span>Static: {vehicleInputs.frontWeightDistribution}% front</span>
              <span>
                Change: {(vehicleInputs.frontWeightDistribution - outputs().acceleration.frontBiasOnAccel).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Reference */}
      <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
        <SectionHeader title="Formula Reference" variant="input" />
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

// Helper component for damper table rows
const DamperRow: Component<{
  label: string;
  description: string;
  front: number;
  rear: number;
  highlight?: boolean;
}> = (props) => {
  return (
    <tr>
      <td
        class="border-r border-b border-slate-800/50 px-4 py-2"
        classList={{
          'bg-amber-500/5': props.highlight,
          'bg-slate-900/30': !props.highlight,
        }}
      >
        <div class="text-slate-300">{props.label}</div>
        <div class="text-[10px] text-slate-600">{props.description}</div>
      </td>
      <td
        class="border-r border-b border-slate-800/50 px-4 py-2 text-center"
        classList={{
          'bg-amber-500/5 text-amber-400 font-medium': props.highlight,
          'bg-slate-900/30 text-slate-300': !props.highlight,
        }}
      >
        {props.front.toFixed(0)}
      </td>
      <td
        class="border-b border-slate-800/50 px-4 py-2 text-center"
        classList={{
          'bg-amber-500/5 text-amber-400 font-medium': props.highlight,
          'bg-slate-900/30 text-slate-300': !props.highlight,
        }}
      >
        {props.rear.toFixed(0)}
      </td>
    </tr>
  );
};

// Helper component for formula reference cards
const FormulaCard: Component<{
  title: string;
  formula: string;
  variables: string[];
}> = (props) => {
  return (
    <div class="border border-slate-700/50 bg-slate-900/30 p-3">
      <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
        {props.title}
      </div>
      <div class="text-cyan-400 mb-2">{props.formula}</div>
      <div class="space-y-0.5">
        <For each={props.variables}>
          {(variable) => <div class="text-slate-500 text-[10px]">{variable}</div>}
        </For>
      </div>
    </div>
  );
};
