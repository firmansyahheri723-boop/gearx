import { Component, splitProps, type JSX } from 'solid-js';
import { HelpTooltip } from './help-tooltip';
import type { HelpLink } from '@/types';

export type InputRowProps = {
  label: string;
  description?: string;
  articles?: HelpLink[];
  videos?: HelpLink[];
  class?: string;
  children: JSX.Element;
}

export function InputRow(props: InputRowProps) {
  const [local, otherProps] = splitProps(props, ['label', 'description', 'articles', 'videos', 'children', 'class']);

  return (
    <tr>
      <td class={`border-r border-b border-border/50 px-3 py-2 text-xs uppercase tracking-wide text-foreground-secondary bg-surface/50 w-1/3 ${local.class || ''}`}>
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
        {local.children}
      </td>
    </tr>
  );
};
