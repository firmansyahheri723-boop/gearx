import { Component, createMemo, Show } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { EditableCell } from './ui/editable-cell';
import { LabelCell } from './ui/label-cell';
import { SelectCell } from './ui/select-cell';
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';
import { carData, selectCar, selectEngine, selectedCarIndex, selectedEngineIndex, getSelectedCar, getSelectedEngine } from '../stores/car-data';

const DRIVETRAIN_OPTIONS = ['RWD/AWD', 'FWD', 'AWD'];

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
      
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <tbody>
            {/* Car Selection */}
            <tr>
              <LabelCell>Car selection</LabelCell>
              <SelectCell
                value={vehicleInputs.carSelection}
                options={carOptions()}
                onChange={handleCarChange}
                tableId="input"
                row={0}
                col={0}
                disabled={carData.length === 0}
              />
              <LabelCell highlight={isCarDataField('wheelbase')}>Wheelbase, m</LabelCell>
              <EditableCell
                value={vehicleInputs.wheelbase}
                onChange={(v) => setVehicleInputs('wheelbase', parseFloat(v) || 0)}
                tableId="input"
                row={0}
                col={1}
                highlight={isCarDataField('wheelbase')}
              />
            </tr>

            {/* Engine Selection */}
            <tr>
              <LabelCell>Engine selection</LabelCell>
              <SelectCell
                value={vehicleInputs.engineSelection}
                options={carOptions()}
                onChange={handleEngineChange}
                tableId="input"
                row={1}
                col={0}
                disabled={carData.length === 0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Weight */}
            <tr>
              <LabelCell>Weight, kg</LabelCell>
              <EditableCell
                value={vehicleInputs.weight}
                onChange={(v) => setVehicleInputs('weight', parseFloat(v) || 0)}
                tableId="input"
                row={2}
                col={0}
              />
              <LabelCell>Front track width</LabelCell>
              <EditableCell
                value={vehicleInputs.frontTrackWidth}
                onChange={(v) => setVehicleInputs('frontTrackWidth', parseFloat(v) || 0)}
                tableId="input"
                row={2}
                col={1}
              />
            </tr>

            {/* Front weight distribution */}
            <tr>
              <LabelCell>Front weight dist, %</LabelCell>
              <EditableCell
                value={vehicleInputs.frontWeightDistribution}
                onChange={(v) => setVehicleInputs('frontWeightDistribution', parseFloat(v) || 0)}
                tableId="input"
                row={3}
                col={0}
              />
              <LabelCell>Rear track width</LabelCell>
              <EditableCell
                value={vehicleInputs.rearTrackWidth}
                onChange={(v) => setVehicleInputs('rearTrackWidth', parseFloat(v) || 0)}
                tableId="input"
                row={3}
                col={1}
              />
            </tr>

            {/* Front wheel offset */}
            <tr>
              <LabelCell>Front wheel offset, cm</LabelCell>
              <EditableCell
                value={vehicleInputs.frontWheelOffset}
                onChange={(v) => setVehicleInputs('frontWheelOffset', parseFloat(v) || 0)}
                tableId="input"
                row={4}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Rear wheel offset */}
            <tr>
              <LabelCell>Rear wheel offset, cm</LabelCell>
              <EditableCell
                value={vehicleInputs.rearWheelOffset}
                onChange={(v) => setVehicleInputs('rearWheelOffset', parseFloat(v) || 0)}
                tableId="input"
                row={5}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Desired ride frequency */}
            <tr>
              <LabelCell>Ride frequency (3-5)</LabelCell>
              <EditableCell
                value={vehicleInputs.desiredRideFrequency}
                onChange={(v) => setVehicleInputs('desiredRideFrequency', parseFloat(v) || 0)}
                tableId="input"
                row={6}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Desired roll gradient */}
            <tr>
              <LabelCell>Roll gradient (0.02-0.7)</LabelCell>
              <EditableCell
                value={vehicleInputs.desiredRollGradient}
                onChange={(v) => setVehicleInputs('desiredRollGradient', parseFloat(v) || 0)}
                tableId="input"
                row={7}
                col={0}
              />
              <LabelCell>Real Y engine offset</LabelCell>
              <EditableCell
                value={vehicleInputs.realYEngineOffset}
                onChange={(v) => setVehicleInputs('realYEngineOffset', parseFloat(v) || 0)}
                tableId="input"
                row={7}
                col={1}
              />
            </tr>

            {/* Wheel diameter */}
            <tr>
              <LabelCell>Wheel diameter, in</LabelCell>
              <EditableCell
                value={vehicleInputs.wheelDiameter}
                onChange={(v) => setVehicleInputs('wheelDiameter', parseFloat(v) || 0)}
                tableId="input"
                row={8}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Profile */}
            <tr>
              <LabelCell>Profile, %</LabelCell>
              <EditableCell
                value={vehicleInputs.profile}
                onChange={(v) => setVehicleInputs('profile', parseFloat(v) || 0)}
                tableId="input"
                row={9}
                col={0}
              />
              <LabelCell>Real Z engine offset</LabelCell>
              <EditableCell
                value={vehicleInputs.realZEngineOffset}
                onChange={(v) => setVehicleInputs('realZEngineOffset', parseFloat(v) || 0)}
                tableId="input"
                row={9}
                col={1}
              />
            </tr>

            {/* Tire width */}
            <tr>
              <LabelCell>Tire width, mm</LabelCell>
              <EditableCell
                value={vehicleInputs.tireWidth}
                onChange={(v) => setVehicleInputs('tireWidth', parseFloat(v) || 0)}
                tableId="input"
                row={10}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* CoG height */}
            <tr>
              <LabelCell>CoG height, in</LabelCell>
              <EditableCell
                value={vehicleInputs.cogHeight}
                onChange={(v) => setVehicleInputs('cogHeight', parseFloat(v) || 0)}
                tableId="input"
                row={11}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Acceleration */}
            <tr>
              <LabelCell>0-100 km/h, s</LabelCell>
              <EditableCell
                value={vehicleInputs.acceleration0to100}
                onChange={(v) => setVehicleInputs('acceleration0to100', parseFloat(v) || 0)}
                tableId="input"
                row={12}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Max speed */}
            <tr>
              <LabelCell>Max speed @ 118m radius</LabelCell>
              <EditableCell
                value={vehicleInputs.maxSpeed118mRadius}
                onChange={(v) => setVehicleInputs('maxSpeed118mRadius', parseFloat(v) || 0)}
                tableId="input"
                row={13}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>

            {/* Drivetrain */}
            <tr>
              <LabelCell>Drivetrain</LabelCell>
              <SelectCell
                value={vehicleInputs.drivetrain}
                options={DRIVETRAIN_OPTIONS}
                onChange={(v) => setVehicleInputs('drivetrain', v)}
                tableId="input"
                row={14}
                col={0}
              />
              <td class="border-r border-b border-slate-800/50 bg-slate-900/20" colspan={2} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
