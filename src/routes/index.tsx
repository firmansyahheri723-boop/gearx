import { createFileRoute } from '@tanstack/solid-router';
import { InputSection } from '../components/input-section';
import { TransmissionSection } from '../components/transmission-section';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return (
    <div class="space-y-4">
      <InputSection />
      <TransmissionSection />
    </div>
  );
}
