import { createFileRoute } from '@tanstack/solid-router';
import { For, createMemo } from 'solid-js';
import { SectionHeader } from '../components/ui/section-header';
import { DataTable } from '../components/ui/data-table';
import { SuspensionOutput } from '../features/suspension/components/suspension-output';
import { vehicleInputs } from '../stores/vehicle';
import { aeroSettings, aeroExperimentalEnabled } from '../features/aero/store';
import { calculateSuspensionOutputs } from '../features/suspension/utils/suspension';
import { getSelectedCar } from '../features/database/store';
import { calculateExperimentalAero } from '../features/aero/utils/aero';
import type { AeroExperimentalOutput } from '../types';

import { SuspensionParametersSection } from '../features/suspension/components/suspension-parameters-section';
import { SpringsStiffnessSection } from '../features/suspension/components/springs-stiffness-section';
import { AntiRollBarsSection } from '../features/suspension/components/anti-roll-bars-section';
import { DampersSection } from '../features/suspension/components/dampers-section';
import { AccelerationMetricsSection } from '../features/suspension/components/acceleration-metrics-section';
import { FormulaReferenceSection } from '../features/suspension/components/formula-reference-section';

export const Route = createFileRoute('/suspension')({
  component: Suspension,
});

function Suspension() {
  const cogHeightM = () => vehicleInputs.cogHeight * 0.0254;

  const aeroData = createMemo((): AeroExperimentalOutput | null => {
    if (!aeroExperimentalEnabled.value) return null;
    const carData = getSelectedCar();
    return calculateExperimentalAero(aeroSettings, carData, 200);
  });

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
      ...(aeroData() && {
        aeroFrontDownforceN: aeroData()!.frontDownforceN,
        aeroRearDownforceN: aeroData()!.rearDownforceN,
      }),
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
