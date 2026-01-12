import { Component, splitProps, For } from 'solid-js';
import { RadioGroupRoot, RadioGroupItem, RadioGroupItemControl, RadioGroupItemText, RadioGroupItemHiddenInput, type RadioGroupValueChangeDetails } from '@ark-ui/solid/radio-group';
import { HelpTooltip } from './help-tooltip';
import type { HelpLink } from '@/types';

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

export function SegmentedRow(props: SegmentedRowProps) {
  const [local] = splitProps(props, ['label', 'description', 'articles', 'videos', 'value', 'onChange', 'options', 'unit']);

  return (
    <tr>
      <td class="border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50">
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
      <td class="border-b border-border/50 p-0 bg-surface-elevated/40">
        <div class="flex items-center px-2 py-1.5">
          <RadioGroupRoot
            value={String(local.value)}
            onValueChange={(details: RadioGroupValueChangeDetails) => {
              const found = local.options.find(opt => String(opt.value) === details.value);
              local.onChange(found?.value ?? details.value as string | number);
            }}
            class="flex gap-0.5"
          >
            <For each={local.options}>
              {(option) => (
                <RadioGroupItem
                  value={String(option.value)}
                  class="px-3 py-1 text-xs transition-all duration-100"
                  classList={{
                    'bg-foreground/20 text-foreground-secondary border border-border/50':
                      String(local.value) === String(option.value),
                    'bg-surface/50 text-muted border border-border/50 hover:text-foreground':
                      String(local.value) !== String(option.value),
                  }}
                >
                  <RadioGroupItemControl />
                  <RadioGroupItemText>{option.label}</RadioGroupItemText>
                  <RadioGroupItemHiddenInput />
                </RadioGroupItem>
              )}
            </For>
          </RadioGroupRoot>
          {local.unit && (
            <span class="px-2 text-muted text-xs">{local.unit}</span>
          )}
        </div>
      </td>
    </tr>
  );
};
