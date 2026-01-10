import { Component, createMemo, For, Show } from 'solid-js';
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip } from '@unovis/solid';
import { CurveType } from '@unovis/ts';
import type { SpeedRpmPoint } from '../../types';
import { GEAR_COLORS } from '../../constants/colors';

interface GearSpeedChartProps {
  /** Speed/RPM data for each gear: speedRpmData[gearIndex][rpmIndex] */
  speedRpmData: SpeedRpmPoint[][];
  /** Active gear names */
  gearNames: string[];
  /** Chart height in pixels */
  height?: number;
  /** Show compact version (no legend, smaller margins) */
  compact?: boolean;
}

interface ChartDataPoint {
  rpm: number;
  [key: string]: number;
}

export const GearSpeedChart: Component<GearSpeedChartProps> = (props) => {
  
  const chartData = createMemo((): ChartDataPoint[] => {
    if (!props.speedRpmData.length || !props.speedRpmData[0]?.length) return [];

    const data: ChartDataPoint[] = [];
    const rpmPoints = props.speedRpmData[0];

    for (let rpmIdx = 0; rpmIdx < rpmPoints.length; rpmIdx++) {
      const point: ChartDataPoint = { rpm: rpmPoints[rpmIdx].rpm };

      for (let gearIdx = 0; gearIdx < props.speedRpmData.length; gearIdx++) {
        const gearData = props.speedRpmData[gearIdx];
        if (gearData && gearData[rpmIdx]) {
          point[`gear${gearIdx}`] = gearData[rpmIdx].speed;
        }
      }

      data.push(point);
    }

    return data;
  });

  
  const xAccessor = (d: ChartDataPoint) => d.rpm;

  
  const yAccessors = createMemo(() => {
    return props.speedRpmData.map((_, gearIdx) => 
      (d: ChartDataPoint) => d[`gear${gearIdx}`] as number
    );
  });

  
  const lineColors = createMemo(() => {
    return props.speedRpmData.map((_, idx) => GEAR_COLORS[idx % GEAR_COLORS.length]);
  });

  
  const tooltipTemplate = (d: ChartDataPoint) => {
    // Build entries with values and sort by value descending (to match visual order top to bottom)
    const entries = props.gearNames
      .map((name, idx) => {
        const speed = d[`gear${idx}`];
        if (speed === undefined || speed === null) return null;
        const color = GEAR_COLORS[idx % GEAR_COLORS.length];
        return { name, speed, color };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.speed - a.speed);

    const lines = entries
      .map(({ name, speed, color }) => `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></span>
          <span style="color: #94a3b8;">${name}:</span>
          <span style="color: ${color}; font-weight: 500;">${speed.toFixed(1)} kph</span>
        </div>
      `)
      .join('');

    return `
      <div style="color: #f8fafc; font-weight: 600; margin-bottom: 6px;">${d.rpm} RPM</div>
      ${lines}
    `;
  };

  return (
    <div
      class="w-full gear-chart"
      style={{ height: `${props.height ?? 300}px` }}
    >
      <Show when={chartData().length > 0 && yAccessors().length > 0}>
        <VisXYContainer data={chartData()} height={props.height ?? 300}>
          <VisLine
            x={xAccessor}
            y={yAccessors()}
            color={lineColors()}
            lineWidth={2}
            curveType={CurveType.Linear}
          />
          <VisAxis
            type="x"
            label={props.compact ? undefined : "RPM"}
            gridLine={true}
          />
          <VisAxis
            type="y"
            label={props.compact ? undefined : "Speed (kph)"}
            gridLine={true}
          />
          <VisCrosshair template={tooltipTemplate} color={lineColors()} />
          <VisTooltip />
        </VisXYContainer>
      </Show>

      {/* Legend */}
      <Show when={!props.compact && props.gearNames.length > 0}>
        <div class="flex flex-wrap justify-center gap-4 mt-3 px-4">
          <For each={props.gearNames}>
            {(name, idx) => (
              <div class="flex items-center gap-1.5">
                <span
                  class="w-3 h-3 rounded-full"
                  style={{ background: GEAR_COLORS[idx() % GEAR_COLORS.length] }}
                />
                <span class="text-xs text-neutral-400">{name}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
