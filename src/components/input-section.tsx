import type { Component } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { EditableCell } from './ui/editable-cell';
import { LabelCell } from './ui/label-cell';
import { SelectCell } from './ui/select-cell';
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';

const CAR_OPTIONS = ['Dodge Challenger SRT', 'Ford Mustang GT', 'Chevrolet Camaro SS'];
const DRIVETRAIN_OPTIONS = ['RWD/AWD', 'FWD', 'AWD'];

export const InputSection: Component = () => {
  return (
    <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
      <SectionHeader title="Vehicle Input" variant="input" />
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <tbody>
            {/* Car Selection */}
            <tr>
              <LabelCell>Car selection</LabelCell>
              <SelectCell
                value={vehicleInputs.carSelection}
                options={CAR_OPTIONS}
                onChange={(v) => setVehicleInputs('carSelection', v)}
                tableId="input"
                row={0}
                col={0}
              />
              <LabelCell>Wheelbase, m</LabelCell>
              <EditableCell
                value={vehicleInputs.wheelbase}
                onChange={(v) => setVehicleInputs('wheelbase', parseFloat(v) || 0)}
                tableId="input"
                row={0}
                col={1}
              />
            </tr>

            {/* Engine Selection */}
            <tr>
              <LabelCell>Engine selection</LabelCell>
              <SelectCell
                value={vehicleInputs.engineSelection}
                options={CAR_OPTIONS}
                onChange={(v) => setVehicleInputs('engineSelection', v)}
                tableId="input"
                row={1}
                col={0}
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
