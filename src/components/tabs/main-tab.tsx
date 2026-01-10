import type { Component } from 'solid-js';
import { InputSection } from '../input-section';
import { SuspensionOutput } from '../suspension-output';
import { TransmissionSection } from '../transmission-section';

export const MainTab: Component = () => {
  return (
    <>
      {/* Main Grid */}
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <InputSection />
        <SuspensionOutput />
      </div>

      <TransmissionSection />
    </>
  );
};
