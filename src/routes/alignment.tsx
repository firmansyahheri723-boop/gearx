import { createFileRoute } from '@tanstack/solid-router';
import { createMemo } from 'solid-js';
import { alignmentInputs } from '@/features/alignment/store';
import { calculateAlignmentOutputs } from '@/features/alignment/utils/alignment';

import { AlignmentInputsSection } from '@/features/alignment/components/alignment-inputs-section';
import { AlignmentOutputsSection } from '@/features/alignment/components/alignment-outputs-section';
import { CamberOptimizationSection } from '@/features/alignment/components/camber-optimization-section';
import { AckermannVizSection } from '@/features/alignment/components/ackermann-viz-section';
import { AlignmentFormulaReferenceSection } from '@/features/alignment/components/alignment-formula-reference-section';

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
