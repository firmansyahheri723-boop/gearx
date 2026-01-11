import { Component, createMemo, Show, For } from "solid-js";
import { SectionHeader } from "./ui/section-header";
import { Dropdown, DropdownOption } from "./ui/dropdown";
import { HelpTooltip, HelpLink } from "./ui/help-tooltip";
import { vehicleInputs, setVehicleInputs } from "../stores/vehicle";
import {
  carData,
  selectCar,
  selectEngine,
  selectedCarIndex,
  selectedEngineIndex,
  getSelectedCar,
  getSelectedEngine,
} from "../stores/car-data";

// Help tooltip content for each input field
const HELP_CONTENT: Record<
  string,
  { description: string; articles?: HelpLink[]; videos?: HelpLink[] }
> = {
  carSelection: {
    description:
      "Select the vehicle chassis and body configuration from your imported car data. This determines the base platform including wheelbase, track width, and suspension geometry that will be used for calculations.",
    videos: [
      { label: "Engine & Transmission Swap Guide", url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz" },
    ],
  },
  engineSelection: {
    description:
      "Choose the engine/powertrain configuration. You can use the car's default engine or select a swapped engine from another vehicle. Engine selection affects power delivery, torque curves, and optimal gear ratios.",
    videos: [
      { label: "Engine & Transmission Swap Guide", url: "https://youtu.be/iP2bXvSc0WU?si=Tcy02GPdHieKN8gz" },
      { label: "Engine Talk", url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10" },
    ],
  },
  weight: {
    description:
      "Total vehicle curb weight in kilograms, including fluids but without passengers or cargo. Lighter vehicles accelerate faster and handle better, but may sacrifice traction. Consider weight reduction mods carefully - removing too much can upset balance.",
    articles: [{ label: "Wikipedia: Curb Weight", url: "https://en.wikipedia.org/wiki/Curb_weight" }],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  frontWeightDistribution: {
    description:
      "Percentage of total weight resting on the front axle. Most vehicles range from 50-60%. Front-heavy cars (>55%) tend to understeer, while rear-biased setups (<50%) promote oversteer. Adjust based on your driving style and track characteristics.",
    articles: [{ label: "Wikipedia: Weight Distribution", url: "https://en.wikipedia.org/wiki/Weight_distribution" }],
    videos: [
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  frontWheelOffset: {
    description:
      "Distance in centimeters from the wheel centerline to the hub mounting surface for front wheels. Positive offset pushes wheels inward, negative pushes them outward. Affects scrub radius, steering feel, and fender clearance. Incorrect offset can cause accelerated tire wear and handling issues.",
    articles: [{ label: "Wikipedia: Wheel Offset", url: "https://en.wikipedia.org/wiki/Offset_(wheel)" }],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  rearWheelOffset: {
    description:
      "Distance in centimeters from the wheel centerline to the hub mounting surface for rear wheels. On RWD/AWD vehicles, rear offset significantly impacts traction and stability. Wider stance (more negative offset) improves grip but may cause rubbing issues.",
    articles: [{ label: "Wikipedia: Wheel Offset", url: "https://en.wikipedia.org/wiki/Offset_(wheel)" }],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  rideFrequency: {
    description:
      "Natural oscillation frequency of the suspension in Hz. Lower values (2-3 Hz) provide comfort, higher values (3-5 Hz) improve handling response. Race cars typically run 3.5-5 Hz. Front should generally be slightly lower than rear to prevent pitch oscillation.",
    articles: [{ label: "Wikipedia: Suspension", url: "https://en.wikipedia.org/wiki/Suspension_(vehicle)" }],
    videos: [
      { label: "Springs & Dampers Guide", url: "https://youtu.be/sBWmsvuTg5o?si=Sv9HVwlom2GWgTxc" },
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  rollGradient: {
    description:
      "Degrees of body roll per G of lateral acceleration. Lower values mean less body roll during cornering. Street cars: 0.4-0.7 deg/G. Track cars: 0.2-0.4 deg/G. Race cars: 0.02-0.2 deg/G. Too stiff causes snap oversteer and reduces tire compliance.",
    articles: [{ label: "Wikipedia: Roll Center", url: "https://en.wikipedia.org/wiki/Roll_center" }],
    videos: [
      { label: "Anti-Roll Bars Guide", url: "https://youtu.be/It-V_Yt_PDc?si=njpT1_KasdUdZGxY" },
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  wheelDiameter: {
    description:
      "Rim diameter in inches. Larger wheels accommodate bigger brakes and reduce sidewall flex for sharper handling, but add unsprung mass which hurts ride and acceleration. Higher-powered vehicles benefit from larger wheels. Underpowered cars should avoid oversized wheels as they slow acceleration.",
    articles: [{ label: "Wikipedia: Wheel Sizing", url: "https://en.wikipedia.org/wiki/Wheel_sizing" }],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  profile: {
    description:
      "Tire aspect ratio - sidewall height as a percentage of tire width. Lower profile (30-45%) provides quicker steering response and less flex, but harsher ride and more vulnerable to pothole damage. Higher profile (50-65%) offers better comfort and protection. Match to your wheel diameter and intended use.",
    articles: [{ label: "Wikipedia: Tire Code", url: "https://en.wikipedia.org/wiki/Tire_code" }],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  tireWidth: {
    description:
      "Tire tread width in millimeters. Wider tires provide more grip but increase rolling resistance, weight, and risk of hydroplaning. Width should match your vehicle's power - excessive width on low-power cars wastes grip potential and adds drag. Consider front/rear stagger for RWD vehicles.",
    articles: [{ label: "Wikipedia: Tire Code", url: "https://en.wikipedia.org/wiki/Tire_code" }],
    videos: [
      { label: "Wheels & Body Talk", url: "https://youtu.be/1-7kXw3KWao?si=LDoJEixORdoFeNgS" },
    ],
  },
  cogHeight: {
    description:
      "Center of gravity height from ground in inches. Lower CoG dramatically improves handling, reducing body roll and weight transfer. Typical values: Sports cars 18-20\", Sedans 20-24\", SUVs 26-30\". Lowering suspension, lightweight wheels, and low-mounted components all help reduce CoG.",
    articles: [{ label: "Wikipedia: Center of Mass", url: "https://en.wikipedia.org/wiki/Center_of_mass" }],
    videos: [
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  acceleration: {
    description:
      "Target acceleration time from 0 to 100 km/h in seconds. Used to calculate optimal gear ratios and final drive. Realistic targets depend on power-to-weight ratio. Sub-4s requires 400+ hp/ton, 4-6s needs 200-400 hp/ton, 6-10s is typical for 100-200 hp/ton.",
    articles: [{ label: "Wikipedia: Car Performance", url: "https://en.wikipedia.org/wiki/Car_performance" }],
    videos: [
      { label: "Gear Ratios Guide", url: "https://youtu.be/8_SaobHPhWs?si=_5gsrOEVdybXMOXN" },
    ],
  },
  redlineRpm: {
    description:
      "Engine rev limiter (redline) in RPM. This is the maximum engine speed before the limiter kicks in. Used to display the redline on speed/RPM charts and calculate maximum speeds per gear. Typical values: economy cars 6000-7000, sports cars 7000-8500, race engines 8000-10000+.",
    articles: [{ label: "Wikipedia: Redline", url: "https://en.wikipedia.org/wiki/Redline" }],
    videos: [
      { label: "Engine Talk", url: "https://youtu.be/A6SZfn6Kgfg?si=J3IxTU4NBJ42-M10" },
    ],
  },
  maxSpeed118m: {
    description:
      "Maximum sustained cornering speed in km/h at 118m radius - the standard skidpad test. This indicates lateral grip capability. Higher speeds require better tires, lower CoG, and stiffer suspension. Used to calculate lateral G capability and appropriate spring/damper rates.",
    articles: [{ label: "Wikipedia: Skidpad", url: "https://en.wikipedia.org/wiki/Skidpad" }],
    videos: [
      { label: "Suspension Talk", url: "https://youtu.be/rBcvqjVe_yI?si=poiSskSvUs5W3gXq" },
    ],
  },
  drivetrain: {
    description:
      "Power delivery configuration. FWD (front-wheel drive) is efficient but limited by weight transfer under acceleration. RWD (rear-wheel drive) allows better weight transfer utilization. AWD distributes power to all wheels for maximum traction but adds weight and complexity.",
    articles: [{ label: "Wikipedia: Drivetrain", url: "https://en.wikipedia.org/wiki/Drivetrain" }],
    videos: [
      { label: "Transmission Talk", url: "https://youtu.be/oGohWF7HZrw?si=yFHI1mTFhoMXlQ2M" },
    ],
  },
};

const DRIVETRAIN_OPTIONS = ["FWD", "RWD/AWD"] as const;
const WHEEL_DIAMETER_OPTIONS = [16, 17, 18, 19, 20, 21, 22] as const;

export const InputSection: Component = () => {
  
  const carOptions = createMemo((): DropdownOption[] => {
    if (carData.length === 0) {
      return [{ value: "", label: "No cars imported" }];
    }
    return carData.map((car) => {
      const name = car.car || "Unknown";
      return { value: name, label: name };
    });
  });

  
  const engineOptions = createMemo((): DropdownOption[] => {
    if (carData.length === 0) {
      return [{ value: "", label: "No engines imported" }];
    }
    return carData
      .filter((car) => {
        const name = car.car || "";
        return !name.toLowerCase().includes("swapped transmission");
      })
      .map((car) => {
        const name = car.car || "Unknown";
        let label = name;

        // Add suffix based on name
        if (name.toLowerCase().endsWith("engine")) {
          // Keep as-is
        } else if (name.toLowerCase().includes("swapped engine")) {
          label = name.replace(/swapped engine/i, "[Swapped Engine]");
        } else {
          label = `${name} [Default Engine]`;
        }

        return { value: name, label };
      });
  });

  // Handle car selection change
  const handleCarChange = (carName: string) => {
    const index = carData.findIndex((car) => car.car === carName);
    if (index >= 0) {
      selectCar(index);
    }
  };

  // Handle engine selection change
  const handleEngineChange = (carName: string) => {
    const index = carData.findIndex((car) => car.car === carName);
    if (index >= 0) {
      selectEngine(index);
    }
  };

  // Slider fill percentage calculator
  const getSliderFill = (value: number, min: number, max: number) => {
    const range = max - min;
    if (range === 0) return 0;
    return ((value - min) / range) * 100;
  };

  return (
    <div class="border border-neutral-800/50 bg-neutral-950/50">
      <SectionHeader title="Vehicle Input" variant="input" />

      {/* Selection info banner */}
      <Show
        when={selectedCarIndex() !== null || selectedEngineIndex() !== null}
      >
        <div class="px-3 py-1.5 border-b border-neutral-800/50 bg-neutral-900/50 flex items-center gap-4 text-[10px]">
          <Show when={getSelectedCar()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-green-500 rounded-full" />
              <span class="text-neutral-400">Chassis:</span>
              <span class="text-green-400 font-medium">
                {getSelectedCar()?.car}
              </span>
            </span>
          </Show>
          <Show when={getSelectedEngine()}>
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-amber-500 rounded-full" />
              <span class="text-neutral-400">Engine:</span>
              <span class="text-amber-400 font-medium">
                {getSelectedEngine()?.car}
              </span>
            </span>
          </Show>
        </div>
      </Show>

      <table class="w-full border-collapse text-sm">
        <tbody>
          {/* Car Selection */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50 w-1/3">
              <div class="flex items-center justify-between">
                <span>Car selection</span>
                <HelpTooltip description={HELP_CONTENT.carSelection.description} />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0">
              <Dropdown
                value={vehicleInputs.carSelection}
                options={carOptions()}
                onChange={handleCarChange}
                disabled={carData.length === 0}
                placeholder="Select car..."
              />
            </td>
          </tr>

          {/* Engine Selection */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Engine selection</span>
                <HelpTooltip description={HELP_CONTENT.engineSelection.description} />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0">
              <Dropdown
                value={vehicleInputs.engineSelection}
                options={engineOptions()}
                onChange={handleEngineChange}
                disabled={carData.length === 0}
                placeholder="Select engine..."
              />
            </td>
          </tr>

          {/* Weight */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Weight</span>
                <HelpTooltip
                  description={HELP_CONTENT.weight.description}
                  articles={HELP_CONTENT.weight.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.weight}
                  onInput={(e) =>
                    setVehicleInputs(
                      "weight",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">kg</span>
              </div>
            </td>
          </tr>

          {/* Front Weight Distribution */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Front weight distribution</span>
                <HelpTooltip
                  description={HELP_CONTENT.frontWeightDistribution.description}
                  articles={HELP_CONTENT.frontWeightDistribution.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.frontWeightDistribution}
                  step={0.1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "frontWeightDistribution",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
              </div>
            </td>
          </tr>

          {/* Front Wheel Offset */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Front wheel offset</span>
                <HelpTooltip
                  description={HELP_CONTENT.frontWheelOffset.description}
                  articles={HELP_CONTENT.frontWheelOffset.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.frontWheelOffset}
                  step={0.1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "frontWheelOffset",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
              </div>
            </td>
          </tr>

          {/* Rear Wheel Offset */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Rear wheel offset</span>
                <HelpTooltip
                  description={HELP_CONTENT.rearWheelOffset.description}
                  articles={HELP_CONTENT.rearWheelOffset.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.rearWheelOffset}
                  step={0.1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "rearWheelOffset",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">cm</span>
              </div>
            </td>
          </tr>

          {/* Ride Frequency - Slider */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Ride frequency</span>
                <HelpTooltip
                  description={HELP_CONTENT.rideFrequency.description}
                  articles={HELP_CONTENT.rideFrequency.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center gap-2 px-3 py-1.5">
                <span class="text-neutral-600 text-xs w-6">3</span>
                <div class="flex-1 relative h-5 flex items-center">
                  <div class="absolute inset-x-0 h-1 bg-neutral-700 rounded-full">
                    <div
                      class="absolute left-0 top-0 h-full bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full"
                      style={{
                        width: `${getSliderFill(vehicleInputs.desiredRideFrequency, 3, 5)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={5}
                    step={0.1}
                    value={vehicleInputs.desiredRideFrequency}
                    onInput={(e) =>
                      setVehicleInputs(
                        "desiredRideFrequency",
                        parseFloat(e.currentTarget.value),
                      )
                    }
                    class="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    class="absolute w-2.5 h-2.5 bg-neutral-400 rounded-full shadow-lg shadow-neutral-500/30 pointer-events-none border border-neutral-300"
                    style={{
                      left: `calc(${getSliderFill(vehicleInputs.desiredRideFrequency, 3, 5)}% - 5px)`,
                    }}
                  />
                </div>
                <span class="text-neutral-600 text-xs w-6">5</span>
                <input
                  type="number"
                  value={vehicleInputs.desiredRideFrequency}
                  step={0.1}
                  min={3}
                  max={5}
                  onInput={(e) => {
                    const val = parseFloat(e.currentTarget.value);
                    if (!isNaN(val))
                      setVehicleInputs(
                        "desiredRideFrequency",
                        Math.min(5, Math.max(3, val)),
                      );
                  }}
                  class="w-14 px-2 py-0.5 bg-neutral-900/50 border border-neutral-700/50 rounded text-neutral-400 text-sm text-center focus:outline-none focus:text-emerald-400"
                />
              </div>
            </td>
          </tr>

          {/* Roll Gradient - Slider */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Roll gradient</span>
                <HelpTooltip
                  description={HELP_CONTENT.rollGradient.description}
                  articles={HELP_CONTENT.rollGradient.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center gap-2 px-3 py-1.5">
                <span class="text-neutral-600 text-xs w-6">.02</span>
                <div class="flex-1 relative h-5 flex items-center">
                  <div class="absolute inset-x-0 h-1 bg-neutral-700 rounded-full">
                    <div
                      class="absolute left-0 top-0 h-full bg-gradient-to-r from-neutral-600 to-neutral-400 rounded-full"
                      style={{
                        width: `${getSliderFill(vehicleInputs.desiredRollGradient, 0.02, 0.7)}%`,
                      }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.7}
                    step={0.01}
                    value={vehicleInputs.desiredRollGradient}
                    onInput={(e) =>
                      setVehicleInputs(
                        "desiredRollGradient",
                        parseFloat(e.currentTarget.value),
                      )
                    }
                    class="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                  <div
                    class="absolute w-2.5 h-2.5 bg-neutral-400 rounded-full shadow-lg shadow-neutral-500/30 pointer-events-none border border-neutral-300"
                    style={{
                      left: `calc(${getSliderFill(vehicleInputs.desiredRollGradient, 0.02, 0.7)}% - 5px)`,
                    }}
                  />
                </div>
                <span class="text-neutral-600 text-xs w-6">.7</span>
                <input
                  type="number"
                  value={vehicleInputs.desiredRollGradient}
                  step={0.01}
                  min={0.02}
                  max={0.7}
                  onInput={(e) => {
                    const val = parseFloat(e.currentTarget.value);
                    if (!isNaN(val))
                      setVehicleInputs(
                        "desiredRollGradient",
                        Math.min(0.7, Math.max(0.02, val)),
                      );
                  }}
                  class="w-14 px-2 py-0.5 bg-neutral-900/50 border border-neutral-700/50 rounded text-neutral-400 text-sm text-center focus:outline-none focus:text-emerald-400"
                />
              </div>
            </td>
          </tr>

          {/* Wheel Diameter - Segmented */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Wheel diameter</span>
                <HelpTooltip
                  description={HELP_CONTENT.wheelDiameter.description}
                  articles={HELP_CONTENT.wheelDiameter.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center px-2 py-1.5">
                <div class="flex gap-0.5">
                  <For each={[...WHEEL_DIAMETER_OPTIONS]}>
                    {(size) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs("wheelDiameter", size)}
                        class="px-2 py-1 text-xs transition-all duration-100"
                        classList={{
                          "bg-neutral-500/20 text-neutral-400 border border-neutral-500/50":
                            vehicleInputs.wheelDiameter === size,
                          "bg-neutral-900/50 text-neutral-500 border border-neutral-700/50 hover:text-neutral-300":
                            vehicleInputs.wheelDiameter !== size,
                        }}
                      >
                        {size}
                      </button>
                    )}
                  </For>
                </div>
                <span class="px-2 text-neutral-500 text-xs">in</span>
              </div>
            </td>
          </tr>

          {/* Profile */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Profile</span>
                <HelpTooltip
                  description={HELP_CONTENT.profile.description}
                  articles={HELP_CONTENT.profile.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.profile}
                  step={1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "profile",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">%</span>
              </div>
            </td>
          </tr>

          {/* Tire Width */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Tire width</span>
                <HelpTooltip
                  description={HELP_CONTENT.tireWidth.description}
                  articles={HELP_CONTENT.tireWidth.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.tireWidth}
                  step={5}
                  onInput={(e) =>
                    setVehicleInputs(
                      "tireWidth",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">mm</span>
              </div>
            </td>
          </tr>

          {/* CoG Height */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>CoG height</span>
                <HelpTooltip
                  description={HELP_CONTENT.cogHeight.description}
                  articles={HELP_CONTENT.cogHeight.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.cogHeight}
                  step={0.1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "cogHeight",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">in</span>
              </div>
            </td>
          </tr>

          {/* 0-100 km/h */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>0-100 km/h</span>
                <HelpTooltip
                  description={HELP_CONTENT.acceleration.description}
                  articles={HELP_CONTENT.acceleration.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.acceleration0to100}
                  step={0.1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "acceleration0to100",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">s</span>
              </div>
            </td>
          </tr>

          {/* Redline RPM */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Redline RPM</span>
                <HelpTooltip
                  description={HELP_CONTENT.redlineRpm.description}
                  articles={HELP_CONTENT.redlineRpm.articles}
                  videos={HELP_CONTENT.redlineRpm.videos}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.redlineRpm}
                  step={100}
                  min={3000}
                  max={15000}
                  onInput={(e) =>
                    setVehicleInputs(
                      "redlineRpm",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">rpm</span>
              </div>
            </td>
          </tr>

          {/* Max Speed @ 118m radius */}
          <tr>
            <td class="border-r border-b border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Max speed @ 118m</span>
                <HelpTooltip
                  description={HELP_CONTENT.maxSpeed118m.description}
                  articles={HELP_CONTENT.maxSpeed118m.articles}
                />
              </div>
            </td>
            <td class="border-b border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center">
                <input
                  type="number"
                  value={vehicleInputs.maxSpeed118mRadius}
                  step={1}
                  onInput={(e) =>
                    setVehicleInputs(
                      "maxSpeed118mRadius",
                      parseFloat(e.currentTarget.value) || 0,
                    )
                  }
                  class="flex-1 px-3 py-2 bg-transparent text-neutral-400 focus:outline-none focus:text-emerald-400"
                />
                <span class="px-3 py-2 text-neutral-500 text-xs">km/h</span>
              </div>
            </td>
          </tr>

          {/* Drivetrain - Segmented */}
          <tr>
            <td class="border-r border-neutral-800/50 px-3 py-2 text-xs uppercase tracking-wide text-neutral-400 bg-neutral-900/50">
              <div class="flex items-center justify-between">
                <span>Drivetrain</span>
                <HelpTooltip
                  description={HELP_CONTENT.drivetrain.description}
                  articles={HELP_CONTENT.drivetrain.articles}
                />
              </div>
            </td>
            <td class="border-neutral-800/50 p-0 bg-neutral-800/40">
              <div class="flex items-center px-2 py-1.5">
                <div class="flex gap-0.5">
                  <For each={[...DRIVETRAIN_OPTIONS]}>
                    {(option) => (
                      <button
                        type="button"
                        onClick={() => setVehicleInputs("drivetrain", option)}
                        class="px-3 py-1 text-xs transition-all duration-100"
                        classList={{
                          "bg-neutral-500/20 text-neutral-400 border border-neutral-500/50":
                            vehicleInputs.drivetrain === option,
                          "bg-neutral-900/50 text-neutral-500 border border-neutral-700/50 hover:text-neutral-300":
                            vehicleInputs.drivetrain !== option,
                        }}
                      >
                        {option}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
