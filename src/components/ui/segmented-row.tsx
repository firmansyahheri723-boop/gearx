import { Component, splitProps, For } from 'solid-js';
import { HelpTooltip, type HelpLink } from './help-tooltip';

export type SegmentedRowOption = {
  label: string;
  value: string | number;
}

export type SegmentedRowProps = {
  label: string;
  description?: string;
  articles?: HelpLink[];
  videos?: HelpLink[];
  value: string | number;
  onChange: (value: string | number) => void;
  options: SegmentedRowOption[];
  unit?: string;
}

export const SegmentedRow: Component<SegmentedRowProps> = (props) => {
  const [local] = splitProps(props, ['label', 'description', 'articles', 'videos', 'value', 'onChange', 'options', 'unit']);

  return (
    <tr>
      <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
        <div class="flex items-center justify-between">
          <span>{local.label}</span>
          {local.description && (
            <HelpTooltip
              description={local.description}
              articles={local.articles}
              videos={local.videos}
            />
          )}
        </div>
      </td>
      <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
        <div class="flex items-center px-2 py-1.5">
          <div class="flex gap-0.5">
            <For each={local.options}>
              {(option) => (
                <button
                  type="button"
                  onClick={() => local.onChange(option.value)}
                  class="px-3 py-1 text-xs transition-all duration-100"
                  classList={{
                    'bg-neutral-500/20 text-neutral-400 border border-neutral-500/50':
                      local.value === option.value,
                    'bg-neutral-900/50 text-neutral-500 border border-neutral-700/50 hover:text-neutral-300':
                      local.value !== option.value,
                  }}
                >
                  {option.label}
                </button>
              )}
            </For>
          </div>
          {local.unit && (
            <span class="px-2 text-neutral-500 text-xs">{local.unit}</span>
          )}
        </div>
      </td>
    </tr>
  );
};
