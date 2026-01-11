import { Component, For, createMemo, Show } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from '../ui/section-header';
import { DataTable } from '../ui/data-table';
import { HelpLink, HelpTooltip } from '../ui/help-tooltip';
import { Formula } from '../ui/formula';
import { vehicleInputs, setVehicleInputs } from '../../stores/vehicle';
import { calculateSuspensionOutputs } from '../../utils/suspension';
import { SuspensionOutput } from '../suspension-output';

// Help content type for reusable definitions
interface HelpContent {
  description: string;
  formula?: string;
  variables?: string[];
  articles?: HelpLink[];
  videos?: HelpLink[];
}

// Input slider configuration with inline help
interface SliderConfig {
  key: keyof typeof vehicleInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  help: string;
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
    help: 'Natural frequency of suspension oscillation. Higher values = stiffer suspension. Race cars typically use 3.0-5.0+ Hz.',
  },
  {
    key: 'dampingRatio',
    label: 'Damping Ratio',
    min: 0.5,
    max: 1.5,
    step: 0.05,
    unit: 'ζ',
    description: 'Racecars: 0.65+',
    help: 'Ratio of actual damping to critical damping. 1.0 = critically damped (no oscillation). Race cars typically use 0.65+.',
  },
  {
    key: 'desiredRollGradient',
    label: 'Roll Gradient',
    min: 0.02,
    max: 0.7,
    step: 0.01,
    unit: 'deg/g',
    description: 'Lower = stiffer roll',
    help: 'Degrees of body roll per g of lateral acceleration. Lower values = stiffer roll resistance. Race cars typically use 0.02-0.3 deg/g.',
  },
  {
    key: 'magicNumber',
    label: 'Front ARB Bias',
    min: 40,
    max: 70,
    step: 0.5,
    unit: '%',
    description: 'Front roll stiffness distribution',
    help: 'Front ARB bias percentage. Controls understeer/oversteer balance. Higher values = more understeer tendency.',
  },
  {
    key: 'wheelWeight',
    label: 'Wheel Weight',
    min: 8,
    max: 20,
    step: 0.5,
    unit: 'kg',
    description: 'Per wheel (unsprung mass)',
    help: 'Unsprung mass per wheel (wheel, tire, brake, hub). Subtracted from axle weight to get sprung mass.',
  },
  {
    key: 'rollCenterHeight',
    label: 'Roll Center Height',
    min: 0.05,
    max: 0.4,
    step: 0.01,
    unit: 'm',
    description: 'Height from ground to roll center',
    help: 'Height of the roll center above ground. The distance from roll center to CoG (H) determines roll moment arm.',
  },
];

// Shared help content for items that are reused (like ARB stiffness for both FARB and RARB)
const ARB_STIFFNESS_HELP: HelpContent = {
  description: 'Individual ARB stiffness is derived from total roll rate and the front bias percentage (magic number).',
  formula: 'ARB = \\frac{K_{\\phi F/R} \\cdot \\pi}{180 \\cdot t^2}',
  variables: [
    'ARB = anti-roll bar stiffness (kNm)',
    'K_φF/R = front/rear roll rate (Nm/deg)',
    't = average track width (m)',
  ],
};

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
      rollCenterHeight: vehicleInputs.rollCenterHeight,
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
      <SuspensionOutput outputs={outputs()} />

      {/* Top Row: Key Metrics + Input Sliders */}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Suspension Parameters Input */}
        <div class="border border-neutral-800/50 bg-neutral-950/50">
          <SectionHeader
            title="Suspension Parameters"
            variant="input"
            help={{
              description: 'Core suspension settings that define how your car handles bumps and cornering. Ride frequency controls how quickly the suspension oscillates, damping ratio affects how oscillations decay, and roll gradient determines body roll during turns.',
              position: 'bottom',
              articles: [
                { label: 'Wikipedia: Suspension', url: 'https://en.wikipedia.org/wiki/Suspension_(vehicle)' },
              ],
              videos: [
                { label: 'Springs & Dampers Guide', url: 'https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc' },
                { label: 'Suspension Talk', url: 'https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq' },
              ],
            }}
          />
          <div class="p-4 space-y-4">
            <For each={SUSPENSION_SLIDERS}>
              {(slider) => (
                <div class="space-y-1">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs text-neutral-400">{slider.label}</span>
                      <HelpTooltip description={slider.help} position="right" />
                    </div>
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
              description: 'Spring stiffness calculated from ride frequency and sprung mass per corner. Higher values mean stiffer springs with less body roll but harsher ride.',
              formula: 'K = 4 \\pi^2 f^2 m',
              variables: [
                'K = spring stiffness (N/m)',
                'f = ride frequency (Hz)',
                'm = sprung mass per corner (kg)',
              ],
              position: 'bottom',
              articles: [
                { label: 'Wikipedia: Spring Rate', url: 'https://en.wikipedia.org/wiki/Spring_(device)#Spring_rate' },
              ],
              videos: [
                { label: 'Springs & Dampers Guide', url: 'https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc' },
              ],
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
              <div class="flex items-center gap-1.5 mb-2">
                <span class="text-[10px] uppercase tracking-wider text-neutral-500">
                  Sprung Masses (per corner)
                </span>
                <HelpTooltip
                  description="Sprung mass is the portion of the vehicle supported by the suspension. Calculated per corner by taking half the axle weight minus the wheel weight (unsprung mass)."
                  formula="m_{sprung} = \frac{W_{axle}}{2} - W_{wheel}"
                  variables={[
                    'm_sprung = sprung mass per corner (kg)',
                    'W_axle = axle weight (kg)',
                    'W_wheel = wheel weight (kg)',
                  ]}
                  position="bottom"
                />
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
              description: 'Anti-roll bars resist body roll during cornering. FARB (Front) and RARB (Rear) stiffness determines handling balance - more front ARB causes understeer, more rear ARB causes oversteer.',
              formula: 'K_{\\phi DES} = \\frac{W \\cdot H}{\\phi / A_y}',
              variables: [
                'K_φDES = desired roll rate (Nm/deg)',
                'W = vehicle weight (kg)',
                'H = roll center to CoG height (m)',
                'φ/Ay = desired roll gradient (deg/g)',
              ],
              position: 'bottom',
              articles: [
                { label: 'Wikipedia: Anti-roll Bar', url: 'https://en.wikipedia.org/wiki/Anti-roll_bar' },
              ],
              videos: [
                { label: 'Anti-Roll Bars Guide', url: 'https://youtu.be/It-V_Yt_PDc?si=njpT1_KasdUdZGxY' },
              ],
            }}
          />
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <MetricCardWithHelp
                label="FARB"
                value={outputs().antiRollBars.farb.toFixed(2)}
                unit="kNm"
                highlight
                help={ARB_STIFFNESS_HELP}
              />
              <MetricCardWithHelp
                label="RARB"
                value={outputs().antiRollBars.rarb.toFixed(2)}
                unit="kNm"
                highlight
                help={ARB_STIFFNESS_HELP}
              />
            </div>
            <div class="border-t border-neutral-800/50 pt-4 space-y-2">
              <div class="flex justify-between items-center text-xs">
                <span class="text-neutral-500">Roll Center to CoG</span>
                <span class="text-neutral-300">
                  {(outputs().antiRollBars.rollCenterToCoG * 100).toFixed(1)} cm
                </span>
              </div>
              <div class="flex justify-between items-center text-xs">
                <div class="flex items-center gap-1">
                  <span class="text-neutral-500">Total Roll Rate</span>
                  <HelpTooltip
                    description="Total roll rate combines spring, tire, and ARB contributions. This complex formula accounts for tire compliance and wheel rates."
                    formula="K_{\phi A} = \frac{\frac{\pi}{180} \cdot K_{\phi DES} \cdot K_t \cdot \frac{t^2}{2}}{K_t \cdot \frac{t^2}{2} \cdot \frac{\pi}{180} - K_{\phi DES}} - \frac{\pi \cdot K_w \cdot \frac{t^2}{2}}{180}"
                    variables={[
                      'K_φA = total roll rate (Nm/deg)',
                      'K_t = tire rate (N/m)',
                      'K_w = average wheel rate (N/m)',
                      't = average track width (m)',
                    ]}
                    position="left"
                  />
                </div>
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
            description: 'Dampers control spring oscillation. Critical damping prevents oscillation; damping ratio adjusts this. Different multipliers set bump (compression) and rebound (extension) rates.',
            formula: 'C_{crit} = 2\\sqrt{K \\cdot m}',
            variables: [
              'C_crit = critical damping (N·s/m)',
              'K = spring stiffness (N/m)',
              'm = sprung mass (kg)',
            ],
            position: 'bottom',
            articles: [
              { label: 'Wikipedia: Shock Absorber', url: 'https://en.wikipedia.org/wiki/Shock_absorber' },
            ],
            videos: [
              { label: 'Springs & Dampers Guide', url: 'https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc' },
            ],
          }}
        />
        <DataTable
          data={damperData()}
          columns={damperColumns}
        />
        <div class="px-4 py-2 border-t border-neutral-800/30 bg-neutral-900/30 flex items-center gap-6">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-neutral-500">
              Critical Damping Front:{' '}
              <span class="text-neutral-400">
                {outputs().dampers.critDampingFront.toFixed(0)} N·s/m
              </span>
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-neutral-500">
              Critical Damping Rear:{' '}
              <span class="text-neutral-400">
                {outputs().dampers.critDampingRear.toFixed(0)} N·s/m
              </span>
            </span>
          </div>
          <HelpTooltip
            description="Actual damping force is critical damping multiplied by damping ratio. Different settings use fractions of this base value."
            formula="C = C_{crit} \cdot \zeta"
            variables={[
              'C = damping force (N·s/m)',
              'C_crit = critical damping (N·s/m)',
              'ζ = damping ratio',
              'Bump = C × 2/3',
              'Fast Bump = C × 1/3',
              'Rebound = C × 3/2',
              'Fast Rebound = C × 3/4',
            ]}
            position="top"
          />
        </div>
      </div>

      {/* Acceleration Metrics */}
      <div class="border border-neutral-800/50 bg-neutral-950/50">
        <SectionHeader
          title="Acceleration & Weight Transfer"
          variant="output"
          help={{
            description: 'Weight transfers from front to rear under acceleration, affecting traction distribution.',
            formula: '\\Delta W = \\frac{h}{L} \\cdot W \\cdot a',
            variables: [
              'ΔW = weight transfer (kg)',
              'h = CoG height (m)',
              'L = wheelbase (m)',
              'W = total weight (kg)',
              'a = longitudinal acceleration (g)',
            ],
            position: 'bottom',
          }}
        />
        <div class="p-4">
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricCardWithHelp
              label="Long. Accel"
              value={outputs().acceleration.longitudinalAccelG.toFixed(2)}
              unit="g"
              highlight
              help={{
                description: 'Longitudinal acceleration calculated from 0-100 kph time. This determines how much weight transfers under acceleration.',
                formula: 'a = \\frac{v_f - v_s}{\\Delta t \\cdot g} = \\frac{27.78}{t_{0-100} \\cdot 9.81}',
                variables: [
                  'a = acceleration (g)',
                  'v_f = final velocity (27.78 m/s = 100 kph)',
                  'v_s = starting velocity (0 m/s)',
                  't = 0-100 kph time (s)',
                ],
              }}
            />
            <MetricCardWithHelp
              label="Lat. Accel"
              value={outputs().acceleration.lateralAccelG.toFixed(2)}
              unit="g"
              highlight
              help={{
                description: 'Lateral acceleration at a given corner speed and radius. Uses 118m radius as a standard reference corner.',
                formula: 'A_a = \\frac{V^2}{R \\cdot g}',
                variables: [
                  'A_a = lateral acceleration (g)',
                  'V = velocity (m/s)',
                  'R = corner radius (118 m)',
                  'g = gravity (9.81 m/s²)',
                ],
              }}
            />
            <MetricCardWithHelp
              label="Weight Transfer"
              value={outputs().acceleration.weightTransfer.toFixed(1)}
              unit="kg"
              help={{
                description: 'Weight transfers from front to rear under acceleration, affecting traction distribution.',
                formula: '\\Delta W = \\frac{h}{L} \\cdot W \\cdot a',
                variables: [
                  'ΔW = weight transfer (kg)',
                  'h = CoG height (m)',
                  'L = wheelbase (m)',
                  'W = total weight (kg)',
                  'a = longitudinal acceleration (g)',
                ],
              }}
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
        <SectionHeader title="Formula Reference" variant="input" />
        <div class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormulaCard
              title="Spring Stiffness"
              formula="K = 4 \pi^2 f^2 m"
              variables={['K = stiffness (N/m)', 'f = ride frequency (Hz)', 'm = sprung mass (kg)']}
            />
            <FormulaCard
              title="Critical Damping"
              formula="C_{crit} = 2\sqrt{K \cdot m}"
              variables={['C_crit = critical damping (N·s/m)', 'K = stiffness', 'm = sprung mass']}
            />
            <FormulaCard
              title="Damping Ratios"
              formula="C = C_{crit} \times \zeta"
              variables={[
                'Bump = C × 2/3',
                'Fast Bump = C × 1/3',
                'Rebound = C × 3/2',
                'Fast Rebound = C × 3/4',
              ]}
            />
            <FormulaCard
              title="Desired Roll Rate"
              formula="K_{\phi DES} = \frac{W \cdot H}{\phi / A_y}"
              variables={['W = weight (kg)', 'H = roll center to CoG (m)', 'φ/Ay = roll gradient (deg/g)']}
            />
            <FormulaCard
              title="Longitudinal Accel"
              formula="a = \frac{27.78}{t_{0-100} \times 9.81}"
              variables={['a = acceleration (g)', 't = 0-100 kph time (s)', '27.78 = 100 kph in m/s']}
            />
            <FormulaCard
              title="Lateral Accel"
              formula="A_a = \frac{V^2}{R \times g}"
              variables={['A_a = lateral accel (g)', 'V = velocity (m/s)', 'R = radius (m)']}
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

// Metric card with help tooltip
const MetricCardWithHelp: Component<{
  label: string;
  value: string;
  unit: string;
  highlight?: boolean;
  help: HelpContent;
}> = (props) => {
  return (
    <div
      class="flex flex-col items-center p-3 border relative"
      classList={{
        'border-amber-500/30 bg-amber-500/5': props.highlight,
        'border-neutral-700/50 bg-neutral-900/30': !props.highlight,
      }}
    >
      <div class="flex items-center gap-1 mb-1">
        <span class="text-[10px] uppercase tracking-wider text-neutral-500">
          {props.label}
        </span>
        <HelpTooltip
          description={props.help.description}
          formula={props.help.formula}
          variables={props.help.variables}
          position="top"
        />
      </div>
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

// Helper component for formula reference cards with KaTeX
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
      <div class="bg-neutral-950/50 px-2 py-1.5 rounded mb-2 overflow-x-auto">
        <Formula math={props.formula} class="text-neutral-300" />
      </div>
      <div class="space-y-0.5">
        <For each={props.variables}>
          {(variable) => <div class="text-neutral-500 text-[10px] font-mono">{variable}</div>}
        </For>
      </div>
    </div>
  );
};
