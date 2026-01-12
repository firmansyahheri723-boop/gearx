import { createFileRoute } from '@tanstack/solid-router';
import { TransmissionSection } from '@/features/suspension/components/transmission-section';
import { BasicVehicleSection } from '@/features/suspension/components/basic-vehicle-section';
import { DrivetrainSection } from '@/features/suspension/components/drivetrain-section';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div class="space-y-4">
      <BasicVehicleSection />
      <DrivetrainSection />
      <TransmissionSection />
    </div>
  );
}
