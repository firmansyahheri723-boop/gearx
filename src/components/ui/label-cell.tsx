import type { Component, JSX } from 'solid-js';

interface LabelCellProps {
  children: JSX.Element;
  align?: 'left' | 'center' | 'right';
  colspan?: number;
  highlight?: boolean;
  /** If true, renders without <td> wrapper (for use with TanStack Table) */
  asContent?: boolean;
}

export const LabelCell: Component<LabelCellProps> = (props) => {
  const content = (
    <span
      class="block px-3 py-2 text-xs uppercase tracking-wide"
      classList={{
        'text-slate-400': !props.highlight,
        'text-green-400': props.highlight,
        'text-left': props.align === 'left' || !props.align,
        'text-center': props.align === 'center',
        'text-right': props.align === 'right',
      }}
    >
      {props.children}
    </span>
  );

  if (props.asContent) {
    return content;
  }

  return (
    <td
      class="border-r border-b border-slate-800/50"
      classList={{
        'bg-slate-900/50': !props.highlight,
        'bg-green-900/20': props.highlight,
      }}
      colspan={props.colspan}
    >
      {content}
    </td>
  );
};
