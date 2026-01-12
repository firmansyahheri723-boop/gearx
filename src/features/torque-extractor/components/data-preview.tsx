import { For } from 'solid-js';
import type { ExtractedDataPoint } from '@/types/extraction';

type DataPreviewProps = {
  extractedPoints: ExtractedDataPoint[];
  onBack: () => void;
  onApply: () => void;
}

export function DataPreview(props: DataPreviewProps) {
  return (
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <button
          type="button"
          onClick={props.onBack}
          class="border border-border hover:border-border bg-surface-elevated hover:bg-surface-elevated text-muted hover:text-foreground-secondary px-4 py-2 text-xs uppercase tracking-wider transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={props.onApply}
          class="border border-emerald-700 hover:border-emerald-600 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 hover:text-emerald-300 px-4 py-2 text-xs uppercase tracking-wider transition-colors"
        >
          Apply to Torque Curve
        </button>
      </div>

      <div class="bg-surface/50 border border-border overflow-hidden">
        <div class="px-3 py-2 border-b border-border bg-surface/50">
          <span class="text-[10px] text-muted uppercase tracking-wider">
            Preview: {props.extractedPoints.length} data points
          </span>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <table class="w-full text-xs font-mono">
            <thead class="sticky top-0 bg-surface">
              <tr>
                <th class="px-3 py-2 text-left text-[10px] text-muted font-normal uppercase tracking-wider border-b border-border">#</th>
                <th class="px-3 py-2 text-right text-[10px] text-muted font-normal uppercase tracking-wider border-b border-border">Torque (Nm)</th>
                <th class="px-3 py-2 text-right text-[10px] text-muted font-normal uppercase tracking-wider border-b border-border">RPM</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.extractedPoints}>
                {(point, index) => (
                  <tr class="border-b border-border/50 hover:bg-surface-elevated/30">
                    <td class="px-3 py-2 text-muted">{index() + 1}</td>
                    <td class="px-3 py-2 text-right text-foreground">{point.torque.toFixed(1)}</td>
                    <td class="px-3 py-2 text-right text-foreground">{Math.round(point.rpm)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      <div class="text-[10px] text-muted uppercase tracking-wider">
        This data will replace your current torque curve values. Click "Apply" to confirm.
      </div>
    </div>
  );
}
