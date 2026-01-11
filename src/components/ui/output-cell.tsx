import type { Component } from 'solid-js';

interface OutputCellProps {
  value: string | number;
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'highlight';
  /** If true, renders without <td> wrapper (for use with TanStack Table) */
  asContent?: boolean;
}

export const OutputCell: Component<OutputCellProps> = (props) => {
  const isHighlight = () => props.variant === 'highlight';

  const content = (
    <span
      class="block px-3 py-2"
      classList={{
        'text-left': props.align === 'left',
        'text-center': props.align === 'center' || !props.align,
        'text-right': props.align === 'right',
        'text-amber-400': !isHighlight(),
        'text-amber-300 font-medium': isHighlight(),
      }}
    >
      {props.value}
    </span>
  );

  if (props.asContent) {
    return content;
  }

  return (
    <td
      class="border-r border-b border-border/50 hover:bg-surface/60 transition-colors"
      classList={{
        'bg-surface/50': !isHighlight(),
        'bg-amber-500/10 hover:bg-amber-500/15': isHighlight(),
      }}
    >
      {content}
    </td>
  );
};
