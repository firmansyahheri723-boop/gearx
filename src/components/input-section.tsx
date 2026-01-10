import { Component, createMemo, Show } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from './ui/section-header';
import { EditableCell } from './ui/editable-cell';
import { SelectCell } from './ui/select-cell';
import { DataTable } from './ui/data-table';
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';
import { carData, selectCar, selectEngine, selectedCarIndex, selectedEngineIndex, getSelectedCar, getSelectedEngine } from '../stores/car-data';

const DRIVETRAIN_OPTIONS = ['RWD/AWD', 'FWD', 'AWD'];

// Row type for the input table
interface InputRow {
  id: string;
  label1: string;
  field1Key: string;
  field1Type: 'editable' | 'select' | 'empty';
  label2?: string;
  label2Highlight?: boolean;
  field2Key?: string;
  field2Type?: 'editable' | 'select' | 'empty';
  field2Highlight?: boolean;
}

export const InputSection: Component = () => {
  // Get car names from imported data for dropdown options
  const carOptions = createMemo(() => {
    if (carData.length === 0) {
      return ['No cars imported'];
    }
    return carData.map((car) => car.car || 'Unknown');
  });

  // Handle car selection change
  const handleCarChange = (carName: string) => {
    const index = carData.findIndex((car) => car.car === carName);
    if (index >= 0) {
      selectCar(index);
    }
  };

  // Handle engine selection change
  const handleEngineChange = (carName: string) => {
    const index = carData.findIndex((car) => car.car === carName);
    if (index >= 0) {
      selectEngine(index);
    }
  };

  // Check if a field is from car data (to show indicator)
  const isCarDataField = (field: 'wheelbase' | 'frontTrackWidth' | 'rearTrackWidth') => {
    const car = getSelectedCar();
    if (!car) return false;
    switch (field) {
      case 'wheelbase':
        return car.wheelbase !== null || (car.fAxleOffset !== null && car.rAxleOffset !== null);
      case 'frontTrackWidth':
        return car.fTrackWidth !== null;
      case 'rearTrackWidth':
        return car.rTrackWidth !== null;
      default:
        return false;
    }
  };

  // Define input rows data
  const inputRows = createMemo((): InputRow[] => [
    { id: '0', label1: 'Car selection', field1Key: 'carSelection', field1Type: 'select', label2: 'Wheelbase, m', label2Highlight: isCarDataField('wheelbase'), field2Key: 'wheelbase', field2Type: 'editable', field2Highlight: isCarDataField('wheelbase') },
    { id: '1', label1: 'Engine selection', field1Key: 'engineSelection', field1Type: 'select' },
    { id: '2', label1: 'Weight, kg', field1Key: 'weight', field1Type: 'editable', label2: 'Front track width', field2Key: 'frontTrackWidth', field2Type: 'editable' },
    { id: '3', label1: 'Front weight dist, %', field1Key: 'frontWeightDistribution', field1Type: 'editable', label2: 'Rear track width', field2Key: 'rearTrackWidth', field2Type: 'editable' },
    { id: '4', label1: 'Front wheel offset, cm', field1Key: 'frontWheelOffset', field1Type: 'editable' },
    { id: '5', label1: 'Rear wheel offset, cm', field1Key: 'rearWheelOffset', field1Type: 'editable' },
    { id: '6', label1: 'Ride frequency (3-5)', field1Key: 'desiredRideFrequency', field1Type: 'editable' },
    { id: '7', label1: 'Roll gradient (0.02-0.7)', field1Key: 'desiredRollGradient', field1Type: 'editable', label2: 'Real Y engine offset', field2Key: 'realYEngineOffset', field2Type: 'editable' },
    { id: '8', label1: 'Wheel diameter, in', field1Key: 'wheelDiameter', field1Type: 'editable' },
    { id: '9', label1: 'Profile, %', field1Key: 'profile', field1Type: 'editable', label2: 'Real Z engine offset', field2Key: 'realZEngineOffset', field2Type: 'editable' },
    { id: '10', label1: 'Tire width, mm', field1Key: 'tireWidth', field1Type: 'editable' },
    { id: '11', label1: 'CoG height, in', field1Key: 'cogHeight', field1Type: 'editable' },
    { id: '12', label1: '0-100 km/h, s', field1Key: 'acceleration0to100', field1Type: 'editable' },
    { id: '13', label1: 'Max speed @ 118m radius', field1Key: 'maxSpeed118mRadius', field1Type: 'editable' },
    { id: '14', label1: 'Drivetrain', field1Key: 'drivetrain', field1Type: 'select' },
  ]);

  // Helper to get value from vehicleInputs
  const getValue = (key: string) => {
    return (vehicleInputs as any)[key];
  };

  // Helper to set value in vehicleInputs
  const setValue = (key: string, value: string) => {
    if (key === 'drivetrain') {
      setVehicleInputs(key, value);
    } else {
      setVehicleInputs(key as any, parseFloat(value) || 0);
    }
  };

  // Column definitions
  const columns = createMemo((): ColumnDef<InputRow>[] => [
    {
      id: 'label1',
      accessorKey: 'label1',
      header: '',
      cell: (info) => (
        <span class="block px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
          {info.getValue() as string}
        </span>
      ),
      meta: { align: 'left' as const },
    },
    {
      id: 'field1',
      accessorKey: 'field1Key',
      header: '',
      cell: (info) => {
        const row = info.row.original;
        const rowIndex = info.row.index;

        if (row.field1Type === 'select') {
          if (row.field1Key === 'carSelection') {
            return (
              <SelectCell
                value={vehicleInputs.carSelection}
                options={carOptions()}
                onChange={handleCarChange}
                tableId="input"
                row={rowIndex}
                col={0}
                disabled={carData.length === 0}
                asContent
              />
            );
          }
          if (row.field1Key === 'engineSelection') {
            return (
              <SelectCell
                value={vehicleInputs.engineSelection}
                options={carOptions()}
                onChange={handleEngineChange}
                tableId="input"
                row={rowIndex}
                col={0}
                disabled={carData.length === 0}
                asContent
              />
            );
          }
          if (row.field1Key === 'drivetrain') {
            return (
              <SelectCell
                value={vehicleInputs.drivetrain}
                options={DRIVETRAIN_OPTIONS}
                onChange={(v) => setVehicleInputs('drivetrain', v)}
                tableId="input"
                row={rowIndex}
                col={0}
                asContent
              />
            );
          }
        }

        if (row.field1Type === 'editable') {
          return (
            <EditableCell
              value={getValue(row.field1Key)}
              onChange={(v) => setValue(row.field1Key, v)}
              tableId="input"
              row={rowIndex}
              col={0}
              asContent
            />
          );
        }

        return null;
      },
    },
    {
      id: 'label2',
      accessorKey: 'label2',
      header: '',
      cell: (info) => {
        const row = info.row.original;
        if (!row.label2) {
          return <span class="block bg-slate-900/20 h-full min-h-[40px]" />;
        }
        return (
          <span
            class="block px-3 py-2 text-xs uppercase tracking-wide"
            classList={{
              'text-slate-400 bg-slate-900/50': !row.label2Highlight,
              'text-green-400 bg-green-900/20': row.label2Highlight,
            }}
          >
            {row.label2}
          </span>
        );
      },
      meta: { align: 'left' as const },
    },
    {
      id: 'field2',
      accessorKey: 'field2Key',
      header: '',
      cell: (info) => {
        const row = info.row.original;
        const rowIndex = info.row.index;

        if (!row.field2Key || !row.field2Type) {
          return <span class="block bg-slate-900/20 h-full min-h-[40px]" />;
        }

        if (row.field2Type === 'editable') {
          return (
            <EditableCell
              value={getValue(row.field2Key)}
              onChange={(v) => setValue(row.field2Key!, v)}
              tableId="input"
              row={rowIndex}
              col={1}
              highlight={row.field2Highlight}
              asContent
            />
          );
        }

        return null;
      },
    },
  ]);

  return (
    <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
      <SectionHeader title="Vehicle Input" variant="input" />
      
      {/* Selection info banner */}
      <Show when={selectedCarIndex() !== null || selectedEngineIndex() !== null}>
        <div class="px-3 py-1.5 border-b border-slate-800/50 bg-slate-900/50 flex items-center gap-4 text-[10px]">
          <Show when={getSelectedCar()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-green-500 rounded-full" />
              <span class="text-slate-400">Chassis:</span>
              <span class="text-green-400 font-medium">{getSelectedCar()?.car}</span>
            </span>
          </Show>
          <Show when={getSelectedEngine()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-amber-500 rounded-full" />
              <span class="text-slate-400">Engine:</span>
              <span class="text-amber-400 font-medium">{getSelectedEngine()?.car}</span>
            </span>
          </Show>
        </div>
      </Show>
      
      <DataTable
        data={inputRows()}
        columns={columns()}
      />
    </div>
  );
};
