import { createFileRoute } from '@tanstack/solid-router';
import { createMemo } from 'solid-js';
import { alignmentInputs } from '../stores/vehicle';
import { calculateAlignmentOutputs } from '../utils/alignment';

import { AlignmentInputsSection } from '../components/tabs/alignment/alignment-inputs-section';
import { AlignmentOutputsSection } from '../components/tabs/alignment/alignment-outputs-section';
import { CamberOptimizationSection } from '../components/tabs/alignment/camber-optimization-section';
import { AckermannVizSection } from '../components/tabs/alignment/ackermann-viz-section';
import { AlignmentFormulaReferenceSection } from '../components/tabs/alignment/alignment-formula-reference-section';

export const Route = createFileRoute('/alignment')({
  component: Alignment,
});

function Alignment() {
  const outputs = createMemo(() =>
    calculateAlignmentOutputs({
      frontCamber: alignmentInputs.frontCamber,
      frontCaster: alignmentInputs.frontCaster,
      frontToe: alignmentInputs.frontToe,
      frontAckermann: alignmentInputs.frontAckermann,
      frontSteeringSensitivity: alignmentInputs.frontSteeringSensitivity,
      rearCamber: alignmentInputs.rearCamber,
      rearToe: alignmentInputs.rearToe,
      maxSteeringAngle: alignmentInputs.maxSteeringAngle,
    })
  );

  return (
    <div class="space-y-4">
      <AlignmentInputsSection />
      
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlignmentOutputsSection outputs={outputs()} />
        <CamberOptimizationSection outputs={outputs()} />
      </div>
      
      <AckermannVizSection outputs={outputs()} />
      <AlignmentFormulaReferenceSection />
    </div>
  );
}
