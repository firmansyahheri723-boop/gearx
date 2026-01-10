import { Component, createMemo, For, Show } from "solid-js";
import {
  VisXYContainer,
  VisLine,
  VisScatter,
  VisAxis,
} from "@unovis/solid";
import { CurveType } from "@unovis/ts";
import type { SpeedRpmPoint } from "../../types";
import { GEAR_COLORS, TRACTION_LIMIT_COLOR, PEAK_TORQUE_CURVE_COLOR } from "../../constants/colors";

interface GearTorqueChartProps {
  /** Speed/RPM data for each gear: speedRpmData[gearIndex][rpmIndex] */
  speedRpmData: SpeedRpmPoint[][];
  /** Active gear names */
  gearNames: string[];
  /** Traction limit torque in Nm */
  tractionLimit: number;
  /** Peak HP RPM - used to draw the peak torque curve */
  peakHpRpm: number;
  /** Chart height in pixels */
  height?: number;
  /** Show compact version (no legend, smaller margins) */
  compact?: boolean;
}

interface GearDataPoint {
  speed: number;
  torque: number;
}

export const GearTorqueChart: Component<GearTorqueChartProps> = (props) => {
  // Create separate data arrays for each gear line
  const gearDataArrays = createMemo((): GearDataPoint[][] => {
    if (!props.speedRpmData.length) return [];

    return props.speedRpmData.map((gearData) =>
      gearData.map((point) => ({
        speed: point.speed,
        torque: point.wheelTorque,
      }))
    );
  });

  // Create traction limit line data spanning the full speed range
  const tractionLimitData = createMemo((): GearDataPoint[] => {
    if (!props.speedRpmData.length) return [];

    let minSpeed = Infinity;
    let maxSpeed = -Infinity;
    for (const gearData of props.speedRpmData) {
      for (const point of gearData) {
        if (point.speed < minSpeed) minSpeed = point.speed;
        if (point.speed > maxSpeed) maxSpeed = point.speed;
      }
    }

    return [
      { speed: minSpeed, torque: props.tractionLimit },
      { speed: maxSpeed, torque: props.tractionLimit },
    ];
  });

  // Create peak torque curve data - points at peak HP RPM for each gear
  const peakTorqueData = createMemo((): GearDataPoint[] => {
    if (!props.speedRpmData.length || !props.peakHpRpm) return [];

    const peakPoints: GearDataPoint[] = [];

    for (const gearData of props.speedRpmData) {
      let closestPoint: SpeedRpmPoint | null = null;
      let minRpmDiff = Infinity;

      for (const point of gearData) {
        const rpmDiff = Math.abs(point.rpm - props.peakHpRpm);
        if (rpmDiff < minRpmDiff) {
          minRpmDiff = rpmDiff;
          closestPoint = point;
        }
      }

      if (closestPoint) {
        peakPoints.push({
          speed: closestPoint.speed,
          torque: closestPoint.wheelTorque,
        });
      }
    }

    return peakPoints.sort((a, b) => a.speed - b.speed);
  });

  const xAccessor = (d: GearDataPoint) => d.speed;
  const yAccessor = (d: GearDataPoint) => d.torque;

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
              <VisLine
                data={gearData}
                x={xAccessor}
                y={yAccessor}
                color={GEAR_COLORS[idx() % GEAR_COLORS.length]}
                lineWidth={2}
                curveType={CurveType.Linear}
                duration={0}
              />
            )}
          </For>
          {/* Traction limit line */}
          <VisLine
            data={tractionLimitData()}
            x={xAccessor}
            y={yAccessor}
            color={TRACTION_LIMIT_COLOR}
            lineWidth={2}
            duration={0}
          />
          {/* Peak torque curve */}
          <Show when={peakTorqueData().length > 0}>
            <VisLine
              data={peakTorqueData()}
              x={xAccessor}
              y={yAccessor}
              color={PEAK_TORQUE_CURVE_COLOR}
              lineWidth={2}
              curveType={CurveType.Linear}
              duration={0}
            />
            <VisScatter
              data={peakTorqueData()}
              x={xAccessor}
              y={yAccessor}
              color={PEAK_TORQUE_CURVE_COLOR}
              size={6}
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
            label={props.compact ? undefined : "Wheel Torque (Nm)"}
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
                  style={{
                    background: GEAR_COLORS[idx() % GEAR_COLORS.length],
                  }}
                />
                <span class="text-xs text-neutral-400">{name}</span>
              </div>
            )}
          </For>
          <div class="flex items-center gap-1.5">
            <span
              class="w-3 h-0.5"
              style={{ background: TRACTION_LIMIT_COLOR }}
            />
            <span class="text-xs text-neutral-400">Traction Limit</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="w-3 h-0.5"
              style={{ background: PEAK_TORQUE_CURVE_COLOR }}
            />
            <span class="text-xs text-neutral-400">Peak Power</span>
          </div>
        </div>
      </Show>
    </div>
  );
};
