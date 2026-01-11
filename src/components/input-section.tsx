import { Component } from "solid-js";
import { BasicVehicleSection } from "./basic-vehicle-section";
import { DrivetrainSection } from "./drivetrain-section";

export const InputSection: Component = () => {
  return (
    <div class="space-y-4">
      <BasicVehicleSection />
      <DrivetrainSection />
    </div>
  );
};
