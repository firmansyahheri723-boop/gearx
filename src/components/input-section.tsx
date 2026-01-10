import { Component, createMemo, Show, For } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';
import { carData, selectCar, selectEngine, selectedCarIndex, selectedEngineIndex, getSelectedCar, getSelectedEngine } from '../stores/car-data';

const DRIVETRAIN_OPTIONS = ['FWD', 'RWD/AWD'] as const;
const WHEEL_DIAMETER_OPTIONS = [16, 17, 18, 19, 20, 21, 22] as const;

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

  // Slider fill percentage calculator
  const getSliderFill = (value: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 0;
    return ((value - min) / range) * 100;
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
      
      <table class="w-full border-collapse text-sm">
        <tbody>
          {/* Car Selection */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50 w-1/3">
              Car selection
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <select
                value={vehicleInputs.carSelection}
                onChange={(e) => handleCarChange(e.currentTarget.value)}
                disabled={carData.length === 0}
                class="w-full h-full px-3 py-2 bg-transparent text-emerald-400 cursor-pointer focus:outline-none disabled:opacity-50"
              >
                <For each={carOptions()}>
                  {(option) => <option value={option} class="bg-slate-900">{option}</option>}
                </For>
              </select>
            </td>
          </tr>

          {/* Engine Selection */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Engine selection
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <select
                value={vehicleInputs.engineSelection}
                onChange={(e) => handleEngineChange(e.currentTarget.value)}
                disabled={carData.length === 0}
                class="w-full h-full px-3 py-2 bg-transparent text-emerald-400 cursor-pointer focus:outline-none disabled:opacity-50"
              >
                <For each={carOptions()}>
                  {(option) => <option value={option} class="bg-slate-900">{option}</option>}
                </For>
              </select>
            </td>
          </tr>

          {/* Weight */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Weight
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.weight}
                  onInput={(e) => setVehicleInputs('weight', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">kg</span>
              </div>
            </td>
          </tr>

          {/* Front Weight Distribution */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Front weight dist
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.frontWeightDistribution}
                  step={0.1}
                  onInput={(e) => setVehicleInputs('frontWeightDistribution', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">%</span>
              </div>
            </td>
          </tr>

          {/* Front Wheel Offset */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Front wheel offset
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.frontWheelOffset}
                  step={0.1}
                  onInput={(e) => setVehicleInputs('frontWheelOffset', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">cm</span>
              </div>
            </td>
          </tr>

          {/* Rear Wheel Offset */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Rear wheel offset
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.rearWheelOffset}
                  step={0.1}
                  onInput={(e) => setVehicleInputs('rearWheelOffset', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">cm</span>
              </div>
            </td>
          </tr>

          {/* Ride Frequency - Slider */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Ride frequency
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center gap-2 px-3 py-1.5">
                <span class="text-slate-600 text-xs w-6">3</span>
                <div class="flex-1 relative h-5 flex items-center">
                  <div class="absolute inset-x-0 h-1 bg-slate-700 rounded-full">
                    <div
                      class="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                      style={{ width: `${getSliderFill(vehicleInputs.desiredRideFrequency, 3, 5)}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={5}
                    step={0.1}
                    value={vehicleInputs.desiredRideFrequency}
                    onInput={(e) => setVehicleInputs('desiredRideFrequency', parseFloat(e.currentTarget.value))}
                    class="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    class="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/30 pointer-events-none border border-cyan-300"
                    style={{ left: `calc(${getSliderFill(vehicleInputs.desiredRideFrequency, 3, 5)}% - 5px)` }}
                  />
                </div>
                <span class="text-slate-600 text-xs w-6">5</span>
                <input
                  type="number"
                  value={vehicleInputs.desiredRideFrequency}
                  step={0.1}
                  min={3}
                  max={5}
                  onInput={(e) => {
                    const val = parseFloat(e.currentTarget.value);
                    if (!isNaN(val)) setVehicleInputs('desiredRideFrequency', Math.min(5, Math.max(3, val)));
                  }}
                  class="w-14 px-2 py-0.5 bg-slate-900/50 border border-slate-700/50 rounded text-cyan-400 text-sm text-center focus:outline-none focus:text-emerald-400"
                />
              </div>
            </td>
          </tr>

          {/* Roll Gradient - Slider */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Roll gradient
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center gap-2 px-3 py-1.5">
                <span class="text-slate-600 text-xs w-6">.02</span>
                <div class="flex-1 relative h-5 flex items-center">
                  <div class="absolute inset-x-0 h-1 bg-slate-700 rounded-full">
                    <div
                      class="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                      style={{ width: `${getSliderFill(vehicleInputs.desiredRollGradient, 0.02, 0.7)}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.7}
                    step={0.01}
                    value={vehicleInputs.desiredRollGradient}
                    onInput={(e) => setVehicleInputs('desiredRollGradient', parseFloat(e.currentTarget.value))}
                    class="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    class="absolute w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/30 pointer-events-none border border-cyan-300"
                    style={{ left: `calc(${getSliderFill(vehicleInputs.desiredRollGradient, 0.02, 0.7)}% - 5px)` }}
                  />
                </div>
                <span class="text-slate-600 text-xs w-6">.7</span>
                <input
                  type="number"
                  value={vehicleInputs.desiredRollGradient}
                  step={0.01}
                  min={0.02}
                  max={0.7}
                  onInput={(e) => {
                    const val = parseFloat(e.currentTarget.value);
                    if (!isNaN(val)) setVehicleInputs('desiredRollGradient', Math.min(0.7, Math.max(0.02, val)));
                  }}
                  class="w-14 px-2 py-0.5 bg-slate-900/50 border border-slate-700/50 rounded text-cyan-400 text-sm text-center focus:outline-none focus:text-emerald-400"
                />
              </div>
            </td>
          </tr>

          {/* Wheel Diameter - Segmented */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Wheel diameter
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center px-2 py-1.5">
                <div class="flex gap-0.5">
                  <For each={[...WHEEL_DIAMETER_OPTIONS]}>
                    {(size) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs('wheelDiameter', size)}
                        class="px-2 py-1 text-xs transition-all duration-100"
                        classList={{
                          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50': vehicleInputs.wheelDiameter === size,
                          'bg-slate-900/50 text-slate-500 border border-slate-700/50 hover:text-slate-300': vehicleInputs.wheelDiameter !== size,
                        }}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                </div>
                <span class="px-2 text-slate-500 text-xs">in</span>
              </div>
            </td>
          </tr>

          {/* Profile */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Profile
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.profile}
                  step={1}
                  onInput={(e) => setVehicleInputs('profile', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">%</span>
              </div>
            </td>
          </tr>

          {/* Tire Width */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Tire width
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.tireWidth}
                  step={5}
                  onInput={(e) => setVehicleInputs('tireWidth', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">mm</span>
              </div>
            </td>
          </tr>

          {/* CoG Height */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              CoG height
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.cogHeight}
                  step={0.1}
                  onInput={(e) => setVehicleInputs('cogHeight', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">in</span>
              </div>
            </td>
          </tr>

          {/* 0-100 km/h */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              0-100 km/h
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.acceleration0to100}
                  step={0.1}
                  onInput={(e) => setVehicleInputs('acceleration0to100', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">s</span>
              </div>
            </td>
          </tr>

          {/* Max Speed @ 118m radius */}
          <tr>
            <td class="border-r border-b border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Max speed @ 118m
            </td>
            <td class="border-b border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.maxSpeed118mRadius}
                  step={1}
                  onInput={(e) => setVehicleInputs('maxSpeed118mRadius', parseFloat(e.currentTarget.value) || 0)}
                  class="flex-1 px-3 py-2 bg-transparent text-cyan-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-slate-500 text-xs">km/h</span>
              </div>
            </td>
          </tr>

          {/* Drivetrain - Segmented */}
          <tr>
            <td class="border-r border-slate-800/50 px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
              Drivetrain
            </td>
            <td class="border-slate-800/50 p-0 bg-slate-800/40">
              <div class="flex items-center px-2 py-1.5">
                <div class="flex gap-0.5">
                  <For each={[...DRIVETRAIN_OPTIONS]}>
                    {(option) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs('drivetrain', option)}
                        class="px-3 py-1 text-xs transition-all duration-100"
                        classList={{
                          'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50': vehicleInputs.drivetrain === option,
                          'bg-slate-900/50 text-slate-500 border border-slate-700/50 hover:text-slate-300': vehicleInputs.drivetrain !== option,
                        }}
                      >
                        {option}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
