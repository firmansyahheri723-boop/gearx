import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, For } from "solid-js";
import { calculateExperimentalAero } from "@/features/aero/aero";
import { aeroExperimentalEnabled, aeroSettings } from "@/features/aero/store";
import { getSelectedCar } from "@/features/database/store";
import { AccelerationMetricsSection } from "@/features/suspension/components/acceleration-metrics-section";
import { AntiRollBarsSection } from "@/features/suspension/components/anti-roll-bars-section";
import { DampersSection } from "@/features/suspension/components/dampers-section";
import { FormulaReferenceSection } from "@/features/suspension/components/formula-reference-section";
import { SpringsStiffnessSection } from "@/features/suspension/components/springs-stiffness-section";
import { SuspensionOutput } from "@/features/suspension/components/suspension-output";
import { SuspensionParametersSection } from "@/features/suspension/components/suspension-parameters-section";
import { calculateSuspensionOutputs } from "@/features/suspension/suspension";
import { vehicleInputs } from "@/features/suspension/store";
import type { AeroExperimentalOutput } from "@/types";

export const Route = createFileRoute("/suspension")({
	component: Suspension,
});

function Suspension() {
	const cogHeightM = () => vehicleInputs.cogHeight * 0.0254;

	const aeroData = createMemo((): AeroExperimentalOutput | null => {
		if (!aeroExperimentalEnabled()) return null;
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
		}),
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
			<AccelerationMetricsSection
				outputs={outputs()}
				frontWeightDistribution={vehicleInputs.frontWeightDistribution}
			/>
			<FormulaReferenceSection />
		</div>
	);
}
