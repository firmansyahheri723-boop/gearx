import { Component, For } from 'solid-js';
import { isCellSelected } from '../../stores/selection';

interface SelectCellProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  tableId: string;
  row: number;
  col: number;
}

export const SelectCell: Component<SelectCellProps> = (props) => {
  const isSelected = () => isCellSelected(props.tableId, props.row, props.col);

  return (
    <td
      class="border-r border-b border-slate-800/50 p-0"
      classList={{
        'bg-slate-900/30 hover:bg-slate-800/50': !isSelected(),
        'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/50': isSelected(),
      }}
    >
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        class="w-full h-full px-3 py-2 bg-transparent text-emerald-400 cursor-pointer appearance-none focus:outline-none"
        style={{
          'background-image':
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2334d399' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\")",
          'background-repeat': 'no-repeat',
          'background-position': 'right 12px center',
        }}
      >
        <For each={props.options}>
          {(option) => (
            <option value={option} class="bg-slate-900">
              {option}
            </option>
          )}
        </For>
      </select>
    </td>
  );
};
