import type { Component } from 'solid-js';

interface OutputCellProps {
  value: string | number;
  align?: 'left' | 'center' | 'right';
  variant?: 'default' | 'highlight';
}

export const OutputCell: Component<OutputCellProps> = (props) => {
  const isHighlight = () => props.variant === 'highlight';

  return (
    <td
      class="border-r border-b border-slate-800/50 px-3 py-2"
      classList={{
        'text-left': props.align === 'left',
        'text-center': props.align === 'center' || !props.align,
        'text-right': props.align === 'right',
        'bg-slate-900/30 text-amber-400': !isHighlight(),
        'bg-amber-500/10 text-amber-300 font-medium': isHighlight(),
      }}
    >
      {props.value}
    </td>
  );
};
