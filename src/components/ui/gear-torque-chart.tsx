import { Component, createMemo, For, Show } from "solid-js";
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisCrosshair,
  VisTooltip,
} from "@unovis/solid";
import { CurveType } from "@unovis/ts";
import type { SpeedRpmPoint } from "../../types";
import { GEAR_COLORS, TRACTION_LIMIT_COLOR } from "../../constants/colors";

interface GearTorqueChartProps {
  /** Speed/RPM data for each gear: speedRpmData[gearIndex][rpmIndex] */
  speedRpmData: SpeedRpmPoint[][];
  /** Active gear names */
  gearNames: string[];
  /** Traction limit torque in Nm */
  tractionLimit: number;
  /** Chart height in pixels */
  height?: number;
  /** Show compact version (no legend, smaller margins) */
  compact?: boolean;
}

interface ChartDataPoint {
  rpm: number;
  tractionLimit: number;
  [key: string]: number;
}

export const GearTorqueChart: Component<GearTorqueChartProps> = (props) => {
  // Transform speedRpmData into format suitable for multi-line chart
  const chartData = createMemo((): ChartDataPoint[] => {
    if (!props.speedRpmData.length || !props.speedRpmData[0]?.length) return [];

    const data: ChartDataPoint[] = [];
    const rpmPoints = props.speedRpmData[0];

    for (let rpmIdx = 0; rpmIdx < rpmPoints.length; rpmIdx++) {
      const point: ChartDataPoint = {
        rpm: rpmPoints[rpmIdx].rpm,
        tractionLimit: props.tractionLimit,
      };

      for (let gearIdx = 0; gearIdx < props.speedRpmData.length; gearIdx++) {
        const gearData = props.speedRpmData[gearIdx];
        if (gearData && gearData[rpmIdx]) {
          point[`gear${gearIdx}`] = gearData[rpmIdx].wheelTorque;
        }
      }

      data.push(point);
    }

    return data;
  });

  // X accessor
  const xAccessor = (d: ChartDataPoint) => d.rpm;

  // Y accessors as array - one for each gear
  const yAccessors = createMemo(() => {
    return props.speedRpmData.map(
      (_, gearIdx) => (d: ChartDataPoint) => d[`gear${gearIdx}`] as number,
    );
  });

  // Colors array for each gear line
  const lineColors = createMemo(() => {
    return props.speedRpmData.map(
      (_, idx) => GEAR_COLORS[idx % GEAR_COLORS.length],
    );
  });

  // Traction limit accessor (horizontal line)
  const tractionLimitAccessor = (d: ChartDataPoint) => d.tractionLimit;

  // Tooltip template
  const tooltipTemplate = (d: ChartDataPoint) => {
    // Build entries with values and sort by value descending (to match visual order top to bottom)
    const entries = props.gearNames
      .map((name, idx) => {
        const torque = d[`gear${idx}`];
        if (torque === undefined || torque === null) return null;
        const color = GEAR_COLORS[idx % GEAR_COLORS.length];
        const exceedsTraction = torque > props.tractionLimit;
        return { name, torque, color, exceedsTraction };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => b.torque - a.torque);

    const lines = entries
      .map(({ name, torque, color, exceedsTraction }) => {
        const textColor = exceedsTraction ? "#f87171" : color;
        return `
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></span>
            <span style="color: #94a3b8;">${name}:</span>
            <span style="color: ${textColor}; font-weight: 500;">
              ${torque.toFixed(0)} Nm${exceedsTraction ? " (spin)" : ""}
            </span>
          </div>
        `;
      })
      .join("");

    return `
      <div style="color: #f8fafc; font-weight: 600; margin-bottom: 6px;">${d.rpm} RPM</div>
      ${lines}
      <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px; padding-top: 4px; border-top: 1px solid #334155;">
        <span style="width: 8px; height: 2px; background: ${TRACTION_LIMIT_COLOR};"></span>
        <span style="color: #94a3b8;">Limit:</span>
        <span style="color: ${TRACTION_LIMIT_COLOR}; font-weight: 500;">${props.tractionLimit.toFixed(0)} Nm</span>
      </div>
    `;
  };

  return (
    <div
      class="w-full gear-chart"
      style={{ height: `${props.height ?? 300}px` }}
    >
      <Show when={chartData().length > 0 && yAccessors().length > 0}>
        <VisXYContainer data={chartData()} height={props.height ?? 300}>
          {/* Gear torque lines */}
          <VisLine
            x={xAccessor}
            y={yAccessors()}
            color={lineColors()}
            lineWidth={2}
            curveType={CurveType.Linear}
          />
          {/* Traction limit line */}
          <VisLine
            x={xAccessor}
            y={tractionLimitAccessor}
            color={TRACTION_LIMIT_COLOR}
            lineWidth={2}
          />
          <VisAxis
            type="x"
            label={props.compact ? undefined : "RPM"}
            gridLine={true}
          />
          <VisAxis
            type="y"
            label={props.compact ? undefined : "Wheel Torque (Nm)"}
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
                  style={{
                    background: GEAR_COLORS[idx() % GEAR_COLORS.length],
                  }}
                />
                <span class="text-xs text-slate-400">{name}</span>
              </div>
            )}
          </For>
          {/* Traction limit legend item */}
          <div class="flex items-center gap-1.5">
            <span
              class="w-3 h-0.5"
              style={{ background: TRACTION_LIMIT_COLOR }}
            />
            <span class="text-xs text-slate-400">Traction Limit</span>
          </div>
        </div>
      </Show>
    </div>
  );
};
