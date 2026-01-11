import { BasicVehicleSection } from "./basic-vehicle-section";
import { DrivetrainSection } from "./drivetrain-section";

export function InputSection() {
  return (
    <div class="space-y-4">
      <BasicVehicleSection />
      <DrivetrainSection />
    </div>
  );
}
