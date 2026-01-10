import type { Component } from 'solid-js';
import {
  isCellSelected,
  isSelecting,
  selectionStart,
  setIsSelecting,
  setSelectionEnd,
  setSelectionStart,
} from '../../stores/selection';

interface EditableCellProps {
  value: string | number;
  onChange: (value: string) => void;
  tableId: string;
  row: number;
  col: number;
  type?: 'text' | 'number';
  align?: 'left' | 'center' | 'right';
  highlight?: boolean;
}

export const EditableCell: Component<EditableCellProps> = (props) => {
  const isSelected = () => isCellSelected(props.tableId, props.row, props.col);

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    setIsSelecting(true);
    setSelectionStart({ tableId: props.tableId, row: props.row, col: props.col });
    setSelectionEnd({ tableId: props.tableId, row: props.row, col: props.col });
  };

  const handleMouseEnter = () => {
    if (isSelecting()) {
      const start = selectionStart();
      if (start && start.tableId === props.tableId) {
        setSelectionEnd({ tableId: props.tableId, row: props.row, col: props.col });
      }
    }
  };

  return (
    <td
      class="border-r border-b border-slate-800/50 p-0 transition-colors duration-75"
      classList={{
        'bg-slate-900/30 hover:bg-slate-800/50': !isSelected() && !props.highlight,
        'bg-green-900/20 hover:bg-green-900/30': !isSelected() && props.highlight,
        'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/50': isSelected(),
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
    >
      <input
        type={props.type || 'text'}
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        class="w-full h-full px-3 py-2 bg-transparent focus:bg-slate-800/50 focus:text-emerald-400 focus:outline-none"
        classList={{
          'text-cyan-400': !props.highlight,
          'text-green-400': props.highlight,
          'text-left': props.align === 'left',
          'text-center': props.align === 'center' || !props.align,
          'text-right': props.align === 'right',
        }}
      />
    </td>
  );
};
