import { Component, createMemo } from "solid-js";
import { vehicleInputs } from "../../stores/vehicle";

type DrivetrainVizProps = {
  class?: string;
};

export function DrivetrainViz(props: DrivetrainVizProps) {
  const hasFront = () =>
    vehicleInputs.drivetrain === "FWD" || vehicleInputs.drivetrain === "AWD";
  const hasRear = () =>
    vehicleInputs.drivetrain === "RWD" || vehicleInputs.drivetrain === "AWD";

  // Tire dimensions based on inputs
  // Width: 265mm base -> 22px, scale by 0.08px per mm difference
  // Height (diameter): 16" base -> 28px, scale by 1.5px per inch difference
  const frontTireWidth = createMemo(
    () => 22 + (vehicleInputs.frontWheel.width - 265) * 0.08,
  );
  const frontTireHeight = createMemo(
    () => 28 + (vehicleInputs.frontWheel.diameter - 16) * 1.5,
  );
  const rearTireWidth = createMemo(
    () => 22 + (vehicleInputs.rearWheel.width - 265) * 0.08,
  );
  const rearTireHeight = createMemo(
    () => 28 + (vehicleInputs.rearWheel.diameter - 16) * 1.5,
  );

  const wheelStyle = (filled: boolean, width: number, height: number) => ({
    width: `${width}px`,
    height: `${height}px`,
    border: "2px solid var(--text-secondary)",
    background: filled ? "var(--text-secondary)" : "var(--bg-primary)",
  });

  // Fixed axle positions (center of axle line)
  const FRONT_AXLE_Y = 30;
  const REAR_AXLE_Y = 120;

  return (
    <div class={`relative w-28 h-36 ${props.class ?? ""}`}>
      {/* Front left tire - centered on axle */}
      <div
        class="absolute left-1 z-10"
        style={{
          top: `${FRONT_AXLE_Y - frontTireHeight() / 2}px`,
          ...wheelStyle(hasFront(), frontTireWidth(), frontTireHeight()),
        }}
      />
      {/* Front right tire - centered on axle */}
      <div
        class="absolute right-1 z-10"
        style={{
          top: `${FRONT_AXLE_Y - frontTireHeight() / 2}px`,
          ...wheelStyle(hasFront(), frontTireWidth(), frontTireHeight()),
        }}
      />
      {/* Front axle line */}
      <div
        class="absolute left-1/2 -translate-x-1/2 h-2 bg-muted"
        style={{ top: `${FRONT_AXLE_Y}px`, width: "calc(100% - 20px)" }}
      />

      {/* Driveshaft */}
      <div
        class="absolute left-1/2 -translate-x-1/2 w-2 bg-muted"
        style={{
          top: `${FRONT_AXLE_Y}px`,
          height: `${REAR_AXLE_Y - FRONT_AXLE_Y}px`,
        }}
      />

      {/* Rear left tire - centered on axle */}
      <div
        class="absolute left-1 z-10"
        style={{
          top: `${REAR_AXLE_Y - rearTireHeight() / 2}px`,
          ...wheelStyle(hasRear(), rearTireWidth(), rearTireHeight()),
        }}
      />
      {/* Rear right tire - centered on axle */}
      <div
        class="absolute right-1 z-10"
        style={{
          top: `${REAR_AXLE_Y - rearTireHeight() / 2}px`,
          ...wheelStyle(hasRear(), rearTireWidth(), rearTireHeight()),
        }}
      />
      {/* Rear axle line */}
      <div
        class="absolute left-1/2 -translate-x-1/2 h-2 bg-muted"
        style={{ top: `${REAR_AXLE_Y}px`, width: "calc(100% - 20px)" }}
      />
    </div>
  );
};
