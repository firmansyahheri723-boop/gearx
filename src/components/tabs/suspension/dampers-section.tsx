import { SectionHeader } from '../../ui/section-header';
import { DataTable } from '../../ui/data-table';
import { HelpTooltip } from '../../ui/help-tooltip';
import type { SuspensionOutputs } from '../../../utils/suspension';

type DamperTableRow = {
  label: string;
  description: string;
  front: number;
  rear: number;
  highlight?: boolean;
}

type Props = {
  outputs: SuspensionOutputs;
}

export function DampersSection(props: Props) {
  const damperData: DamperTableRow[] = [
    { label: 'Bump', description: 'C × 2/3', front: props.outputs.dampers.bumpFront, rear: props.outputs.dampers.bumpRear },
    { label: 'Fast Bump', description: 'C × 1/3', front: props.outputs.dampers.fastBumpFront, rear: props.outputs.dampers.fastBumpRear },
    { label: 'Rebound', description: 'C × 3/2', front: props.outputs.dampers.reboundFront, rear: props.outputs.dampers.reboundRear, highlight: true },
    { label: 'Fast Rebound', description: 'C × 3/4', front: props.outputs.dampers.fastReboundFront, rear: props.outputs.dampers.fastReboundRear },
  ];

  const damperColumns = [
    {
      accessorKey: 'label',
      header: 'Damper Type',
      cell: (info: any) => {
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
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <span
            class="block px-4 py-2 text-center"
            classList={{
              'bg-amber-500/5 text-amber-400 font-medium': row.highlight,
              'bg-neutral-900/30 text-neutral-300': !row.highlight,
            }}
          >
            {info.getValue().toFixed(0)}
          </span>
        );
      },
    },
    {
      accessorKey: 'rear',
      header: 'Rear',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <span
            class="block px-4 py-2 text-center"
            classList={{
              'bg-amber-500/5 text-amber-400 font-medium': row.highlight,
              'bg-neutral-900/30 text-neutral-300': !row.highlight,
            }}
          >
            {info.getValue().toFixed(0)}
          </span>
        );
      },
    },
  ];

  return (
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
        data={damperData}
        columns={damperColumns}
      />
      <div class="px-4 py-2 border-t border-neutral-800/30 bg-neutral-900/30 flex items-center gap-6">
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-neutral-500">
            Critical Damping Front:{' '}
            <span class="text-neutral-400">
              {props.outputs.dampers.critDampingFront.toFixed(0)} N·s/m
            </span>
          </span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-neutral-500">
            Critical Damping Rear:{' '}
            <span class="text-neutral-400">
              {props.outputs.dampers.critDampingRear.toFixed(0)} N·s/m
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
  );
}
