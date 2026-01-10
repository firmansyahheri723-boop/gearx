import {
  type ColumnDef,
  type SortingState,
  type ColumnPinningState,
  type TableOptions,
  createSolidTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/solid-table';
import { For, Show, createSignal, type JSX, splitProps, mergeProps } from 'solid-js';

// Re-export useful types
export type { ColumnDef, SortingState };
export { createColumnHelper } from '@tanstack/solid-table';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  /** Enable sorting on columns */
  enableSorting?: boolean;
  /** Initial sorting state */
  initialSorting?: SortingState;
  /** Callback when sorting changes */
  onSortingChange?: (sorting: SortingState) => void;
  /** Enable sticky header */
  stickyHeader?: boolean;
  /** Max height for scrollable area */
  maxHeight?: string;
  /** CSS class for the table wrapper */
  class?: string;
  /** Column pinning (e.g., stick first column) */
  columnPinning?: ColumnPinningState;
  /** Show header groups row */
  showHeaderGroups?: boolean;
  /** Custom row class based on row data */
  getRowClass?: (row: TData, index: number) => string;
  /** Render custom row wrapper (for full row control) */
  renderRow?: (props: { row: TData; index: number; children: JSX.Element }) => JSX.Element;
}

const defaultProps = {
  enableSorting: false,
  stickyHeader: false,
  showHeaderGroups: false,
};

export function DataTable<TData>(props: DataTableProps<TData>) {
  const merged = mergeProps(defaultProps, props);
  
  // Internal sorting state (used if no external control)
  const [internalSorting, setInternalSorting] = createSignal<SortingState>(
    props.initialSorting ?? []
  );

  // Use external or internal sorting
  const sorting = () => props.initialSorting ?? internalSorting();
  
  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting()) : updater;
    setInternalSorting(newSorting);
    props.onSortingChange?.(newSorting);
  };

  const table = createSolidTable({
    get data() {
      return merged.data;
    },
    get columns() {
      return merged.columns;
    },
    state: {
      get sorting() {
        return sorting();
      },
      get columnPinning() {
        return merged.columnPinning ?? {};
      },
    },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: merged.enableSorting ? getSortedRowModel() : undefined,
    enableSorting: merged.enableSorting,
  });

  return (
    <div
      class={`overflow-x-auto ${merged.class ?? ''}`}
      style={{ 'max-height': merged.maxHeight }}
    >
      <table class="w-full border-collapse text-sm">
        <thead class={merged.stickyHeader ? 'sticky top-0 z-20' : ''}>
          {/* Header groups row (optional) */}
          <Show when={merged.showHeaderGroups}>
            <For each={table.getHeaderGroups().slice(0, -1)}>
              {(headerGroup) => (
                <tr>
                  <For each={headerGroup.headers}>
                    {(header) => (
                      <th
                        colSpan={header.colSpan}
                        class="border-r border-b border-neutral-800/50 bg-neutral-900 px-3 py-2 text-neutral-500 text-[10px] uppercase tracking-wider text-center"
                      >
                        <Show when={!header.isPlaceholder}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </Show>
                      </th>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </Show>
          
          {/* Main header row */}
          <For each={merged.showHeaderGroups ? table.getHeaderGroups().slice(-1) : table.getHeaderGroups()}>
            {(headerGroup) => (
              <tr>
                <For each={headerGroup.headers}>
                  {(header) => {
                    const canSort = () => merged.enableSorting && header.column.getCanSort();
                    const sortDir = () => header.column.getIsSorted();
                    
                    return (
                      <th
                        colSpan={header.colSpan}
                        class="border-r border-b border-neutral-800/50 bg-neutral-900 px-3 py-2 text-neutral-500 text-[10px] uppercase tracking-wider"
                        classList={{
                          'cursor-pointer select-none hover:bg-neutral-800/50': canSort(),
                          'text-left': header.column.columnDef.meta?.align === 'left',
                          'text-center': !header.column.columnDef.meta?.align || header.column.columnDef.meta?.align === 'center',
                          'text-right': header.column.columnDef.meta?.align === 'right',
                          'sticky left-0 z-30': header.column.getIsPinned() === 'left',
                          'sticky right-0 z-30': header.column.getIsPinned() === 'right',
                        }}
                        onClick={canSort() ? header.column.getToggleSortingHandler() : undefined}
                        title={canSort() ? 'Click to sort' : undefined}
                      >
                        <Show when={!header.isPlaceholder}>
                          <div class="flex items-center justify-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <Show when={canSort()}>
                              <span class="text-neutral-600">
                                {sortDir() === 'asc' ? ' ▲' : sortDir() === 'desc' ? ' ▼' : ''}
                              </span>
                            </Show>
                          </div>
                        </Show>
                      </th>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </thead>
        <tbody>
          <For each={table.getRowModel().rows}>
            {(row, index) => {
              const rowClass = () => merged.getRowClass?.(row.original, index()) ?? '';
              
              const rowContent = (
                <tr class={`hover:bg-neutral-800/30 ${rowClass()}`}>
                  <For each={row.getVisibleCells()}>
                    {(cell) => (
                      <td
                        class="border-r border-b border-neutral-800/50 bg-neutral-950"
                        classList={{
                          'text-left': cell.column.columnDef.meta?.align === 'left',
                          'text-center': !cell.column.columnDef.meta?.align || cell.column.columnDef.meta?.align === 'center',
                          'text-right': cell.column.columnDef.meta?.align === 'right',
                          'sticky left-0 z-10': cell.column.getIsPinned() === 'left',
                          'sticky right-0 z-10': cell.column.getIsPinned() === 'right',
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    )}
                  </For>
                </tr>
              );

              // Allow custom row rendering
              if (merged.renderRow) {
                return merged.renderRow({
                  row: row.original,
                  index: index(),
                  children: rowContent,
                });
              }

              return rowContent;
            }}
          </For>
        </tbody>
      </table>
    </div>
  );
}

// Type extension for column meta
declare module '@tanstack/solid-table' {
  interface ColumnMeta<TData, TValue> {
    align?: 'left' | 'center' | 'right';
    headerClass?: string;
    cellClass?: string;
  }
}
