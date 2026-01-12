import {
	RadioGroupItem,
	RadioGroupItemControl,
	RadioGroupItemHiddenInput,
	RadioGroupItemText,
	RadioGroupRoot,
	type RadioGroupValueChangeDetails,
} from "@ark-ui/solid/radio-group";
import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, For } from "solid-js";
import { GearSpeedChart } from "@/components/ui/gear-speed-chart";
import { GearTorqueChart } from "@/components/ui/gear-torque-chart";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { GEAR_COLORS } from "@/constants/colors";
import { calculateExperimentalAero } from "@/features/aero/aero";
import { aeroExperimentalEnabled, aeroSettings } from "@/features/aero/store";
import { getSelectedCar } from "@/features/database/store";
import { calculateGearboxOutputs } from "@/features/gearbox/gearbox";
import {
	GEAR_LABELS,
	TIRE_OPTIONS,
	TRACTION_MODE_OPTIONS,
} from "@/features/gearbox/gearbox-constants";
import {
	finalDrive,
	gearRatios,
	torqueRpmData,
} from "@/features/gearbox/store";
import {
	setTireCompound,
	setTractionMode,
	tireCompound,
	tractionMode,
	vehicleInputs,
} from "@/features/suspension/store";
import type {
	AeroExperimentalOutput,
	GearboxOutputs,
	HelpLink,
	SpeedRpmPoint,
	TireCompound,
} from "@/types";

const HELP_CONTENT: Record<
	string,
	{ description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
	calculatedMetrics: {
		description:
			"Key performance metrics calculated from your engine and drivetrain setup. Peak HP shows maximum power output, traction limit is maximum torque the tires can handle before wheelspin, and final drive is the differential ratio that multiplies all gear ratios.",
		articles: [
			{
				label: "Wikipedia: Horsepower",
				url: "https://en.wikipedia.org/wiki/Horsepower",
			},
			{
				label: "Wikipedia: Final Drive",
				url: "https://en.wikipedia.org/wiki/Final_drive",
			},
		],
		videos: [
			{
				label: "Gear Ratios Guide",
				url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
			},
			{
				label: "Transmission Talk",
				url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
			},
		],
	},
	tireCompound: {
		description:
			"Select the tire compound to calculate traction limits. Higher friction coefficient (u) means more grip but also faster wear. Street tires are durable but have less grip, racing compounds offer maximum grip but wear quickly. This affects wheelspin calculations.",
		articles: [
			{ label: "Wikipedia: Tire", url: "https://en.wikipedia.org/wiki/Tire" },
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	effectiveDriveRatios: {
		description:
			"The effective gear ratio is each gear ratio multiplied by the final drive ratio. This determines the actual mechanical advantage at each gear. Lower gears have higher effective ratios for acceleration, while higher gears have lower ratios for top speed.",
		articles: [
			{
				label: "Wikipedia: Gear Ratio",
				url: "https://en.wikipedia.org/wiki/Gear_ratio",
			},
		],
		videos: [
			{
				label: "Gear Ratios Guide",
				url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
			},
			{
				label: "Transmission Talk",
				url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
			},
		],
	},
	speedVsRpm: {
		description:
			"Vehicle speed at each RPM point for all gears. Use this to identify optimal shift points and match gears to track requirements. Red cells indicate speeds where the engine would exceed traction limits. Higher gears reach higher speeds but at reduced acceleration.",
		articles: [
			{
				label: "Wikipedia: Gear Ratio",
				url: "https://en.wikipedia.org/wiki/Gear_ratio",
			},
		],
		videos: [
			{
				label: "Gear Ratios Guide",
				url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
			},
		],
	},
	wheelTorqueOutput: {
		description:
			"Torque delivered to the wheels at each RPM in each gear. Wheel torque determines acceleration capability. Red cells show RPM ranges where wheel torque exceeds traction limit, causing wheelspin. Peak HP row is highlighted - shifting near peak HP maximizes power delivery.",
		articles: [
			{
				label: "Wikipedia: Torque",
				url: "https://en.wikipedia.org/wiki/Torque",
			},
		],
		videos: [
			{
				label: "Gear Ratios Guide",
				url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
			},
			{
				label: "Transmission Talk",
				url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
			},
		],
	},
	tractionAnalysis: {
		description:
			"Per-gear breakdown of traction behavior. Shows what percentage of the RPM range exceeds traction limits (wheelspin zone). Lower gears typically have more wheelspin due to higher torque multiplication. Adjust final drive or tire compound to optimize traction.",
		articles: [
			{
				label: "Wikipedia: Traction",
				url: "https://en.wikipedia.org/wiki/Traction_(engineering)",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	speedRpmChart: {
		description:
			"Visual representation of vehicle speed at each RPM point across all gears. Each line represents a gear - use this to visualize speed overlap between gears and identify optimal shift points for your target speed range.",
		articles: [
			{
				label: "Wikipedia: Gear Ratio",
				url: "https://en.wikipedia.org/wiki/Gear_ratio",
			},
		],
	},
	wheelTorqueChart: {
		description:
			"Wheel torque output visualization showing torque delivered to wheels across the RPM range. The red dashed line indicates traction limit - any torque above this line will cause wheelspin. Lower gears produce higher torque but are more likely to exceed traction limits.",
		articles: [
			{
				label: "Wikipedia: Torque",
				url: "https://en.wikipedia.org/wiki/Torque",
			},
		],
	},
};

export const Route = createFileRoute("/gearbox")({
	component: Gearbox,
});

function Gearbox() {
	const aeroData = createMemo((): AeroExperimentalOutput | null => {
		if (!aeroExperimentalEnabled()) return null;
		const carData = getSelectedCar();
		return calculateExperimentalAero(aeroSettings, carData, 200);
	});

	const outputs = createMemo(() =>
		calculateGearboxOutputs({
			frontWheel: vehicleInputs.frontWheel,
			rearWheel: vehicleInputs.rearWheel,
			gearRatios: [...gearRatios],
			finalDrive: finalDrive.ratio,
			torqueRpmData: [...torqueRpmData],
			weight: vehicleInputs.weight,
			frontWeightDistribution: vehicleInputs.frontWeightDistribution,
			cogHeight: vehicleInputs.cogHeight,
			wheelbase: vehicleInputs.wheelbase,
			drivetrain: vehicleInputs.drivetrain,
			tireCompound: tireCompound.value,
			tractionMode: tractionMode.value,
			acceleration0to100: vehicleInputs.acceleration0to100,
			...(aeroData() && {
				aeroTractionMultiplier: 1 + aeroData()!.tractionLimitIncreasePct / 100,
			}),
		}),
	);

	const activeGears = createMemo(() => {
		const gears: { index: number; name: string; ratio: number }[] = [];
		for (let i = 0; i < gearRatios.length; i++) {
			const gear = gearRatios[i];
			if (gear.ratio > 0) {
				gears.push({ index: i, name: GEAR_LABELS[i], ratio: gear.ratio });
			}
		}
		return gears;
	});

	const chartSpeedRpmData = createMemo(() => {
		return activeGears()
			.map((gear) => outputs().speedRpmData[gear.index])
			.filter((data) => data && data.length > 0);
	});

	const chartGearNames = createMemo(() => {
		return activeGears()
			.filter((gear) => outputs().speedRpmData[gear.index]?.length > 0)
			.map((gear) => gear.name);
	});

	return (
		<div class="space-y-4">
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div class="lg:col-span-2 border border-border/50 bg-background/50">
					<SectionHeader
						title="Calculated Metrics"
						variant="output"
						help={{
							...HELP_CONTENT.calculatedMetrics,
							position: "bottom",
						}}
					/>
					<div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
						<MetricCard
							label="Peak HP"
							value={outputs().peakHp.toFixed(1)}
							unit="hp"
							highlight
						/>
						<MetricCard
							label="Peak HP @ RPM"
							value={outputs().peakHpRpm.toFixed(0)}
							unit="rpm"
						/>
						<MetricCard
							label="Wheel Circumference"
							value={outputs().wheelCircumference.toFixed(2)}
							unit="in"
						/>
						<MetricCard
							label="Wheel Radius"
							value={(outputs().wheelRadiusM * 100).toFixed(2)}
							unit="cm"
						/>
						<MetricCard
							label="Traction Limit"
							value={outputs().tractionLimitTorque.toFixed(0)}
							unit="Nm"
							highlight
							badge={aeroData() ? "Aero+" : undefined}
						/>
						<MetricCard
							label="Final Drive"
							value={finalDrive.ratio.toFixed(2)}
							unit="x"
						/>
						<MetricCard
							label="Top Speed (max gear)"
							value={Math.max(...outputs().maxSpeedPerGear).toFixed(1)}
							unit="kph"
						/>
						<MetricCard
							label="Active Gears"
							value={activeGears().length.toString()}
							unit=""
						/>
					</div>
				</div>

				<div class="border border-border/50 bg-background/50">
					<SectionHeader
						title="Tire & Traction"
						variant="input"
						help={{
							...HELP_CONTENT.tireCompound,
							position: "bottom",
						}}
					/>
					<div class="p-4 space-y-4">
						<RadioGroupRoot
							value={tireCompound.value}
							onValueChange={(details: RadioGroupValueChangeDetails) =>
								setTireCompound("value", details.value as TireCompound)
							}
							class="space-y-2"
						>
							<For each={TIRE_OPTIONS}>
								{(option) => (
									<RadioGroupItem
										value={option.value}
										class="w-full flex items-center justify-between px-3 py-2 border transition-colors cursor-pointer"
										classList={{
											"border-border/50 bg-foreground/10 text-foreground-secondary":
												tireCompound.value === option.value,
											"border-border/50 bg-surface/30 text-foreground-secondary hover:border-border/50 hover:bg-surface-elevated/30":
												tireCompound.value !== option.value,
										}}
									>
										<RadioGroupItemControl />
										<RadioGroupItemText class="text-sm font-medium">
											{option.label}
										</RadioGroupItemText>
										<span class="text-xs opacity-70">
											u = {option.friction.toFixed(2)}
										</span>
										<RadioGroupItemHiddenInput />
									</RadioGroupItem>
								)}
							</For>
						</RadioGroupRoot>

						<div class="border-t border-border/50 pt-4">
							<div class="text-xs uppercase tracking-wide text-foreground-secondary mb-2">
								Traction Mode
							</div>
							<div class="flex gap-2">
								<For each={TRACTION_MODE_OPTIONS}>
									{(option) => (
										<button
											type="button"
											onClick={() => setTractionMode("value", option.value)}
											class="flex-1 px-3 py-2 border text-sm font-medium transition-colors"
											classList={{
												"border-border/50 bg-foreground/10 text-foreground":
													tractionMode.value === option.value,
												"border-border/50 bg-surface/30 text-muted hover:border-border/50 hover:bg-surface-elevated/30":
													tractionMode.value !== option.value,
											}}
										>
											{option.label}
										</button>
									)}
								</For>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="border border-border/50 bg-background/50">
				<SectionHeader
					title="Effective Drive Ratios"
					variant="output"
					help={{
						...HELP_CONTENT.effectiveDriveRatios,
						position: "bottom",
					}}
				/>
				<div class="p-4">
					<div class="flex flex-wrap gap-3">
						<For each={activeGears()}>
							{(gear, idx) => (
								<div
									class="flex-1 min-w-40 flex flex-col items-center px-4 py-2 border bg-surface/30"
									style={{
										"border-color": `${GEAR_COLORS[idx() % GEAR_COLORS.length]}50`,
									}}
								>
									<span
										class="text-[10px] uppercase tracking-wider mb-1"
										style={{ color: GEAR_COLORS[idx() % GEAR_COLORS.length] }}
									>
										{gear.name}
									</span>
									<span
										class="text-lg font-bold"
										style={{ color: GEAR_COLORS[idx() % GEAR_COLORS.length] }}
									>
										{outputs().effectiveRatios[gear.index].toFixed(2)}
									</span>
									<span class="text-[10px] text-muted">
										max {outputs().maxSpeedPerGear[gear.index].toFixed(0)} kph
									</span>
								</div>
							)}
						</For>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
				<div class="border border-border/50 bg-background/50">
					<SectionHeader
						title="Speed vs RPM Chart"
						variant="output"
						help={{
							...HELP_CONTENT.speedRpmChart,
							position: "bottom",
						}}
					/>
					<div class="p-2 sm:p-4">
						<GearSpeedChart
							speedRpmData={chartSpeedRpmData()}
							gearNames={chartGearNames()}
							redlineRpm={vehicleInputs.redlineRpm}
							height={220}
						/>
					</div>
				</div>

				<div class="border border-border/50 bg-background/50">
					<SectionHeader
						title="Wheel Torque vs RPM Chart"
						variant="output"
						help={{
							...HELP_CONTENT.wheelTorqueChart,
							position: "bottom",
						}}
					/>
					<div class="p-2 sm:p-4">
						<GearTorqueChart
							speedRpmData={chartSpeedRpmData()}
							gearNames={chartGearNames()}
							tractionLimit={outputs().tractionLimitTorque}
							peakHpRpm={outputs().peakHpRpm}
							height={220}
						/>
					</div>
				</div>
			</div>

			<TractionAnalysisSection
				outputs={outputs()}
				activeGears={activeGears()}
			/>
		</div>
	);
}

type GearInfo = {
	index: number;
	name: string;
	ratio: number;
};

type TractionProps = {
	activeGears: GearInfo[];
	outputs: GearboxOutputs;
};

function TractionAnalysisSection(props: TractionProps) {
	return (
		<div class="border border-border/50 bg-background/50">
			<SectionHeader
				title="Traction Analysis"
				variant="output"
				help={{
					...HELP_CONTENT.tractionAnalysis,
					position: "top",
				}}
			/>
			<div class="p-4">
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<For each={props.activeGears}>
						{(gear) => {
							const gearData = () =>
								props.outputs.speedRpmData[gear.index] ?? [];
							const tractionExceededPoints = () =>
								gearData().filter((p: SpeedRpmPoint) => p.exceedsTraction);
							const tractionOkPoints = () =>
								gearData().filter((p: SpeedRpmPoint) => !p.exceedsTraction);
							const percentExceeded = () =>
								gearData().length > 0
									? (tractionExceededPoints().length / gearData().length) * 100
									: 0;

							return (
								<div class="border border-border/50 bg-surface/30 p-3">
									<div class="flex items-center justify-between mb-3">
										<span class="text-sm font-medium text-foreground">
											{gear.name}
										</span>
										<span
											class="text-xs px-2 py-0.5"
											classList={{
												"bg-red-500/20 text-red-400 border border-red-500/30":
													percentExceeded() > 50,
												"bg-amber-500/20 text-amber-400 border border-amber-500/30":
													percentExceeded() > 0 && percentExceeded() <= 50,
												"bg-emerald-500/20 text-emerald-400 border border-emerald-500/30":
													percentExceeded() === 0,
											}}
										>
											{percentExceeded() > 0
												? `${percentExceeded().toFixed(0)}% wheelspin`
												: "Full traction"}
										</span>
									</div>

									<div class="h-2 bg-surface-elevated rounded">
										<div
											class="h-full bg-red-500/70 transition-all"
											style={{ width: `${percentExceeded()}%` }}
										/>
									</div>

									<div class="flex justify-between text-[10px] text-muted">
										<span>
											Grip zone:{" "}
											{tractionOkPoints().length > 0
												? `${tractionOkPoints()[0]?.rpm} - ${tractionOkPoints()[tractionOkPoints().length - 1]?.rpm} RPM`
												: "None"}
										</span>
										<span>
											Max:{" "}
											{props.outputs.maxSpeedPerGear[gear.index].toFixed(0)} kph
										</span>
									</div>
								</div>
							);
						}}
					</For>
				</div>
			</div>
		</div>
	);
}
