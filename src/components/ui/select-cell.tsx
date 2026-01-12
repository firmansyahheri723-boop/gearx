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

export function SelectCell(props: SelectCellProps) {
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
          'bg-surface-elevated/40 hover:bg-surface/30': !isSelected(),
          'bg-foreground/10 ring-1 ring-inset ring-foreground/50': isSelected(),
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <td
      class="border-r border-b border-border/50 p-0 transition-colors"
      classList={{
        'bg-surface-elevated/40 hover:bg-surface/30': !isSelected(),
        'bg-foreground/10 ring-1 ring-inset ring-foreground/50': isSelected(),
      }}
    >
      {content}
    </td>
  );
};
