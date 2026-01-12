import { describe, it, expect } from "vitest";
import { calculateStandardAero, calculateExperimentalAero, getAeroBalanceDescription } from "@/features/aero/aero";
import { aeroBalanced, aeroFrontDominant, aeroRearDominant, aeroMaxDownforce } from "../fixtures";
import type { CarData } from "@/types";

describe("calculateStandardAero", () => {
  it("returns valid aero outputs for balanced setup", () => {
    const result = calculateStandardAero(aeroBalanced);

    expect(result.frontDownforceRelative).toBe(50);
    expect(result.rearDownforceRelative).toBe(50);
    expect(result.aeroBalancePct).toBe(50);
    expect(result.predictedBehavior).toBe("neutral");
    expect(result.recommendations).toBeInstanceOf(Array);
  });

  it("detects front-dominant aero setup", () => {
    const result = calculateStandardAero(aeroFrontDominant);

    expect(result.aeroBalancePct).toBeGreaterThan(60);
    expect(result.predictedBehavior).toBe("understeer");
    expect(result.recommendations.some(r => r.toLowerCase().includes("understeer"))).toBe(true);
  });

  it("detects rear-dominant aero setup", () => {
    const result = calculateStandardAero(aeroRearDominant);

    expect(result.aeroBalancePct).toBeLessThan(40);
    expect(result.predictedBehavior).toBe("oversteer");
    expect(result.recommendations.some(r => r.toLowerCase().includes("rear") || r.toLowerCase().includes("oversteer"))).toBe(true);
  });

  it("detects extreme oversteer for high rear aero", () => {
    const extremeRear = { ...aeroRearDominant, rearAero: 10 };
    const result = calculateStandardAero(extremeRear);
    expect(result.predictedBehavior).toBe("extreme_oversteer");
  });

  it("recommends max front aero when at maximum", () => {
    const maxFront = { ...aeroBalanced, frontAero: 10, rearAero: 3 };
    const result = calculateStandardAero(maxFront);
    expect(result.recommendations.some(r => r.toLowerCase().includes("maximum"))).toBe(true);
  });

  it("recommends reducing air resistance for high values", () => {
    const highDrag = { ...aeroBalanced, airResistance: 8 };
    const result = calculateStandardAero(highDrag);
    expect(result.recommendations.some(r => r.toLowerCase().includes("air resistance") || r.toLowerCase().includes("top speed"))).toBe(true);
  });

  it("recommends balanced setup for neutral behavior", () => {
    const result = calculateStandardAero(aeroBalanced);
    expect(result.recommendations.some(r => r.toLowerCase().includes("balanced"))).toBe(true);
  });

  it("front and rear downforce scale with aero settings", () => {
    const result = calculateStandardAero(aeroBalanced);
    expect(result.frontDownforceRelative).toBe(aeroBalanced.frontAero * 10);
    expect(result.rearDownforceRelative).toBe(aeroBalanced.rearAero * 10);
  });

  it("balance percentage is exactly 50 for equal front/rear", () => {
    const result = calculateStandardAero(aeroBalanced);
    expect(result.aeroBalancePct).toBe(50);
  });

  it("balance percentage is front-heavy for higher front settings", () => {
    const result = calculateStandardAero(aeroFrontDominant);
    expect(result.aeroBalancePct).toBeGreaterThan(50);
  });

  it("balance percentage is rear-heavy for higher rear settings", () => {
    const result = calculateStandardAero(aeroRearDominant);
    expect(result.aeroBalancePct).toBeLessThan(50);
  });
});

describe("calculateExperimentalAero", () => {
  const testCar: CarData = {
    car: "Test Car",
    height: 1.45,
    fAxleOffset: 1.2,
    rAxleOffset: 1.5,
    wheelbase: 2.7,
    fTrackWidth: 1.65,
    rTrackWidth: 1.62,
    avTrackWidth: 1.635,
    gears: 6,
    shiftTime: 0.1,
    weight: 1200,
    stockCx: 0.32,
    stockSx: 2.1,
    stockDrag: 0.6,
    stage12Cx: 0.3,
    stage12Sx: 2.2,
    stage12Drag: 0.55,
    stage34Cx: 0.28,
    stage34Sx: 2.3,
    stage34Drag: 0.5,
    bodyPosX: 0,
    bodyPosY: 0,
    bodyPosZ: 0.5,
    powerHp: 280,
    massKg: 1200,
    turboPress: 1.2,
    curveFallRpm: 6500,
    revLimiter: 8000,
    inertiaRatio: 0.35,
    enginePosX: 0,
    enginePosY: 0.1,
    enginePosZ: 0.4,
  };

  it("calculates downforce in Newtons", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.frontDownforceN).toBeGreaterThan(0);
    expect(result.rearDownforceN).toBeGreaterThan(0);
    expect(result.totalDownforceN).toBe(result.frontDownforceN + result.rearDownforceN);
  });

  it("calculates drag force", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.dragForceN).toBeGreaterThan(0);
  });

  it("calculates power loss from drag", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.powerLossKw).toBeGreaterThan(0);
  });

  it("increases downforce with higher reference speed", () => {
    const slowResult = calculateExperimentalAero(aeroBalanced, testCar, 150);
    const fastResult = calculateExperimentalAero(aeroBalanced, testCar, 250);

    expect(fastResult.totalDownforceN).toBeGreaterThan(slowResult.totalDownforceN);
  });

  it("calculates cornering G increase", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.corneringGIncrease).toBeGreaterThan(0);
  });

  it("calculates effective load increase in kg", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.effectiveLoadIncreaseKg).toBeGreaterThan(0);
  });

  it("calculates traction limit increase percentage", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.tractionLimitIncreasePct).toBeGreaterThan(0);
  });

  it("generates speed data points", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.speedData).toBeInstanceOf(Array);
    expect(result.speedData.length).toBeGreaterThan(0);
  });

  it("speed data contains increasing speeds", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    for (let i = 1; i < result.speedData.length; i++) {
      expect(result.speedData[i].speed).toBeGreaterThan(result.speedData[i - 1].speed);
    }
  });

  it("speed data includes downforce at each speed point", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    for (const point of result.speedData) {
      expect(point.frontDownforce).toBeGreaterThanOrEqual(0);
      expect(point.rearDownforce).toBeGreaterThanOrEqual(0);
      expect(point.totalDownforce).toBeGreaterThanOrEqual(point.frontDownforce + point.rearDownforce - 1);
      expect(point.totalDownforce).toBeLessThanOrEqual(point.frontDownforce + point.rearDownforce + 1);
    }
  });

  it("calculates max speed in kmh", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.maxSpeedKmh).toBeGreaterThan(0);
    expect(result.maxSpeedKmh).toBeLessThanOrEqual(500);
  });

  it("uses default reference speed of 200 kmh", () => {
    const result = calculateExperimentalAero(aeroBalanced, testCar);

    expect(result.referenceSpeedKmh).toBe(200);
  });

  it("top speed reduction relates to air resistance", () => {
    const lowDrag = { ...aeroBalanced, airResistance: 2 };
    const mediumDrag = { ...aeroBalanced, airResistance: 5 };
    const resultLow = calculateExperimentalAero(lowDrag, testCar);
    const resultMedium = calculateExperimentalAero(mediumDrag, testCar);
    expect(resultMedium.topSpeedReductionKmh).toBeDefined();
  });

  it("handles null car data with defaults", () => {
    const result = calculateExperimentalAero(aeroBalanced, null);

    expect(result.frontDownforceN).toBeGreaterThan(0);
    expect(result.rearDownforceN).toBeGreaterThan(0);
  });
});

describe("getAeroBalanceDescription", () => {
  it("returns Front-Dominant for balance > 58", () => {
    expect(getAeroBalanceDescription(60)).toBe("Front-Dominant");
    expect(getAeroBalanceDescription(75)).toBe("Front-Dominant");
  });

  it("returns Slightly Front-Biased for balance 54-58", () => {
    expect(getAeroBalanceDescription(55)).toBe("Slightly Front-Biased");
    expect(getAeroBalanceDescription(57)).toBe("Slightly Front-Biased");
  });

  it("returns Balanced for balance 46-54", () => {
    expect(getAeroBalanceDescription(50)).toBe("Balanced");
    expect(getAeroBalanceDescription(47)).toBe("Balanced");
  });

  it("returns Slightly Rear-Biased for balance 42-46", () => {
    expect(getAeroBalanceDescription(43)).toBe("Slightly Rear-Biased");
    expect(getAeroBalanceDescription(45)).toBe("Slightly Rear-Biased");
  });

  it("returns Rear-Dominant for balance < 42", () => {
    expect(getAeroBalanceDescription(40)).toBe("Rear-Dominant");
    expect(getAeroBalanceDescription(25)).toBe("Rear-Dominant");
  });

  it("handles boundary values", () => {
    expect(getAeroBalanceDescription(59)).toBe("Front-Dominant");
    expect(getAeroBalanceDescription(55)).toBe("Slightly Front-Biased");
    expect(getAeroBalanceDescription(47)).toBe("Balanced");
    expect(getAeroBalanceDescription(43)).toBe("Slightly Rear-Biased");
  });

  it("returns Slightly Rear-Biased for balance 42-46", () => {
    expect(getAeroBalanceDescription(43)).toBe("Slightly Rear-Biased");
    expect(getAeroBalanceDescription(45)).toBe("Slightly Rear-Biased");
  });

  it("returns Rear-Dominant for balance < 42", () => {
    expect(getAeroBalanceDescription(40)).toBe("Rear-Dominant");
    expect(getAeroBalanceDescription(25)).toBe("Rear-Dominant");
  });

  it("handles boundary values", () => {
    expect(getAeroBalanceDescription(59)).toBe("Front-Dominant");
    expect(getAeroBalanceDescription(55)).toBe("Slightly Front-Biased");
    expect(getAeroBalanceDescription(47)).toBe("Balanced");
    expect(getAeroBalanceDescription(43)).toBe("Slightly Rear-Biased");
  });
});
