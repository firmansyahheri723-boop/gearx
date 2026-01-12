import { For } from 'solid-js';
import { SectionHeader } from '@/components/ui/section-header';
import { MetricCard } from '@/components/ui/metric-card';
import type { AlignmentOutputs } from '@/types';

type Props = { outputs: AlignmentOutputs };

export function AlignmentOutputsSection(props: Props) {
  return (
    <div class="border border-border/50 bg-background/50">
      <SectionHeader
        title="Balance Analysis"
        variant="output"
        help={{
          description: 'Predicted handling characteristics based on your alignment settings. These are game-specific approximations for CarX Street physics.',
          position: 'bottom',
        }}
      />
      <div class="p-4 space-y-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Understeer Tendency"
            value={props.outputs.understeerTendency.toFixed(0)}
            unit="%"
            highlight={Math.abs(props.outputs.understeerTendency) > 30}
            badge={props.outputs.understeerTendency > 20 ? 'UNDERSTEER' : props.outputs.understeerTendency < -20 ? 'OVERSTEER' : undefined}
          />
          <MetricCard
            label="Turn-In Response"
            value={props.outputs.turnInResponse.toUpperCase()}
            unit=""
          />
          <MetricCard
            label="Straight-Line Stability"
            value={props.outputs.straightLineStability.toFixed(0)}
            unit="%"
          />
          <MetricCard
            label="Ackermann Type"
            value={props.outputs.ackermannType.toUpperCase()}
            unit=""
          />
        </div>
        
        <For each={props.outputs.recommendations}>
          {(rec) => (
            <div class="flex items-start gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30">
              <span class="text-amber-400">→</span>
              <span class="text-sm text-amber-200">{rec}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
