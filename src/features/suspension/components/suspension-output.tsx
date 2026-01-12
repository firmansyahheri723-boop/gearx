import { SectionHeader } from '@/components/ui/section-header';
import { DataTable } from '@/components/ui/data-table';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import type { HelpLink } from '@/types';
import type { SuspensionOutputs } from '@/features/suspension/utils/suspension';
import type { ColumnDef } from '@tanstack/solid-table';

const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  springsStiffness: {
    description:
      "Recommended spring rates in N/mm (Newtons per millimeter). Front and rear values are calculated based on your ride frequency and weight distribution settings. Higher values = stiffer springs = less body movement but harsher ride.",
    articles: [
      { label: "Wikipedia: Spring Rate", url: "https://en.wikipedia.org/wiki/Spring_(device)#Spring_rate" },
    ],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
    ],
  },
  dampers: {
    description:
      "Recommended damper settings for different conditions. Bump controls compression speed, Rebound controls extension speed. Fast variants handle quick impacts, slow variants handle body movements. Values are in N·s/m (Newton-seconds per meter).",
    articles: [
      { label: "Wikipedia: Shock Absorber", url: "https://en.wikipedia.org/wiki/Shock_absorber" },
    ],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
    ],
  },
  antiRollBars: {
    description:
      "Front Anti-Roll Bar (FARB) and Rear Anti-Roll Bar (RARB) stiffness in kNm. These resist body roll during cornering. The balance between front and rear affects handling: more front = understeer, more rear = oversteer.",
    articles: [
      { label: "Wikipedia: Anti-roll Bar", url: "https://en.wikipedia.org/wiki/Anti-roll_bar" },
    ],
    videos: [
      { label: "Anti-Roll Bars Guide", url: "https://youtu.be/It-V_Yt_PDc?si=njpT1_KasdUdZGxY" },
    ],
  },
  accelerationMetrics: {
    description:
      "Weight transfer and acceleration data. Shows how much weight shifts under acceleration/braking and maximum G-forces the car can achieve. Use this to understand traction limits and optimize launch/braking performance.",
    articles: [
      { label: "Wikipedia: Weight Transfer", url: "https://en.wikipedia.org/wiki/Weight_transfer" },
    ],
    videos: [
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
};

type DamperRow = {
  label: string;
  front: number;
  rear: number;
}

type MetricRow = {
  label: string;
  value: string;
}

const damperColumns: ColumnDef<DamperRow>[] = [
  {
    accessorKey: 'label',
    header: 'Dampers',
    cell: (info) => (
      <span class="block px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
        {info.getValue() as string}
      </span>
    ),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'front',
    header: 'Front',
    cell: (info) => (
      <span class="block px-3 py-2 text-amber-400 bg-surface/30">
        {info.getValue() as number}
      </span>
    ),
  },
  {
    accessorKey: 'rear',
    header: 'Rear',
    cell: (info) => (
      <span class="block px-3 py-2 text-amber-400 bg-surface/30">
        {info.getValue() as number}
      </span>
    ),
  },
];

const metricColumns: ColumnDef<MetricRow>[] = [
  {
    accessorKey: 'label',
    header: 'Metric',
    cell: (info) => (
      <span class="block px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
        {info.getValue() as string}
      </span>
    ),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: (info) => (
      <span class="block px-3 py-2 text-amber-400 bg-surface/30">
        {info.getValue() as string}
      </span>
    ),
  },
];

type SuspensionOutputProps = {
  outputs: SuspensionOutputs;
}

export function SuspensionOutput(props: SuspensionOutputProps) {
  // Create reactive data for Dampers table
  const damperData = (): DamperRow[] => [
    { label: 'Bump', front: Math.round(props.outputs.dampers.bumpFront), rear: Math.round(props.outputs.dampers.bumpRear) },
    { label: 'Fast bump', front: Math.round(props.outputs.dampers.fastBumpFront), rear: Math.round(props.outputs.dampers.fastBumpRear) },
    { label: 'Rebound', front: Math.round(props.outputs.dampers.reboundFront), rear: Math.round(props.outputs.dampers.reboundRear) },
    { label: 'Fast rebound', front: Math.round(props.outputs.dampers.fastReboundFront), rear: Math.round(props.outputs.dampers.fastReboundRear) },
  ];

  // Create reactive data for Acceleration Metrics table
  const metricsData = (): MetricRow[] => [
    { label: 'Weight transfer on accel', value: `${props.outputs.acceleration.weightTransfer.toFixed(1)} kg` },
    { label: 'Front weight dist on accel', value: `${props.outputs.acceleration.frontBiasOnAccel.toFixed(1)}%` },
    { label: 'Max longitudinal accel', value: `${props.outputs.acceleration.longitudinalAccelG.toFixed(2)} g` },
    { label: 'Max lateral accel', value: `${props.outputs.acceleration.lateralAccelG.toFixed(2)} g` },
  ];

  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader title="Suspension Output" variant="output" />

      {/* Springs Stiffness */}
      <div class="p-3 border-b border-border/30">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] uppercase tracking-wider text-muted">
            Springs Stiffness
          </div>
          <HelpTooltip
            description={HELP_CONTENT.springsStiffness.description}
            articles={HELP_CONTENT.springsStiffness.articles}
            videos={HELP_CONTENT.springsStiffness.videos}
            position="left"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-surface/50 border border-border/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-muted mb-1">
              Front
            </div>
            <div class="text-2xl font-semibold text-amber-400">
              {(props.outputs.springs.frontStiffness / 1000).toFixed(2)}
              <span class="text-xs text-muted ml-1">kN/m</span>
            </div>
          </div>
          <div class="bg-surface/50 border border-border/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-muted mb-1">
              Rear
            </div>
            <div class="text-2xl font-semibold text-amber-400">
              {(props.outputs.springs.rearStiffness / 1000).toFixed(2)}
              <span class="text-xs text-muted ml-1">kN/m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dampers Table */}
      <div class="border-b border-border/30">
        <div class="flex items-center justify-between px-3 py-2 bg-surface/30">
          <div class="text-[10px] uppercase tracking-wider text-muted">
            Dampers
          </div>
          <HelpTooltip
            description={HELP_CONTENT.dampers.description}
            articles={HELP_CONTENT.dampers.articles}
            videos={HELP_CONTENT.dampers.videos}
            position="left"
          />
        </div>
        <DataTable
          data={damperData()}
          columns={damperColumns}
        />
      </div>

      {/* Anti-roll bars */}
      <div class="p-3 border-t border-border/30">
        <div class="flex items-center justify-between mb-2">
          <div class="text-[10px] uppercase tracking-wider text-muted">
            Anti-roll Bars
          </div>
          <HelpTooltip
            description={HELP_CONTENT.antiRollBars.description}
            articles={HELP_CONTENT.antiRollBars.articles}
            videos={HELP_CONTENT.antiRollBars.videos}
            position="left"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-surface/50 border border-border/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-muted mb-1">
              FARB
            </div>
            <div class="text-xl font-semibold text-amber-400">
              {props.outputs.antiRollBars.farb.toFixed(2)}
              <span class="text-xs text-muted ml-1">kNm</span>
            </div>
          </div>
          <div class="bg-surface/50 border border-border/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-muted mb-1">
              RARB
            </div>
            <div class="text-xl font-semibold text-amber-400">
              {props.outputs.antiRollBars.rarb.toFixed(2)}
              <span class="text-xs text-muted ml-1">kNm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acceleration Metrics Table */}
      <div class="border-t border-border/30">
        <div class="flex items-center justify-between px-3 py-2 bg-surface/30">
          <div class="text-[10px] uppercase tracking-wider text-muted">
            Acceleration Metrics
          </div>
          <HelpTooltip
            description={HELP_CONTENT.accelerationMetrics.description}
            articles={HELP_CONTENT.accelerationMetrics.articles}
            videos={HELP_CONTENT.accelerationMetrics.videos}
            position="left"
          />
        </div>
        <DataTable
          data={metricsData()}
          columns={metricColumns}
        />
      </div>
    </div>
  );
}
