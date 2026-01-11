import { Component, createMemo, For, Show } from 'solid-js';
import { VisXYContainer, VisLine, VisAxis } from '@unovis/solid';
import { CurveType } from '@unovis/ts';
import type { SpeedRpmPoint } from '../../types';
import { GEAR_COLORS } from '../../constants/colors';

interface GearSpeedChartProps {
  /** Speed/RPM data for each gear: speedRpmData[gearIndex][rpmIndex] */
  speedRpmData: SpeedRpmPoint[][];
  /** Active gear names */
  gearNames: string[];
  /** Redline RPM for horizontal limit line and shift point calculation */
  redlineRpm?: number;
  /** Chart height in pixels */
  height?: number;
  /** Show compact version (no legend, smaller margins) */
  compact?: boolean;
}

interface GearDataPoint {
  speed: number;
  rpm: number;
}

export const GearSpeedChart: Component<GearSpeedChartProps> = (props) => {
  
  // Calculate max speed from all gears for the redline
  const maxSpeed = createMemo(() => {
    let max = 0;
    for (const gearData of props.speedRpmData) {
      for (const point of gearData) {
        if (point.speed > max) max = point.speed;
      }
    }
    return Math.ceil(max / 10) * 10; // Round up to nearest 10
  });

  // Calculate shift speeds for each gear
  // Shift speed for gear N = speed at which gear N-1 hits redline
  const shiftSpeeds = createMemo((): number[] => {
    if (!props.redlineRpm || !props.speedRpmData.length) return [];

    const speeds: number[] = [0]; // 1st gear starts from 0

    for (let gearIdx = 0; gearIdx < props.speedRpmData.length - 1; gearIdx++) {
      const gearData = props.speedRpmData[gearIdx];
      if (!gearData || gearData.length === 0) {
        speeds.push(0);
        continue;
      }

      // Find the speed at redline RPM for this gear
      // Look for the point closest to redline RPM
      let closestPoint: SpeedRpmPoint | null = null;
      let minDiff = Infinity;

      for (const point of gearData) {
        const diff = Math.abs(point.rpm - props.redlineRpm!);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = point;
        }
      }

      // If we found a point at/near redline, use its speed as the shift point for next gear
      if (closestPoint) {
        speeds.push(closestPoint.speed);
      } else {
        // Fallback: use max speed of this gear
        const maxSpeedInGear = Math.max(...gearData.map(p => p.speed));
        speeds.push(maxSpeedInGear);
      }
    }

    return speeds;
  });

  // Create separate data arrays for each gear line, filtered by shift points
  // X = speed, Y = rpm
  const gearDataArrays = createMemo((): GearDataPoint[][] => {
    if (!props.speedRpmData.length) return [];

    const shifts = shiftSpeeds();

    return props.speedRpmData.map((gearData, gearIdx) => {
      const shiftSpeed = shifts[gearIdx] ?? 0;

      // Filter to only include points at or after the shift speed
      return gearData
        .filter((point) => point.speed >= shiftSpeed)
        .map((point) => ({
          speed: point.speed,
          rpm: point.rpm,
        }));
    });
  });

  // Redline data - horizontal line across the full speed range
  const redlineData = createMemo((): GearDataPoint[] => {
    if (!props.redlineRpm) return [];
    return [
      { speed: 0, rpm: props.redlineRpm },
      { speed: maxSpeed(), rpm: props.redlineRpm },
    ];
  });

  const xAccessor = (d: GearDataPoint) => d.speed;
  const yAccessor = (d: GearDataPoint) => d.rpm;

  return (
    <div
      class="w-full gear-chart"
      style={{ height: `${props.height ?? 300}px` }}
    >
      <Show when={gearDataArrays().length > 0}>
        <VisXYContainer height={props.height ?? 300}>
          {/* Render each gear as a separate line */}
          <For each={gearDataArrays()}>
            {(gearData, idx) => (
              <Show when={gearData.length > 0}>
                <VisLine
                  data={gearData}
                  x={xAccessor}
                  y={yAccessor}
                  color={GEAR_COLORS[idx() % GEAR_COLORS.length]}
                  lineWidth={2}
                  curveType={CurveType.Linear}
                  duration={0}
                />
              </Show>
            )}
          </For>
          {/* Redline horizontal line */}
          <Show when={redlineData().length > 0}>
            <VisLine
              data={redlineData()}
              x={xAccessor}
              y={yAccessor}
              color="#ef4444"
              lineWidth={2}
              curveType={CurveType.Linear}
              duration={0}
            />
          </Show>
          <VisAxis
            type="x"
            label={props.compact ? undefined : "Speed (kph)"}
            gridLine={true}
            duration={0}
          />
          <VisAxis
            type="y"
            label={props.compact ? undefined : "RPM"}
            gridLine={true}
            duration={0}
          />
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
                <span class="text-xs text-foreground-secondary">{name}</span>
              </div>
            )}
          </For>
          {/* Redline legend item */}
          <Show when={props.redlineRpm}>
            <div class="flex items-center gap-1.5">
              <span
                class="w-3 h-0.5"
                style={{ background: "#ef4444" }}
              />
              <span class="text-xs text-foreground-secondary">Redline ({props.redlineRpm} RPM)</span>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
