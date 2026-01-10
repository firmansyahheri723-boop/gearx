import { Component } from 'solid-js';
import { isCellSelected } from '../../stores/selection';
import { Dropdown, DropdownOption } from './dropdown';

interface SelectCellProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  tableId: string;
  row: number;
  col: number;
  disabled?: boolean;
  /** If true, renders without <td> wrapper (for use with TanStack Table) */
  asContent?: boolean;
}

export const SelectCell: Component<SelectCellProps> = (props) => {
  const isSelected = () => isCellSelected(props.tableId, props.row, props.col);

  const content = (
    <Dropdown
      value={props.value}
      options={props.options}
      onChange={props.onChange}
      disabled={props.disabled}
      placeholder="Select..."
    />
  );

  if (props.asContent) {
    return (
      <div
        class="p-0 transition-colors"
        classList={{
          'bg-slate-800/40 hover:bg-cyan-900/30': !isSelected(),
          'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/50': isSelected(),
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <td
      class="border-r border-b border-slate-800/50 p-0 transition-colors"
      classList={{
        'bg-slate-800/40 hover:bg-cyan-900/30': !isSelected(),
        'bg-cyan-500/10 ring-1 ring-inset ring-cyan-500/50': isSelected(),
      }}
    >
      {content}
    </td>
  );
};
