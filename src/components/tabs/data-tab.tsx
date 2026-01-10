import { Component, For, createMemo, createSignal } from 'solid-js';
import { carData, selectedCarIndex, selectedEngineIndex } from '../../stores/car-data';
import { CSV_COLUMNS } from '../../utils/csv';
import type { CarData } from '../../types';

// Sort direction type
type SortDirection = 'default' | 'asc' | 'desc';

// Sort state signal
const [sortColumn, setSortColumn] = createSignal<keyof CarData | null>(null);
const [sortDirection, setSortDirection] = createSignal<SortDirection>('default');

// Sort car data: regular cars first, then engines, then transmissions
// Within each group, items are sorted alphabetically
function defaultSortCarData(data: CarData[]): CarData[] {
  const getCategory = (car: CarData): number => {
    const name = car.car.toLowerCase();
    if (name.endsWith('engine')) return 1;
    if (name.endsWith('transmission')) return 2;
    return 0; // regular car
  };

  return [...data].sort((a, b) => {
    const categoryA = getCategory(a);
    const categoryB = getCategory(b);

    // Sort by category first (car=0, engine=1, transmission=2)
    if (categoryA !== categoryB) {
      return categoryA - categoryB;
    }

    // Within same category, sort alphabetically
    return a.car.localeCompare(b.car);
  });
}

// Sort data by a specific column
function sortByColumn(data: CarData[], column: keyof CarData, direction: SortDirection): CarData[] {
  if (direction === 'default') {
    return defaultSortCarData(data);
  }

  return [...data].sort((a, b) => {
    const valA = a[column];
    const valB = b[column];

    // Handle null values - push them to the end
    if (valA === null && valB === null) return 0;
    if (valA === null) return 1;
    if (valB === null) return -1;

    // Compare values
    let comparison: number;
    if (typeof valA === 'string' && typeof valB === 'string') {
      comparison = valA.localeCompare(valB);
    } else {
      comparison = (valA as number) - (valB as number);
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

// Cycle through sort directions
function cycleSortDirection(column: keyof CarData) {
  const currentColumn = sortColumn();
  const currentDirection = sortDirection();

  if (currentColumn !== column) {
    // New column, start with ascending
    setSortColumn(column);
    setSortDirection('asc');
  } else {
    // Same column, cycle: asc -> desc -> default
    if (currentDirection === 'asc') {
      setSortDirection('desc');
    } else if (currentDirection === 'desc') {
      setSortDirection('default');
      setSortColumn(null);
    } else {
      setSortDirection('asc');
    }
  }
}

// Get sort indicator for a column
function getSortIndicator(column: keyof CarData): string {
  if (sortColumn() !== column) return '';
  const dir = sortDirection();
  if (dir === 'asc') return ' ▲';
  if (dir === 'desc') return ' ▼';
  return '';
}

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
    if (Number.isInteger(value)) {
      return value.toString();
    }
    return value.toFixed(3).replace(/\.?0+$/, '');
  }
  return value;
}

export const DatabaseTab: Component = () => {
  // Get all column keys in order (excluding 'car' which is sticky)
  const scrollableColumns = CSV_COLUMNS.filter((c) => c.key !== 'car');

  // Sort data based on current sort state
  const sortedData = createMemo(() => {
    const column = sortColumn();
    const direction = sortDirection();
    
    if (column && direction !== 'default') {
      return sortByColumn(carData, column, direction);
    }
    return defaultSortCarData(carData);
  });

  return (
    <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
      {/* Header */}
      <div class="flex items-center justify-between px-3 py-2 border-b bg-slate-900/80 border-slate-700/50">
        <div class="flex items-center gap-3">
          <div class="w-1.5 h-4 bg-emerald-500" />
          <span class="font-semibold tracking-wider text-xs uppercase text-slate-300">
            Car Data
          </span>
          <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {carData.length} CARS
          </span>
        </div>
      </div>

      {/* Data Table */}
      <DataTable data={sortedData()} scrollableColumns={scrollableColumns} />
    </div>
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
                <th 
                  class="px-3 py-2 text-xs font-bold tracking-wider uppercase bg-yellow-500/20 text-yellow-400 border-b border-yellow-500/30 text-left whitespace-nowrap"
                >
                  Car
                </th>
              </tr>
              {/* Column header row */}
              <tr>
                <th 
                  class="px-3 py-2.5 text-xs font-semibold tracking-wider uppercase bg-yellow-500/10 text-yellow-400 border-b border-yellow-500/30 text-left whitespace-nowrap min-w-[180px] cursor-pointer hover:bg-yellow-500/20 select-none"
                  onClick={() => cycleSortDirection('car')}
                  title="Click to sort"
                >
                  Name{getSortIndicator('car')}
                </th>
              </tr>
            </thead>
            <tbody>
              <For each={props.data}>
                {(row, index) => {
                  const isSelectedCar = () => selectedCarIndex() === index();
                  const isSelectedEngine = () => selectedEngineIndex() === index();
                  
                  return (
                    <tr 
                      class="hover:bg-slate-800/30"
                      classList={{
                        'bg-cyan-500/10': isSelectedCar() || isSelectedEngine(),
                      }}
                    >
                      <td 
                        class="px-3 py-1.5 border-b border-slate-800/50 font-medium whitespace-nowrap"
                        classList={{
                          'text-cyan-400 bg-yellow-500/5': !isSelectedCar() && !isSelectedEngine(),
                          'text-cyan-300 bg-cyan-500/10': isSelectedCar() || isSelectedEngine(),
                        }}
                      >
                        <div class="flex items-center gap-2">
                          <span>{row.car || '-'}</span>
                          {isSelectedCar() && (
                            <span class="px-1 py-0.5 text-[8px] font-bold tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">
                              CAR
                            </span>
                          )}
                          {isSelectedEngine() && (
                            <span class="px-1 py-0.5 text-[8px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              ENG
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }}
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
                      class={`px-3 py-2 text-xs font-bold tracking-wider uppercase border-b border-r text-center whitespace-nowrap ${group.color} ${group.headerColor}`}
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
                        class={`px-3 py-2.5 text-xs font-semibold tracking-wider uppercase border-b border-r text-center whitespace-nowrap min-w-[80px] cursor-pointer select-none ${
                          group ? `${group.color} ${group.headerColor} hover:brightness-125` : 'bg-slate-900 text-slate-400 border-slate-700/50 hover:bg-slate-800'
                        }`}
                        onClick={() => cycleSortDirection(col.key)}
                        title="Click to sort"
                      >
                        {col.header}{getSortIndicator(col.key)}
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
