import type { Component } from 'solid-js';
import type { ColumnDef } from '@tanstack/solid-table';
import { SectionHeader } from './ui/section-header';
import { DataTable } from './ui/data-table';
import {
  springsStiffness,
  dampers,
  antiRollBars,
  accelerationMetrics,
} from '../stores/vehicle';

// Types for table data
interface DamperRow {
  label: string;
  front: number;
  rear: number;
}

interface MetricRow {
  label: string;
  value: string;
}

// Column definitions for Dampers table
const damperColumns: ColumnDef<DamperRow>[] = [
  {
    accessorKey: 'label',
    header: 'Dampers',
    cell: (info) => (
      <span class="block px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
        {info.getValue() as string}
      </span>
    ),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'front',
    header: 'Front',
    cell: (info) => (
      <span class="block px-3 py-2 text-amber-400 bg-slate-900/30">
        {info.getValue() as number}
      </span>
    ),
  },
  {
    accessorKey: 'rear',
    header: 'Rear',
    cell: (info) => (
      <span class="block px-3 py-2 text-amber-400 bg-slate-900/30">
        {info.getValue() as number}
      </span>
    ),
  },
];

// Column definitions for Acceleration Metrics table
const metricColumns: ColumnDef<MetricRow>[] = [
  {
    accessorKey: 'label',
    header: 'Metric',
    cell: (info) => (
      <span class="block px-3 py-2 text-xs uppercase tracking-wide text-slate-400 bg-slate-900/50">
        {info.getValue() as string}
      </span>
    ),
    meta: { align: 'left' as const },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: (info) => (
      <span class="block px-3 py-2 text-amber-400 bg-slate-900/30">
        {info.getValue() as string}
      </span>
    ),
  },
];

export const SuspensionOutput: Component = () => {
  // Create reactive data for Dampers table
  const damperData = (): DamperRow[] => [
    { label: 'Bump', front: dampers.bump.front, rear: dampers.bump.rear },
    { label: 'Fast bump', front: dampers.fastBump.front, rear: dampers.fastBump.rear },
    { label: 'Rebound', front: dampers.rebound.front, rear: dampers.rebound.rear },
    { label: 'Fast rebound', front: dampers.fastRebound.front, rear: dampers.fastRebound.rear },
  ];

  // Create reactive data for Acceleration Metrics table
  const metricsData = (): MetricRow[] => [
    { label: 'Weight transfer on accel', value: `${accelerationMetrics.weightTransfer} kg` },
    { label: 'Front weight dist on accel', value: accelerationMetrics.frontWeightDistOnAccel },
    { label: 'Max longitudinal accel', value: `${accelerationMetrics.maxLongitudinalAccel} g` },
    { label: 'Max lateral accel', value: `${accelerationMetrics.maxLateralAccel} g` },
  ];

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

      {/* Dampers Table */}
      <DataTable
        data={damperData()}
        columns={damperColumns}
      />

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

      {/* Acceleration Metrics Table */}
      <div class="border-t border-slate-800/30">
        <DataTable
          data={metricsData()}
          columns={metricColumns}
        />
      </div>
    </div>
  );
};
