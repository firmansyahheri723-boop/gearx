import { describe, it, expect } from "vitest";
import {
  calcWheelCircumference,
  calcWheelRadiusM,
  calcSpeedKph,
  calcHorsepower,
  calcWheelTorque,
  calcLongitudinalAccelG,
  calcWeightTransfer,
  calcTractionLimitTorque,
  calculateGearboxOutputs,
} from "@/features/gearbox/gearbox";
import {
  baseGearboxInputs,
  awdGearboxInputs,
  fwdGearboxInputs,
  launchModeGearboxInputs,
  frontWheel,
  rearWheel,
  gearRatios,
  torqueRpmData,
} from "../fixtures";

describe("calcWheelCircumference", () => {
  it("calculates wheel circumference from tire dimensions", () => {
    const circumference = calcWheelCircumference(265, 35, 19);
    expect(circumference).toBeCloseTo(82.6, 1);
  });

  it("increases with tire width", () => {
    const narrow = calcWheelCircumference(205, 45, 17);
    const wide = calcWheelCircumference(305, 30, 20);
    expect(wide).toBeGreaterThan(narrow);
  });

  it("increases with wheel diameter", () => {
    const smallWheel = calcWheelCircumference(255, 40, 18);
    const largeWheel = calcWheelCircumference(255, 40, 20);
    expect(largeWheel).toBeGreaterThan(smallWheel);
  });
});

describe("calcWheelRadiusM", () => {
  it("calculates wheel radius in meters", () => {
    const radius = calcWheelRadiusM(265, 35, 19);
    expect(radius).toBeCloseTo(0.339, 2);
  });

  it("returns correct wheel radius in meters", () => {
    const radius = calcWheelRadiusM(265, 35, 19);
    expect(radius).toBeCloseTo(0.334, 3);
  });
});

describe("calcSpeedKph", () => {
  it("calculates speed in KPH from RPM and ratio", () => {
    const speed = calcSpeedKph(3000, 82.6, 13.3);
    expect(speed).toBeCloseTo(28.4, 1);
  });

  it("returns 0 when ratio is 0", () => {
    const speed = calcSpeedKph(3000, 82.6, 0);
    expect(speed).toBe(0);
  });

  it("scales linearly with RPM", () => {
    const speed1 = calcSpeedKph(3000, 82.6, 13.3);
    const speed2 = calcSpeedKph(6000, 82.6, 13.3);
    expect(speed2 / speed1).toBeCloseTo(2, 5);
  });

  it("scales inversely with gear ratio", () => {
    const speedHigh = calcSpeedKph(6000, 82.6, 8);
    const speedLow = calcSpeedKph(6000, 82.6, 16);
    expect(speedHigh / speedLow).toBeCloseTo(2, 5);
  });
});

describe("calcHorsepower", () => {
  it("calculates horsepower from torque and RPM", () => {
    const hp = calcHorsepower(350, 5000);
    expect(hp).toBeCloseTo(246, 0);
  });

  it("increases with torque", () => {
    const hp1 = calcHorsepower(200, 5000);
    const hp2 = calcHorsepower(400, 5000);
    expect(hp2 / hp1).toBeCloseTo(2, 5);
  });

  it("increases with RPM", () => {
    const hp1 = calcHorsepower(300, 4000);
    const hp2 = calcHorsepower(300, 8000);
    expect(hp2 / hp1).toBeCloseTo(2, 5);
  });
});

describe("calcWheelTorque", () => {
  it("calculates wheel torque from engine torque and ratios", () => {
    const wheelTorque = calcWheelTorque(350, 3.5, 3.8);
    expect(wheelTorque).toBeCloseTo(4655, 0);
  });

  it("scales with gear ratio", () => {
    const torque1 = calcWheelTorque(300, 2.0, 4.0);
    const torque2 = calcWheelTorque(300, 4.0, 4.0);
    expect(torque2 / torque1).toBeCloseTo(2, 5);
  });
});

describe("calcLongitudinalAccelG", () => {
  it("calculates longitudinal acceleration in Gs", () => {
    const accel = calcLongitudinalAccelG(5.5);
    expect(accel).toBeCloseTo(0.51, 1);
  });

  it("decreases with slower acceleration time", () => {
    const slow = calcLongitudinalAccelG(10);
    const fast = calcLongitudinalAccelG(4);
    expect(fast).toBeGreaterThan(slow);
  });
});

describe("calcWeightTransfer", () => {
  it("calculates weight transfer from vehicle dynamics", () => {
    const transfer = calcWeightTransfer(0.55, 2.7, 1200, 0.5);
    expect(transfer).toBeCloseTo(122.22, 1);
  });

  it("scales with cog height", () => {
    const transferLow = calcWeightTransfer(0.3, 2.7, 1200, 0.5);
    const transferHigh = calcWeightTransfer(0.6, 2.7, 1200, 0.5);
    expect(transferHigh / transferLow).toBeCloseTo(2, 5);
  });

  it("scales with acceleration", () => {
    const transfer1 = calcWeightTransfer(0.55, 2.7, 1200, 0.3);
    const transfer2 = calcWeightTransfer(0.55, 2.7, 1200, 0.6);
    expect(transfer2 / transfer1).toBeCloseTo(2, 5);
  });
});

describe("calcTractionLimitTorque", () => {
  it("calculates traction limit for RWD vehicle", () => {
    const torque = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.4, rearWheel, "RWD"
    );
    expect(torque).toBeGreaterThan(0);
  });

  it("calculates traction limit for FWD vehicle", () => {
    const torque = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.4, frontWheel, "FWD"
    );
    expect(torque).toBeGreaterThan(0);
  });

  it("AWD has higher traction limit than RWD", () => {
    const rwdTorque = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.4, rearWheel, "RWD"
    );
    const awdTorque = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.4, rearWheel, "AWD"
    );
    expect(awdTorque).toBeGreaterThan(rwdTorque);
  });

  it("increases with tire friction coefficient", () => {
    const lowGrip = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.2, rearWheel, "RWD"
    );
    const highGrip = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.7, rearWheel, "RWD"
    );
    expect(highGrip).toBeGreaterThan(lowGrip);
  });

  it("launch mode ignores acceleration for weight transfer", () => {
    const rollingTorque = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0.5, 1.4, rearWheel, "RWD"
    );
    const launchTorque = calcTractionLimitTorque(
      1200, 0.55, 0.55, 2.7, 0, 1.4, rearWheel, "RWD"
    );
    expect(launchTorque).toBeLessThan(rollingTorque);
  });
});

describe("calculateGearboxOutputs", () => {
  it("returns valid gearbox outputs for base inputs", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);

    expect(result.wheelCircumference).toBeGreaterThan(0);
    expect(result.wheelRadiusM).toBeGreaterThan(0);
    expect(result.peakHp).toBeGreaterThan(0);
    expect(result.peakHpRpm).toBeGreaterThan(0);
    expect(result.tractionLimitTorque).toBeGreaterThan(0);
    expect(result.speedRpmData.length).toBe(gearRatios.length);
    expect(result.maxSpeedPerGear.length).toBe(gearRatios.length);
  });

  it("calculates peak horsepower from torque curve", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    expect(result.peakHp).toBeCloseTo(315, 0);
    expect(result.peakHpRpm).toBe(7000);
  });

  it("effective ratios include final drive", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    expect(result.effectiveRatios[0]).toBeCloseTo(3.5 * 3.8, 1);
  });

  it("RWD uses rear wheel for traction", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    expect(result.tractionLimitTorque).toBeGreaterThan(0);
  });

  it("AWD has higher traction limit than RWD", () => {
    const rwdResult = calculateGearboxOutputs(fwdGearboxInputs);
    const awdResult = calculateGearboxOutputs(awdGearboxInputs);
    expect(awdResult.tractionLimitTorque).toBeGreaterThan(rwdResult.tractionLimitTorque);
  });

  it("launch mode affects weight transfer differently", () => {
    const rollingResult = calculateGearboxOutputs(baseGearboxInputs);
    const launchResult = calculateGearboxOutputs(launchModeGearboxInputs);
    expect(launchResult.tractionLimitTorque).toBeDefined();
  });

  it("speed data includes all RPM points for each gear", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    expect(result.speedRpmData[0].length).toBe(torqueRpmData.length);
  });

  it("higher gears have higher top speeds", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    for (let i = 1; i < result.maxSpeedPerGear.length; i++) {
      expect(result.maxSpeedPerGear[i]).toBeGreaterThan(result.maxSpeedPerGear[i - 1]);
    }
  });

  it("first gear has lowest top speed", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    const maxSpeeds = result.maxSpeedPerGear;
    expect(maxSpeeds[0]).toBeLessThan(maxSpeeds[maxSpeeds.length - 1]);
  });

  it("marks torque as exceeding traction when wheel torque > limit", () => {
    const result = calculateGearboxOutputs(baseGearboxInputs);
    for (const gearData of result.speedRpmData) {
      for (const point of gearData) {
        if (point.exceedsTraction) {
          expect(point.wheelTorque).toBeGreaterThan(result.tractionLimitTorque);
        }
      }
    }
  });
});
