import { For } from 'solid-js';
import type { ExtractedDataPoint } from '../../../types/extraction';

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
          class="border border-neutral-700 hover:border-neutral-600 bg-neutral-800 hover:bg-neutral-700 text-neutral-500 hover:text-neutral-400 px-4 py-2 text-xs uppercase tracking-wider transition-colors"
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

      <div class="bg-neutral-900/50 border border-neutral-800 overflow-hidden">
        <div class="px-3 py-2 border-b border-neutral-800 bg-neutral-900/50">
          <span class="text-[10px] text-neutral-500 uppercase tracking-wider">
            Preview: {props.extractedPoints.length} data points
          </span>
        </div>
        <div class="max-h-80 overflow-y-auto">
          <table class="w-full text-xs font-mono">
            <thead class="sticky top-0 bg-neutral-900">
              <tr>
                <th class="px-3 py-2 text-left text-[10px] text-neutral-500 font-normal uppercase tracking-wider border-b border-neutral-800">#</th>
                <th class="px-3 py-2 text-right text-[10px] text-neutral-500 font-normal uppercase tracking-wider border-b border-neutral-800">Torque (Nm)</th>
                <th class="px-3 py-2 text-right text-[10px] text-neutral-500 font-normal uppercase tracking-wider border-b border-neutral-800">RPM</th>
              </tr>
            </thead>
            <tbody>
              <For each={props.extractedPoints}>
                {(point, index) => (
                  <tr class="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td class="px-3 py-2 text-neutral-500">{index() + 1}</td>
                    <td class="px-3 py-2 text-right text-neutral-300">{point.torque.toFixed(1)}</td>
                    <td class="px-3 py-2 text-right text-neutral-300">{Math.round(point.rpm)}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      <div class="text-[10px] text-neutral-600 uppercase tracking-wider">
        This data will replace your current torque curve values. Click "Apply" to confirm.
      </div>
    </div>
  );
}
