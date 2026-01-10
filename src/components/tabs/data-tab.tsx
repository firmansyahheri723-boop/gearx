import { Component, For, Show, createSignal } from 'solid-js';
import { carData, importCarData, clearCarData } from '../../stores/car-data';
import { toast } from '../../stores/notifications';
import { parseCSV, downloadCSV, CSV_COLUMNS } from '../../utils/csv';
import type { CarData } from '../../types';

// Column group definitions for visual organization
const COLUMN_GROUPS = [
  {
    name: 'Car',
    color: 'bg-yellow-500/20 border-yellow-500/30',
    headerColor: 'text-yellow-400',
    columns: ['car'],
  },
  {
    name: 'Wheelbase, track width (meters)',
    color: 'bg-green-500/10 border-green-500/30',
    headerColor: 'text-green-400',
    columns: ['height', 'fAxleOffset', 'rAxleOffset', 'wheelbase', 'fTrackWidth', 'rTrackWidth', 'avTrackWidth'],
  },
  {
    name: 'Transmission',
    color: 'bg-blue-500/10 border-blue-500/30',
    headerColor: 'text-blue-400',
    columns: ['gears', 'shiftTime', 'weight'],
  },
  {
    name: 'Body - Stock',
    color: 'bg-purple-500/10 border-purple-500/30',
    headerColor: 'text-purple-400',
    columns: ['stockCx', 'stockSx', 'stockDrag'],
  },
  {
    name: 'Body - Stage 1/2',
    color: 'bg-purple-500/10 border-purple-500/30',
    headerColor: 'text-purple-400',
    columns: ['stage12Cx', 'stage12Sx', 'stage12Drag'],
  },
  {
    name: 'Body - Stage 3/4',
    color: 'bg-purple-500/10 border-purple-500/30',
    headerColor: 'text-purple-400',
    columns: ['stage34Cx', 'stage34Sx', 'stage34Drag', 'bodyPosX', 'bodyPosY', 'bodyPosZ'],
  },
  {
    name: 'Engine',
    color: 'bg-emerald-500/10 border-emerald-500/30',
    headerColor: 'text-emerald-400',
    columns: ['powerHp', 'massKg', 'turboPress', 'curveFallRpm', 'revLimiter', 'inertiaRatio', 'enginePosX', 'enginePosY', 'enginePosZ'],
  },
];

// Get column header by key
function getColumnHeader(key: string): string {
  const col = CSV_COLUMNS.find((c) => c.key === key);
  return col?.header || key;
}

// Get column group by key
function getColumnGroup(key: string) {
  return COLUMN_GROUPS.find((g) => g.columns.includes(key));
}

// Format cell value for display
function formatCellValue(value: string | number | null): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (typeof value === 'number') {
    // Format numbers with appropriate precision
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(3).replace(/\.?0+$/, '');
  }
  return value;
}

export const DataTab: Component = () => {
  const [isDragging, setIsDragging] = createSignal(false);
  let fileInputRef: HTMLInputElement | undefined;

  const handleFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so the same file can be selected again
    input.value = '';
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const data = parseCSV(text);
        if (data.length > 0) {
          const error = importCarData(data);
          if (error) {
            toast.warning('Import Warning', error);
          } else {
            toast.success('Data Imported', `Successfully loaded ${data.length} car${data.length > 1 ? 's' : ''}`);
          }
        } else {
          toast.warning('No Data', 'The CSV file appears to be empty or has no valid rows');
        }
      }
    };
    reader.onerror = () => {
      toast.error('Import Failed', 'Could not read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer?.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      processFile(file);
    }
  };

  const handleExport = () => {
    downloadCSV(carData, 'gearx-car-data.csv');
    toast.success('Data Exported', `Exported ${carData.length} car${carData.length > 1 ? 's' : ''} to CSV`);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      clearCarData();
      toast.info('Data Cleared', 'All car data has been removed');
    }
  };

  // Get all column keys in order (excluding 'car' which is sticky)
  const scrollableColumns = CSV_COLUMNS.filter((c) => c.key !== 'car');

  return (
    <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
      {/* Header */}
      <div class="flex items-center justify-between px-3 py-2 border-b bg-slate-900/80 border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-4 bg-emerald-500" />
          <span class="font-semibold tracking-wider text-xs uppercase text-slate-300">
            Car Data
          </span>
          <Show when={carData.length > 0}>
            <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {carData.length} CARS
            </span>
          </Show>
        </div>

        {/* Action buttons */}
        <div class="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            class="hidden"
            onChange={handleFileSelect}
          />

          <button
            type="button"
            onClick={() => fileInputRef?.click()}
            class="px-3 py-1 text-xs font-medium tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
          >
            Import CSV
          </button>

          <Show when={carData.length > 0}>
            <button
              type="button"
              onClick={handleExport}
              class="px-3 py-1 text-xs font-medium tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
            >
              Export CSV
            </button>

            <button
              type="button"
              onClick={handleClear}
              class="px-3 py-1 text-xs font-medium tracking-wider uppercase bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
            >
              Clear
            </button>
          </Show>
        </div>
      </div>

      {/* Content */}
      <Show
        when={carData.length > 0}
        fallback={
          <EmptyState
            isDragging={isDragging()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onImportClick={() => fileInputRef?.click()}
          />
        }
      >
        <DataTable data={carData} scrollableColumns={scrollableColumns} />
      </Show>
    </div>
  );
};

// Empty state component
interface EmptyStateProps {
  isDragging: boolean;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onImportClick: () => void;
}

const EmptyState: Component<EmptyStateProps> = (props) => {
  return (
    <section
      class="p-8 flex flex-col items-center justify-center min-h-[400px] text-center transition-colors"
      classList={{
        'bg-cyan-500/5 border-2 border-dashed border-cyan-500/30': props.isDragging,
      }}
      onDragOver={(e) => props.onDragOver(e)}
      onDragLeave={(e) => props.onDragLeave(e)}
      onDrop={(e) => props.onDrop(e)}
      aria-label="Drop zone for CSV files"
    >
      <div class="w-16 h-16 mb-4 border-2 border-dashed border-slate-700 rounded flex items-center justify-center">
        <svg
          class="w-8 h-8 text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>
      <div class="text-slate-500 text-sm uppercase tracking-wider mb-2">
        No Data Loaded
      </div>
      <div class="text-slate-600 text-xs max-w-md mb-4">
        Import a CSV file containing car data to begin. The data will be used for calculations across the application.
      </div>
      <button
        type="button"
        onClick={props.onImportClick}
        class="px-4 py-2 text-xs font-medium tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors"
      >
        Import CSV File
      </button>
      <div class="mt-4 text-slate-700 text-xs">
        or drag and drop a CSV file here
      </div>
    </section>
  );
};

// Data table component
interface DataTableProps {
  data: CarData[];
  scrollableColumns: { key: keyof CarData; header: string }[];
}

const DataTable: Component<DataTableProps> = (props) => {
  return (
    <div class="relative overflow-hidden">
      <div class="flex">
        {/* Sticky car name column */}
        <div class="flex-shrink-0 border-r-2 border-slate-700 bg-slate-950 z-10">
          <table class="text-xs">
            <thead>
              {/* Group header row */}
              <tr>
                <th class="px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase bg-yellow-500/20 text-yellow-400 border-b border-yellow-500/30 text-left whitespace-nowrap">
                  Car
                </th>
              </tr>
              {/* Column header row */}
              <tr>
                <th class="px-3 py-1.5 text-[10px] font-medium tracking-wider uppercase bg-slate-900 text-slate-400 border-b border-slate-700/50 text-left whitespace-nowrap min-w-[200px]">
                  Name
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={props.data}>
                {(row) => (
                  <tr class="hover:bg-slate-800/30">
                    <td class="px-3 py-1.5 border-b border-slate-800/50 text-cyan-400 font-medium whitespace-nowrap bg-yellow-500/5">
                      {row.car || '-'}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>

        {/* Scrollable columns */}
        <div class="overflow-x-auto flex-1">
          <table class="text-xs w-max">
            <thead>
              {/* Group header row */}
              <tr>
                <For each={COLUMN_GROUPS.filter((g) => g.name !== 'Car')}>
                  {(group) => (
                    <th
                      colSpan={group.columns.length}
                      class={`px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase border-b border-r text-center whitespace-nowrap ${group.color} ${group.headerColor}`}
                    >
                      {group.name}
                    </th>
                  )}
                </For>
              </tr>
              {/* Column header row */}
              <tr>
                <For each={props.scrollableColumns}>
                  {(col) => {
                    const group = getColumnGroup(col.key);
                    return (
                      <th
                        class={`px-3 py-1.5 text-[10px] font-medium tracking-wider uppercase bg-slate-900 text-slate-400 border-b border-r border-slate-700/50 text-center whitespace-nowrap min-w-[80px] ${
                          group ? `border-b-2 ${group.color.split(' ')[1]}` : ''
                        }`}
                      >
                        {col.header}
                      </th>
                    );
                  }}
                </For>
              </tr>
            </thead>
            <tbody>
              <For each={props.data}>
                {(row) => (
                  <tr class="hover:bg-slate-800/30">
                    <For each={props.scrollableColumns}>
                      {(col) => {
                        const group = getColumnGroup(col.key);
                        const bgClass = group ? group.color.split(' ')[0].replace('/20', '/5').replace('/10', '/5') : '';
                        return (
                          <td
                            class={`px-3 py-1.5 border-b border-r border-slate-800/50 text-center text-slate-300 tabular-nums ${bgClass}`}
                          >
                            {formatCellValue(row[col.key])}
                          </td>
                        );
                      }}
                    </For>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>

      {/* Scroll hint */}
      <div class="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
};
