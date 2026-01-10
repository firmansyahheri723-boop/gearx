import type { Component } from 'solid-js';
import { InputSection } from '../input-section';
import { TransmissionSection } from '../transmission-section';

export const InputTab: Component = () => {
  return (
    <div class="space-y-4">
      <InputSection />
      <TransmissionSection />
    </div>
  );
};
