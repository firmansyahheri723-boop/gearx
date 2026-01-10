import type { Component } from 'solid-js';
import { SectionHeader } from './ui/section-header';
import { OutputCell } from './ui/output-cell';
import { LabelCell } from './ui/label-cell';
import {
  springsStiffness,
  dampers,
  antiRollBars,
  accelerationMetrics,
} from '../stores/vehicle';

export const SuspensionOutput: Component = () => {
  return (
    <div class="border border-slate-800/50 bg-slate-950/50 overflow-hidden">
      <SectionHeader title="Suspension Output" variant="output" />

      {/* Springs Stiffness */}
      <div class="p-3 border-b border-slate-800/30">
        <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Springs Stiffness
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-900/50 border border-slate-800/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Front
            </div>
            <div class="text-2xl font-semibold text-amber-400">
              {springsStiffness.front}
              <span class="text-xs text-slate-500 ml-1">N/mm</span>
            </div>
          </div>
          <div class="bg-slate-900/50 border border-slate-800/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              Rear
            </div>
            <div class="text-2xl font-semibold text-amber-400">
              {springsStiffness.rear}
              <span class="text-xs text-slate-500 ml-1">N/mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dampers */}
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class="border-r border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-left">
                Dampers
              </th>
              <th class="border-r border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center">
                Front
              </th>
              <th class="border-b border-slate-800/50 bg-slate-900/50 px-3 py-2 text-slate-500 text-[10px] uppercase tracking-wider text-center">
                Rear
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <LabelCell>Bump</LabelCell>
              <OutputCell value={dampers.bump.front} />
              <OutputCell value={dampers.bump.rear} />
            </tr>
            <tr>
              <LabelCell>Fast bump</LabelCell>
              <OutputCell value={dampers.fastBump.front} />
              <OutputCell value={dampers.fastBump.rear} />
            </tr>
            <tr>
              <LabelCell>Rebound</LabelCell>
              <OutputCell value={dampers.rebound.front} />
              <OutputCell value={dampers.rebound.rear} />
            </tr>
            <tr>
              <LabelCell>Fast rebound</LabelCell>
              <OutputCell value={dampers.fastRebound.front} />
              <OutputCell value={dampers.fastRebound.rear} />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Anti-roll bars */}
      <div class="p-3 border-t border-slate-800/30">
        <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Anti-roll Bars
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-slate-900/50 border border-slate-800/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              FARB
            </div>
            <div class="text-xl font-semibold text-amber-400">
              {antiRollBars.farb}
              <span class="text-xs text-slate-500 ml-1">kNm</span>
            </div>
          </div>
          <div class="bg-slate-900/50 border border-slate-800/50 p-3">
            <div class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
              RARB
            </div>
            <div class="text-xl font-semibold text-amber-400">
              {antiRollBars.rarb}
              <span class="text-xs text-slate-500 ml-1">kNm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acceleration Metrics */}
      <div class="overflow-x-auto border-t border-slate-800/30">
        <table class="w-full border-collapse text-sm">
          <tbody>
            <tr>
              <LabelCell>Weight transfer on accel</LabelCell>
              <OutputCell value={`${accelerationMetrics.weightTransfer} kg`} />
            </tr>
            <tr>
              <LabelCell>Front weight dist on accel</LabelCell>
              <OutputCell value={accelerationMetrics.frontWeightDistOnAccel} />
            </tr>
            <tr>
              <LabelCell>Max longitudinal accel</LabelCell>
              <OutputCell value={`${accelerationMetrics.maxLongitudinalAccel} g`} />
            </tr>
            <tr>
              <LabelCell>Max lateral accel</LabelCell>
              <OutputCell value={`${accelerationMetrics.maxLateralAccel} g`} />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
