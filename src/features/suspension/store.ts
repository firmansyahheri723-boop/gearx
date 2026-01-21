import { makePersisted } from "@solid-primitives/storage";
import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { setAlignmentInputs } from "@/features/alignment/store";
import {
	setFinalDrive,
	setGearRatios,
	setTorqueRpmData,
} from "@/features/gearbox/store";
import type { SavedSetup } from "@/features/setups/types";
import type {
	AccelerationMetrics,
	AntiRollBars,
	Dampers,
	SpringsStiffness,
	TireCompound,
	TractionMode,
	VehicleInputs,
} from "@/features/suspension/types";
import { createDeserializer } from "@/utils/storage";

const VEHICLE_INPUTS_KEY = "gearx_vehicle_inputs";
const TIRE_COMPOUND_KEY = "gearx_tire_compound";
const TRACTION_MODE_KEY = "gearx_traction_mode";

const defaultVehicleInputs: VehicleInputs = {
	carSelection: "Dodge Challenger SRT",
	engineSelection: "Dodge Challenger SRT",
	weight: 1788,
	frontWeightDistribution: 56,
	frontWheelOffset: 3,
	rearWheelOffset: -3,
	desiredRideFrequency: 3,
	desiredRollGradient: 0.05,
	frontWheel: { diameter: 20, profile: 40, width: 345 },
	rearWheel: { diameter: 20, profile: 40, width: 345 },
	cogHeight: 20,
	acceleration0to100: 4.7,
	maxSpeed118mRadius: 140,
	drivetrain: "RWD" as const,
	wheelbase: 2.934,
	frontTrackWidth: 1.63,
	rearTrackWidth: 1.62,
	realYEngineOffset: 0.568,
	realZEngineOffset: 2.021,
	wheelWeight: 12,
	dampingRatio: 1.0,
	tireRate: 343232.75,
	magicNumber: 58.8,
	rollCenterHeight: 0.208,
	redlineRpm: 8000,
};

const deserializeVehicleInputs = createDeserializer(defaultVehicleInputs);

const deserializeTireCompound = createDeserializer<TireCompound>("racing");

const deserializeTractionMode = createDeserializer<TractionMode>("launch");

export const [vehicleInputs, setVehicleInputs] = makePersisted(
	createStore<VehicleInputs>(defaultVehicleInputs),
	{ name: VEHICLE_INPUTS_KEY, deserialize: deserializeVehicleInputs },
);

export const [tireCompound, setTireCompound] = makePersisted(
	createSignal<TireCompound>("racing"),
	{ name: TIRE_COMPOUND_KEY, deserialize: deserializeTireCompound },
);

export const [tractionMode, setTractionMode] = makePersisted(
	createSignal<TractionMode>("launch"),
	{ name: TRACTION_MODE_KEY, deserialize: deserializeTractionMode },
);

export function applySavedSetupToVehicle(setup: SavedSetup): void {
	setVehicleInputs(setup.inputs);
	setTorqueRpmData(setup.torqueRpmData);
	setGearRatios(setup.gearRatios);
	setFinalDrive(setup.finalDrive);
	setTireCompound(setup.tireCompound);
	setTractionMode(setup.tractionMode);
	if (setup.alignmentInputs) {
		setAlignmentInputs(setup.alignmentInputs);
	}
}

export function applySharedSetup(data: SavedSetup): void {
	applySavedSetupToVehicle(data);
}
