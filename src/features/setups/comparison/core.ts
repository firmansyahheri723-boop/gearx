import type {
	SavedSetup,
	SetupDiff,
	SetupDiffCategory,
	SetupDiffField,
} from "@/types";

const CATEGORY_CONFIG: Record<
	string,
	{ name: string; label: string; impactThreshold: number }
> = {
	general: { name: "general", label: "General", impactThreshold: 10 },
	suspension: { name: "suspension", label: "Suspension", impactThreshold: 20 },
	gearbox: { name: "gearbox", label: "Gearbox", impactThreshold: 0.5 },
	aero: { name: "aero", label: "Aerodynamics", impactThreshold: 2 },
	alignment: { name: "alignment", label: "Alignment", impactThreshold: 1 },
};

function isDifferent(a: unknown, b: unknown): boolean {
	if (a === b) return false;
	if (typeof a === "number" && typeof b === "number") {
		return Math.abs(a - b) > 0.001;
	}
	return true;
}

function determineImpact(
	path: string,
	oldValue: unknown,
	newValue: unknown,
): "high" | "medium" | "low" {
	const highImpactPaths = [
		"weight",
		"frontWeightDistribution",
		"rollCenterHeight",
		"magicNumber",
		"cogHeight",
		"spring",
		"stiffness",
		"dampers",
		"antiRollBars",
		"farb",
		"rarb",
	];

	const mediumImpactPaths = [
		"wheelbase",
		"trackWidth",
		"tireCompound",
		"aeroSettings",
		"caster",
		"ackermann",
		"steering",
	];

	const pathLower = path.toLowerCase();

	if (highImpactPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
		return "high";
	}
	if (mediumImpactPaths.some((p) => pathLower.includes(p.toLowerCase()))) {
		return "medium";
	}

	if (
		typeof oldValue === "number" &&
		typeof newValue === "number" &&
		oldValue !== 0
	) {
		const percentChange = Math.abs((newValue - oldValue) / oldValue) * 100;
		if (percentChange > 50) return "high";
		if (percentChange > 20) return "medium";
	}

	return "low";
}

function determineCategory(
	path: string,
): "general" | "suspension" | "gearbox" | "aero" | "alignment" {
	const pathLower = path.toLowerCase();

	if (
		pathLower.includes("alignment") ||
		pathLower.includes("camber") ||
		pathLower.includes("caster") ||
		pathLower.includes("toe") ||
		pathLower.includes("ackermann") ||
		pathLower.includes("steering")
	) {
		return "alignment";
	}

	if (
		pathLower.includes("aero") ||
		pathLower.includes("drag") ||
		pathLower.includes("downforce")
	) {
		return "aero";
	}

	if (
		pathLower.includes("gear") ||
		pathLower.includes("ratio") ||
		pathLower.includes("finaldrive") ||
		pathLower.includes("finalDrive") ||
		pathLower.includes("torque") ||
		pathLower.includes("traction")
	) {
		return "gearbox";
	}

	if (
		pathLower.includes("spring") ||
		pathLower.includes("damper") ||
		pathLower.includes("roll") ||
		pathLower.includes("frequency") ||
		pathLower.includes("stiffness") ||
		pathLower.includes("arb") ||
		pathLower.includes("weight") ||
		pathLower.includes("cog") ||
		pathLower.includes("wheel")
	) {
		return "suspension";
	}

	return "general";
}

function getFieldLabel(path: string): string {
	const labels: Record<string, string> = {
		"inputs.carSelection": "Car",
		"inputs.engineSelection": "Engine",
		"inputs.weight": "Weight (kg)",
		"inputs.frontWeightDistribution": "Front Weight %",
		"inputs.frontWheelOffset": "Front Wheel Offset",
		"inputs.rearWheelOffset": "Rear Wheel Offset",
		"inputs.desiredRideFrequency": "Desired Ride Freq",
		"inputs.desiredRollGradient": "Desired Roll Gradient",
		"inputs.cogHeight": "CoG Height",
		"inputs.drivetrain": "Drivetrain",
		"inputs.wheelbase": "Wheelbase",
		"inputs.frontTrackWidth": "Front Track",
		"inputs.rearTrackWidth": "Rear Track",
		"inputs.redlineRpm": "Redline RPM",
		"inputs.wheelWeight": "Wheel Weight",
		"inputs.dampingRatio": "Damping Ratio",
		"inputs.magicNumber": "Magic Number %",
		"inputs.rollCenterHeight": "Roll Center Height",
		"inputs.acceleration0to100": "0-100 Time",
		"inputs.maxSpeed118mRadius": "Max Speed (118m)",
		"inputs.realYEngineOffset": "Engine Y Offset",
		"inputs.realZEngineOffset": "Engine Z Offset",
		"inputs.tireRate": "Tire Rate",
		"inputs.frontWheel.diameter": "Front Wheel Diameter",
		"inputs.frontWheel.profile": "Front Wheel Profile",
		"inputs.frontWheel.width": "Front Wheel Width",
		"inputs.rearWheel.diameter": "Rear Wheel Diameter",
		"inputs.rearWheel.profile": "Rear Wheel Profile",
		"inputs.rearWheel.width": "Rear Wheel Width",
		"aeroSettings.frontAero": "Front Aero",
		"aeroSettings.rearAero": "Rear Aero",
		"aeroSettings.airResistance": "Air Resistance",
		"finalDrive.ratio": "Final Drive Ratio",
		"finalDrive.min": "Final Drive Min",
		"finalDrive.max": "Final Drive Max",
		"alignmentInputs.frontCamber": "Front Camber",
		"alignmentInputs.frontCaster": "Front Caster",
		"alignmentInputs.frontToe": "Front Toe",
		"alignmentInputs.frontAckermann": "Front Ackermann",
		"alignmentInputs.frontSteeringSensitivity": "Front Steering Sensitivity",
		"alignmentInputs.rearCamber": "Rear Camber",
		"alignmentInputs.rearToe": "Rear Toe",
		"alignmentInputs.maxSteeringAngle": "Max Steering Angle",
		tireCompound: "Tire Compound",
		tractionMode: "Traction Mode",
	};

	return (
		labels[path] ??
		path
			.replace(/\./g, " ")
			.replace(/([A-Z])/g, " $1")
			.replace(/^./, (s) => s.toUpperCase())
			.trim()
	);
}

function compareObjects(
	objA: Record<string, unknown>,
	objB: Record<string, unknown>,
	prefix = "",
): SetupDiffField[] {
	const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
	const diffs: SetupDiffField[] = [];

	allKeys.forEach((key) => {
		const valueA = objA[key];
		const valueB = objB[key];
		const path = prefix ? `${prefix}.${key}` : key;
		const hasDiff = isDifferent(valueA, valueB);

		if (
			typeof valueA === "object" &&
			typeof valueB === "object" &&
			valueA !== null &&
			valueB !== null &&
			!Array.isArray(valueA) &&
			!Array.isArray(valueB)
		) {
			diffs.push(
				...compareObjects(
					valueA as Record<string, unknown>,
					valueB as Record<string, unknown>,
					path,
				),
			);
		} else {
			diffs.push({
				path,
				label: getFieldLabel(path),
				category: determineCategory(path),
				impact: hasDiff ? determineImpact(path, valueA, valueB) : "low",
				hasDifference: hasDiff,
				oldValue: valueA,
				newValue: valueB,
				formattedOld: formatFieldValue(valueA, path),
				formattedNew: formatFieldValue(valueB, path),
			});
		}
	});

	return diffs;
}

function compareArrays(
	arrA: unknown[],
	arrB: unknown[],
	path: string,
): SetupDiffField[] {
	const maxLen = Math.max(arrA.length, arrB.length);
	const diffs: SetupDiffField[] = [];

	for (let i = 0; i < maxLen; i++) {
		const valA = arrA[i];
		const valB = arrB[i];
		const hasDiff = isDifferent(valA, valB);

		if (
			typeof valA === "object" &&
			typeof valB === "object" &&
			valA !== null &&
			valB !== null &&
			!Array.isArray(valA) &&
			!Array.isArray(valB)
		) {
			diffs.push(
				...compareObjects(
					valA as Record<string, unknown>,
					valB as Record<string, unknown>,
					`${path}[${i}]`,
				),
			);
		} else {
			const gearLabel = path.includes("gearRatios")
				? `Gear ${i + 1}`
				: `Item ${i}`;
			diffs.push({
				path: `${path}[${i}]`,
				label:
					`${gearLabel} ${path.includes("gearRatios") ? "Ratio" : ""}`.trim(),
				category: determineCategory(path),
				impact: hasDiff
					? path.includes("gearRatios")
						? "medium"
						: determineImpact(path, valA, valB)
					: "low",
				hasDifference: hasDiff,
				oldValue: valA,
				newValue: valB,
				formattedOld: formatFieldValue(valA, path),
				formattedNew: formatFieldValue(valB, path),
			});
		}
	}

	return diffs;
}

export function formatFieldValue(value: unknown, path: string): string {
	if (value === null || value === undefined) return "-";

	if (typeof value === "object") {
		if (Array.isArray(value)) {
			if (path.includes("gearRatios")) {
				return value
					.map((v, i) =>
						v && typeof v === "object" && "ratio" in v
							? `G${i + 1}: ${(v as { ratio: number }).ratio.toFixed(2)}`
							: "-",
					)
					.join(", ");
			}
			return `[${value.length} items]`;
		}

		const obj = value as Record<string, unknown>;

		if ("front" in obj && "rear" in obj) {
			return `F: ${(obj.front as number)?.toFixed(1) ?? "-"}, R: ${(obj.rear as number)?.toFixed(1) ?? "-"}`;
		}
		if ("bump" in obj && "rebound" in obj) {
			const bump = obj.bump as { front?: number; rear?: number };
			const rebound = obj.rebound as { front?: number; rear?: number };
			return `Bump F: ${bump.front?.toFixed(0) ?? "-"}, R: ${bump.rear?.toFixed(0) ?? "-"} | Rebound F: ${rebound.front?.toFixed(0) ?? "-"}, R: ${rebound.rear?.toFixed(0) ?? "-"}`;
		}
		return JSON.stringify(value);
	}

	if (typeof value === "number") {
		if (path.includes("Frequency") || path.includes("Gradient")) {
			return value.toFixed(3);
		}
		if (path.includes("Weight") || path.includes("Distribution")) {
			return `${value.toFixed(1)}%`;
		}
		if (path.includes("Ratio") && !path.includes("gearRatios")) {
			return value.toFixed(2);
		}
		if (
			path.includes("offset") ||
			path.includes("Height") ||
			path.includes("width") ||
			path.includes("diameter")
		) {
			return `${value.toFixed(2)}`;
		}
		if (path.includes("Rpm") || path.includes("rpm")) {
			return `${value.toFixed(0)}`;
		}
		return value.toFixed(2);
	}

	if (typeof value === "boolean") {
		return value ? "Yes" : "No";
	}

	return String(value);
}

export function getImpactColor(impact: "high" | "medium" | "low"): string {
	switch (impact) {
		case "high":
			return "#ef4444";
		case "medium":
			return "#f59e0b";
		case "low":
			return "#22c55e";
	}
}

export function getCategoryIcon(category: string): string {
	switch (category) {
		case "general":
			return "⚙️";
		case "suspension":
			return "🔧";
		case "gearbox":
			return "⚡";
		case "aero":
			return "💨";
		case "alignment":
			return "📐";
		default:
			return "•";
	}
}

export function compareTwoSetups(
	setupA: SavedSetup,
	setupB: SavedSetup,
): SetupDiff {
	const allDiffs: SetupDiffField[] = [];

	allDiffs.push(
		...compareObjects(
			setupA.inputs as unknown as Record<string, unknown>,
			setupB.inputs as unknown as Record<string, unknown>,
			"inputs",
		),
	);
	allDiffs.push(
		...compareArrays(
			setupA.torqueRpmData,
			setupB.torqueRpmData,
			"torqueRpmData",
		),
	);
	allDiffs.push(
		...compareArrays(setupA.gearRatios, setupB.gearRatios, "gearRatios"),
	);
	allDiffs.push(
		...compareObjects(
			setupA.finalDrive as unknown as Record<string, unknown>,
			setupB.finalDrive as unknown as Record<string, unknown>,
			"finalDrive",
		),
	);

	const tireCompoundDiff = setupA.tireCompound !== setupB.tireCompound;
	allDiffs.push({
		path: "tireCompound",
		label: "Tire Compound",
		category: "suspension",
		impact: tireCompoundDiff ? "medium" : "low",
		hasDifference: tireCompoundDiff,
		oldValue: setupA.tireCompound,
		newValue: setupB.tireCompound,
		formattedOld: setupA.tireCompound,
		formattedNew: setupB.tireCompound,
	});

	const tractionModeDiff = setupA.tractionMode !== setupB.tractionMode;
	allDiffs.push({
		path: "tractionMode",
		label: "Traction Mode",
		category: "gearbox",
		impact: tractionModeDiff ? "low" : "low",
		hasDifference: tractionModeDiff,
		oldValue: setupA.tractionMode,
		newValue: setupB.tractionMode,
		formattedOld: setupA.tractionMode,
		formattedNew: setupB.tractionMode,
	});

	allDiffs.push(
		...compareObjects(
			setupA.aeroSettings as unknown as Record<string, unknown>,
			setupB.aeroSettings as unknown as Record<string, unknown>,
			"aeroSettings",
		),
	);

	if (setupA.alignmentInputs || setupB.alignmentInputs) {
		allDiffs.push(
			...compareObjects(
				(setupA.alignmentInputs ?? {}) as Record<string, unknown>,
				(setupB.alignmentInputs ?? {}) as Record<string, unknown>,
				"alignmentInputs",
			),
		);
	}

	const categories: SetupDiffCategory[] = Object.values(CATEGORY_CONFIG).map(
		(config) => ({
			name: config.name,
			label: config.label,
			fields: allDiffs.filter((d) => d.category === config.name),
		}),
	);

	return {
		setupA,
		setupB,
		categories,
		summary: {
			totalDiffs: allDiffs.length,
			highImpact: allDiffs.filter((d) => d.impact === "high").length,
			mediumImpact: allDiffs.filter((d) => d.impact === "medium").length,
			lowImpact: allDiffs.filter((d) => d.impact === "low").length,
		},
	};
}
