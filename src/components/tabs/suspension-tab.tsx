import { For, createMemo } from 'solid-js';
import { SectionHeader } from '../ui/section-header';
import { DataTable } from '../ui/data-table';
import { SuspensionOutput } from '../suspension-output';
import { vehicleInputs } from '../../stores/vehicle';
import { calculateSuspensionOutputs } from '../../utils/suspension';

import { SuspensionParametersSection } from './suspension/suspension-parameters-section';
import { SpringsStiffnessSection } from './suspension/springs-stiffness-section';
import { AntiRollBarsSection } from './suspension/anti-roll-bars-section';
import { DampersSection } from './suspension/dampers-section';
import { AccelerationMetricsSection } from './suspension/acceleration-metrics-section';
import { FormulaReferenceSection } from './suspension/formula-reference-section';

export function SuspensionTab() {
  const cogHeightM = () => vehicleInputs.cogHeight * 0.0254;

  const outputs = createMemo(() =>
    calculateSuspensionOutputs({
      weight: vehicleInputs.weight,
      frontWeightDistribution: vehicleInputs.frontWeightDistribution,
      wheelWeight: vehicleInputs.wheelWeight,
      rideFrequency: vehicleInputs.desiredRideFrequency,
      dampingRatio: vehicleInputs.dampingRatio,
      acceleration0to100: vehicleInputs.acceleration0to100,
      maxSpeed118mRadius: vehicleInputs.maxSpeed118mRadius,
      cogHeight: cogHeightM(),
      wheelbase: vehicleInputs.wheelbase,
      frontTrackWidth: vehicleInputs.frontTrackWidth,
      rearTrackWidth: vehicleInputs.rearTrackWidth,
      desiredRollGradient: vehicleInputs.desiredRollGradient,
      magicNumber: vehicleInputs.magicNumber,
      tireRate: vehicleInputs.tireRate,
      rollCenterHeight: vehicleInputs.rollCenterHeight,
    })
  );

  return (
    <div class="space-y-4">
      <SuspensionOutput outputs={outputs()} />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SuspensionParametersSection />
        <SpringsStiffnessSection outputs={outputs()} />
        <AntiRollBarsSection outputs={outputs()} />
      </div>

      <DampersSection outputs={outputs()} />
      <AccelerationMetricsSection outputs={outputs()} frontWeightDistribution={vehicleInputs.frontWeightDistribution} />
      <FormulaReferenceSection />
    </div>
  );
}
