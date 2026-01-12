import type { HelpContent, HelpLink, VehicleInputs } from "@/types";

export type SliderConfig = {
	key: keyof VehicleInputs;
	label: string;
	min: number;
	max: number;
	step: number;
	unit: string;
	description: string;
	help: string;
};

export const SUSPENSION_SLIDERS: SliderConfig[] = [
	{
		key: "desiredRideFrequency",
		label: "Ride Frequency",
		min: 2.0,
		max: 6.0,
		step: 0.1,
		unit: "Hz",
		description: "Racecars: 3.0 - 5.0+ Hz",
		help: "Natural frequency of suspension oscillation. Higher values = stiffer suspension. Race cars typically use 3.0-5.0+ Hz.",
	},
	{
		key: "dampingRatio",
		label: "Damping Ratio",
		min: 0.5,
		max: 1.5,
		step: 0.05,
		unit: "ζ",
		description: "Racecars: 0.65+",
		help: "Ratio of actual damping to critical damping. 1.0 = critically damped (no oscillation). Race cars typically use 0.65+.",
	},
	{
		key: "desiredRollGradient",
		label: "Roll Gradient",
		min: 0.02,
		max: 0.7,
		step: 0.01,
		unit: "deg/g",
		description: "Lower = stiffer roll",
		help: "Degrees of body roll per g of lateral acceleration. Lower values = stiffer roll resistance. Race cars typically use 0.02-0.3 deg/g.",
	},
	{
		key: "magicNumber",
		label: "Front ARB Bias",
		min: 40,
		max: 70,
		step: 0.5,
		unit: "%",
		description: "Front roll stiffness distribution",
		help: "Front ARB bias percentage. Controls understeer/oversteer balance. Higher values = more understeer tendency.",
	},
	{
		key: "wheelWeight",
		label: "Wheel Weight",
		min: 8,
		max: 20,
		step: 0.5,
		unit: "kg",
		description: "Per wheel (unsprung mass)",
		help: "Unsprung mass per wheel (wheel, tire, brake, hub). Subtracted from axle weight to get sprung mass.",
	},
	{
		key: "rollCenterHeight",
		label: "Roll Center Height",
		min: 0.05,
		max: 0.4,
		step: 0.01,
		unit: "m",
		description: "Height from ground to roll center",
		help: "Height of the roll center above ground. The distance from roll center to CoG (H) determines roll moment arm.",
	},
];

export const ARB_STIFFNESS_HELP: HelpContent = {
	description:
		"Individual ARB stiffness is derived from total roll rate and the front bias percentage (magic number).",
	formula: "ARB = \\frac{K_{\\phi F/R} \\cdot \\pi}{180 \\cdot t^2}",
	variables: [
		"ARB = anti-roll bar stiffness (kNm)",
		"K_φF/R = front/rear roll rate (Nm/deg)",
		"t = average track width (m)",
	],
};

const HELP_CONTENT: Record<
	string,
	{ description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
	carSelection: {
		description:
			"Select the vehicle chassis and body configuration from your imported car data. This determines the base platform including wheelbase, track width, and suspension geometry that will be used for calculations.",
		videos: [
			{
				label: "Engine & Transmission Swap Guide",
				url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz",
			},
		],
	},
	engineSelection: {
		description:
			"Choose the engine/powertrain configuration. You can use the car's default engine or select a swapped engine from another vehicle. Engine selection affects power delivery, torque curves, and optimal gear ratios.",
		videos: [
			{
				label: "Engine & Transmission Swap Guide",
				url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz",
			},
			{
				label: "Engine Talk",
				url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10",
			},
		],
	},
	weight: {
		description:
			"Total vehicle curb weight in kilograms, including fluids but without passengers or cargo. Lighter vehicles accelerate faster and handle better, but may sacrifice traction. Consider weight reduction mods carefully - removing too much can upset balance.",
		articles: [
			{
				label: "Wikipedia: Curb Weight",
				url: "https://en.wikipedia.org/wiki/Curb_weight",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	frontWeightDistribution: {
		description:
			"Percentage of total weight resting on the front axle. Most vehicles range from 50-60%. Front-heavy cars (>55%) tend to understeer, while rear-biased setups (<50%) promote oversteer. Adjust based on your driving style and track characteristics.",
		articles: [
			{
				label: "Wikipedia: Weight Distribution",
				url: "https://en.wikipedia.org/wiki/Weight_distribution",
			},
		],
		videos: [
			{
				label: "Suspension Talk",
				url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq",
			},
		],
	},
	frontWheelOffset: {
		description:
			"Distance in centimeters from the wheel centerline to the hub mounting surface for front wheels. Positive offset pushes wheels inward, negative pushes them outward. Affects scrub radius, steering feel, and fender clearance. Incorrect offset can cause accelerated tire wear and handling issues.",
		articles: [
			{
				label: "Wikipedia: Wheel Offset",
				url: "https://en.wikipedia.org/wiki/Offset_(wheel)",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	rearWheelOffset: {
		description:
			"Distance in centimeters from the wheel centerline to the hub mounting surface for rear wheels. On RWD/AWD vehicles, rear offset significantly impacts traction and stability. Wider stance (more negative offset) improves grip but may cause rubbing issues.",
		articles: [
			{
				label: "Wikipedia: Wheel Offset",
				url: "https://en.wikipedia.org/wiki/Offset_(wheel)",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	rideFrequency: {
		description:
			"Natural oscillation frequency of the suspension in Hz. Lower values (2-3 Hz) provide comfort, higher values (3-5 Hz) improve handling response. Race cars typically run 3.5-5 Hz. Front should generally be slightly lower than rear to prevent pitch oscillation.",
		articles: [
			{
				label: "Wikipedia: Suspension",
				url: "https://en.wikipedia.org/wiki/Suspension_(vehicle)",
			},
		],
		videos: [
			{
				label: "Springs & Dampers Guide",
				url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc",
			},
			{
				label: "Suspension Talk",
				url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq",
			},
		],
	},
	rollGradient: {
		description:
			"Degrees of body roll per G of lateral acceleration. Lower values mean less body roll during cornering. Street cars: 0.4-0.7 deg/G. Track cars: 0.2-0.4 deg/G. Race cars: 0.02-0.2 deg/G. Too stiff causes snap oversteer and reduces tire compliance.",
		articles: [
			{
				label: "Wikipedia: Roll Center",
				url: "https://en.wikipedia.org/wiki/Roll_center",
			},
		],
		videos: [
			{
				label: "Anti-Roll Bars Guide",
				url: "https://youtu.be/It-V_Yt_PDc?si=njpT1_KasdUdZGxY",
			},
			{
				label: "Suspension Talk",
				url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq",
			},
		],
	},
	wheelDiameter: {
		description:
			"Rim diameter in inches. Larger wheels accommodate larger brakes and reduce sidewall flex for sharper handling, but add unsprung mass which hurts ride and acceleration. Higher-powered vehicles benefit from larger wheels. Underpowered cars should avoid oversized wheels as they slow acceleration.",
		articles: [
			{
				label: "Wikipedia: Wheel Sizing",
				url: "https://en.wikipedia.org/wiki/Wheel_sizing",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	profile: {
		description:
			"Tire aspect ratio - sidewall height as a percentage of tire width. Lower profile (30-45%) provides quicker steering response and less flex, but harsher ride and more vulnerable to pothole damage. Higher profile (50-65%) offers better comfort and protection. Match to your wheel diameter and intended use.",
		articles: [
			{
				label: "Wikipedia: Tire Code",
				url: "https://en.wikipedia.org/wiki/Tire_code",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	tireWidth: {
		description:
			"Tire tread width in millimeters. Wider tires provide more grip but increase rolling resistance, weight, and risk of hydroplaning. Width should match your vehicle's power - excessive width on low-power cars wastes grip potential and adds drag. Consider front/rear stagger for RWD vehicles.",
		articles: [
			{
				label: "Wikipedia: Tire Code",
				url: "https://en.wikipedia.org/wiki/Tire_code",
			},
		],
		videos: [
			{
				label: "Wheels & Body Talk",
				url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS",
			},
		],
	},
	cogHeight: {
		description:
			'Center of gravity height from ground in inches. Lower CoG dramatically improves handling, reducing body roll and weight transfer. Typical values: Sports cars 18-20", Sedans 20-24", SUVs 26-30". Lowering suspension, lightweight wheels, and low-mounted components all help reduce CoG.',
		articles: [
			{
				label: "Wikipedia: Center of Mass",
				url: "https://en.wikipedia.org/wiki/Center_of_mass",
			},
		],
		videos: [
			{
				label: "Suspension Talk",
				url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq",
			},
		],
	},
	acceleration: {
		description:
			"Target acceleration time from 0 to 100 km/h in seconds. Used to calculate optimal gear ratios and final drive. Realistic targets depend on power-to-weight ratio. Sub-4s requires 400+ hp/ton, 4-6s needs 200-400 hp/ton, 6-10s is typical for 100-200 hp/ton.",
		articles: [
			{
				label: "Wikipedia: Car Performance",
				url: "https://en.wikipedia.org/wiki/Car_performance",
			},
		],
		videos: [
			{
				label: "Gear Ratios Guide",
				url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN",
			},
		],
	},
	redlineRpm: {
		description:
			"Engine rev limiter (redline) in RPM. This is the maximum engine speed before the limiter kicks in. Used to display the redline on speed/RPM charts and calculate maximum speeds per gear. Typical values: economy cars 6000-7000, sports cars 7000-8500, race engines 8000-10000+.",
		articles: [
			{
				label: "Wikipedia: Redline",
				url: "https://en.wikipedia.org/wiki/Redline",
			},
		],
		videos: [
			{
				label: "Engine Talk",
				url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10",
			},
		],
	},
	maxSpeed118m: {
		description:
			"Maximum sustained cornering speed in km/h at 118m radius - the standard skidpad test. This indicates lateral grip capability. Higher speeds require better tires, lower CoG, and stiffer suspension. Used to calculate lateral G capability and appropriate spring/damper rates.",
		articles: [
			{
				label: "Wikipedia: Skidpad",
				url: "https://en.wikipedia.org/wiki/Skidpad",
			},
		],
		videos: [
			{
				label: "Suspension Talk",
				url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq",
			},
		],
	},
	drivetrain: {
		description:
			"Power delivery configuration. FWD sends power to front wheels only. RWD sends power to rear wheels only. AWD sends power to all four wheels for ~20% more traction but adds weight.",
		articles: [
			{
				label: "Wikipedia: Drivetrain",
				url: "https://en.wikipedia.org/wiki/Drivetrain",
			},
		],
		videos: [
			{
				label: "Transmission Talk",
				url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M",
			},
		],
	},
};

const DRIVETRAIN_OPTIONS = ["FWD", "RWD", "AWD"] as const;
export type DrivetrainOption = (typeof DRIVETRAIN_OPTIONS)[number];

const WHEEL_DIAMETER_OPTIONS = [14, 15, 16, 17, 18, 19, 20, 21, 22] as const;

export { HELP_CONTENT, DRIVETRAIN_OPTIONS, WHEEL_DIAMETER_OPTIONS };
