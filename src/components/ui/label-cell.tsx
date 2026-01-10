import type { Component, JSX } from 'solid-js';

interface LabelCellProps {
  children: JSX.Element;
  align?: 'left' | 'center' | 'right';
  colspan?: number;
  highlight?: boolean;
}

export const LabelCell: Component<LabelCellProps> = (props) => {
  return (
    <td
      class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide"
      classList={{
        'bg-slate-900/50 text-slate-400': !props.highlight,
        'bg-green-900/20 text-green-400': props.highlight,
        'text-left': props.align === 'left' || !props.align,
        'text-center': props.align === 'center',
        'text-right': props.align === 'right',
      }}
      colspan={props.colspan}
    >
      {props.children}
    </td>
  );
};
