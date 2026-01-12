import { Component, createMemo } from 'solid-js';
import { VisXYContainer, VisLine, VisAxis, VisArea, VisCrosshair, VisTooltip } from '@unovis/solid';
import { CurveType } from '@unovis/ts';
import type { AeroSpeedDataPoint } from '../../../types';
import { theme } from "../../shared/store/theme";

interface AeroChartProps {
  speedData: AeroSpeedDataPoint[];
  maxSpeedKmh: number;
  height?: number;
}

interface ChartDataPoint {
  speed: number;
  frontDownforce: number;
  rearDownforce: number;
  totalDownforce: number;
  dragForce: number;
}

// SCADA-style neutral colors - theme reactive
const getChartColors = (currentTheme: string) => ({
  front: currentTheme === 'dark' ? '#a3a3a3' : '#525252',      // neutral-400 / neutral-600
  rear: currentTheme === 'dark' ? '#737373' : '#404040',       // neutral-500 / neutral-700  
  total: currentTheme === 'dark' ? '#fafafa' : '#171717',      // foreground
  drag: currentTheme === 'dark' ? '#f59e0b' : '#d97706',       // amber-500 / amber-600
});

export function AeroChart(props: AeroChartProps) {
  const colors = createMemo(() => getChartColors(theme()));

  const chartData = createMemo((): ChartDataPoint[] => {
    return props.speedData.map((d) => ({
      speed: d.speed,
      frontDownforce: d.frontDownforce,
      rearDownforce: d.rearDownforce,
      totalDownforce: d.totalDownforce,
      dragForce: d.dragForce,
    }));
  });

  const xAccessor = (d: ChartDataPoint) => d.speed;
  const frontAccessor = (d: ChartDataPoint) => d.frontDownforce;
  const rearAccessor = (d: ChartDataPoint) => d.rearDownforce;
  const totalAccessor = (d: ChartDataPoint) => d.totalDownforce;
  const dragAccessor = (d: ChartDataPoint) => d.dragForce;

  const tooltipTemplate = (d: ChartDataPoint) => `
    <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: 8px; font-family: monospace; font-size: 11px;">
      <div style="color: var(--color-foreground); font-weight: 600; margin-bottom: 4px;">${d.speed} km/h</div>
      <div style="color: ${colors().total};">Total: ${d.totalDownforce.toFixed(0)} N</div>
      <div style="color: ${colors().front};">Front: ${d.frontDownforce.toFixed(0)} N</div>
      <div style="color: ${colors().rear};">Rear: ${d.rearDownforce.toFixed(0)} N</div>
      <div style="color: ${colors().drag};">Drag: ${d.dragForce.toFixed(0)} N</div>
    </div>
  `;

  return (
    <div class="w-full aero-chart" style={{ height: `${props.height ?? 320}px` }}>
      <VisXYContainer height={props.height ?? 320}>
        <VisLine
          data={chartData()}
          x={xAccessor}
          y={dragAccessor}
          color={colors().drag}
          lineWidth={2}
          curveType={CurveType.Linear}
          duration={0}
        />
        <VisArea
          data={chartData()}
          x={xAccessor}
          y={frontAccessor}
          color={colors().front}
          opacity={0.3}
          curveType={CurveType.Linear}
          duration={0}
        />
        <VisLine
          data={chartData()}
          x={xAccessor}
          y={frontAccessor}
          color={colors().front}
          lineWidth={2}
          curveType={CurveType.Linear}
          duration={0}
        />
        <VisArea
          data={chartData()}
          x={xAccessor}
          y={rearAccessor}
          color={colors().rear}
          opacity={0.3}
          curveType={CurveType.Linear}
          duration={0}
        />
        <VisLine
          data={chartData()}
          x={xAccessor}
          y={rearAccessor}
          color={colors().rear}
          lineWidth={2}
          curveType={CurveType.Linear}
          duration={0}
        />
        <VisLine
          data={chartData()}
          x={xAccessor}
          y={totalAccessor}
          color={colors().total}
          lineWidth={3}
          curveType={CurveType.Linear}
          duration={0}
        />
        <VisCrosshair
          template={tooltipTemplate}
        />
        <VisTooltip />
        <VisAxis
          type="x"
          label="Speed (km/h)"
          gridLine={true}
          duration={0}
          tickFormat={(d) => `${d}`}
        />
        <VisAxis
          type="y"
          label="Force (N)"
          gridLine={true}
          duration={0}
          tickFormat={(d) => `${d}`}
        />
      </VisXYContainer>
      <div class="flex flex-wrap justify-center gap-4 mt-3 px-4">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-0.5" style={{ background: colors().total }} />
          <span class="text-xs text-foreground-secondary">Total Downforce</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-0.5" style={{ background: colors().front }} />
          <span class="text-xs text-foreground-secondary">Front</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-0.5" style={{ background: colors().rear }} />
          <span class="text-xs text-foreground-secondary">Rear</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-0.5" style={{ background: colors().drag }} />
          <span class="text-xs text-foreground-secondary">Drag</span>
        </div>
      </div>
    </div>
  );
};
