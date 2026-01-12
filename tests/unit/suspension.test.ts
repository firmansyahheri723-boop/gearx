import { describe, it, expect } from "vitest";
import { calculateSuspensionOutputs } from "@/features/suspension/suspension";
import { suspensionInputs, suspensionInputsWithAero, highPerformanceCar } from "../fixtures";

describe("calculateSuspensionOutputs", () => {
  it("returns valid suspension outputs for base inputs", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.springs.frontSprungMass).toBe(310);
    expect(result.springs.rearSprungMass).toBe(250);
    expect(result.springs.frontStiffness).toBeGreaterThan(0);
    expect(result.springs.rearStiffness).toBeGreaterThan(0);
    expect(result.dampers.critDampingFront).toBeGreaterThan(0);
    expect(result.dampers.critDampingRear).toBeGreaterThan(0);
    expect(result.acceleration.longitudinalAccelG).toBeGreaterThan(0);
    expect(result.acceleration.lateralAccelG).toBeGreaterThan(0);
    expect(result.antiRollBars.rarb).toBeDefined();
  });

  it("includes experimental section when aero is present", () => {
    const result = calculateSuspensionOutputs(suspensionInputsWithAero);

    expect(result.experimental).toBeDefined();
    expect(result.experimental!.aeroFrontLoadKg).toBeGreaterThan(0);
    expect(result.experimental!.aeroRearLoadKg).toBeGreaterThan(0);
    expect(result.experimental!.adjustedFrontSprungMass).toBeGreaterThan(result.springs.frontSprungMass);
    expect(result.experimental!.adjustedRearSprungMass).toBeGreaterThan(result.springs.rearSprungMass);
  });

  it("does not include experimental section when no aero", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.experimental).toBeUndefined();
  });

  it("calculates correct front bias on acceleration", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.acceleration.frontBiasOnAccel).toBeLessThan(55);
    expect(result.acceleration.rearBiasOnAccel).toBeGreaterThan(45);
  });

  it("handles high performance car inputs", () => {
    const result = calculateSuspensionOutputs(highPerformanceCar);

    expect(result.springs.frontSprungMass).toBe(329);
    expect(result.springs.rearSprungMass).toBe(302);
    expect(result.springs.frontStiffness).toBeGreaterThan(result.springs.rearStiffness);
  });

  it("calculates roll center to CoG distance", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.antiRollBars.rollCenterToCoG).toBe(0.4);
  });

  it("rear springs are softer than front for front-heavy distribution", () => {
    const frontHeavyInputs = { ...suspensionInputs, frontWeightDistribution: 60 };
    const result = calculateSuspensionOutputs(frontHeavyInputs);

    expect(result.springs.rearStiffness).toBeLessThan(result.springs.frontStiffness);
  });

  it("damping forces scale correctly with damping ratio", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.dampers.dampingForceFront).toBe(
      result.dampers.critDampingFront * suspensionInputs.dampingRatio
    );
  });

  it("bump damping is 2/3 of total damping force", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.dampers.bumpFront).toBeCloseTo(result.dampers.dampingForceFront * (2/3), 1);
    expect(result.dampers.bumpRear).toBeCloseTo(result.dampers.dampingForceRear * (2/3), 1);
  });

  it("rebound damping is 1.5x of total damping force", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.dampers.reboundFront).toBeCloseTo(result.dampers.dampingForceFront * 1.5, 1);
    expect(result.dampers.reboundRear).toBeCloseTo(result.dampers.dampingForceRear * 1.5, 1);
  });

  it("lateral acceleration increases with speed", () => {
    const slowResult = calculateSuspensionOutputs({ ...suspensionInputs, maxSpeed118mRadius: 50 });
    const fastResult = calculateSuspensionOutputs({ ...suspensionInputs, maxSpeed118mRadius: 100 });

    expect(fastResult.acceleration.lateralAccelG).toBeGreaterThan(slowResult.acceleration.lateralAccelG);
  });

  it("weight transfer scales with acceleration", () => {
    const slowResult = calculateSuspensionOutputs({ ...suspensionInputs, acceleration0to100: 10 });
    const fastResult = calculateSuspensionOutputs({ ...suspensionInputs, acceleration0to100: 4 });

    expect(fastResult.acceleration.weightTransfer).toBeGreaterThan(slowResult.acceleration.weightTransfer);
  });

  it("rear weight increases on acceleration due to weight transfer", () => {
    const result = calculateSuspensionOutputs(suspensionInputs);

    expect(result.acceleration.rearWeightOnAccel).toBeGreaterThan(result.acceleration.frontWeightOnAccel);
  });

  it("sprung mass includes aero load when downforce is present", () => {
    const withAero = calculateSuspensionOutputs(suspensionInputsWithAero);
    const withoutAero = calculateSuspensionOutputs(suspensionInputs);

    expect(withAero.springs.frontSprungMass).toBeGreaterThan(withoutAero.springs.frontSprungMass);
    expect(withAero.springs.rearSprungMass).toBeGreaterThan(withoutAero.springs.rearSprungMass);
  });

  it("total stiffness increases when aero adds load", () => {
    const withAero = calculateSuspensionOutputs(suspensionInputsWithAero);
    const withoutAero = calculateSuspensionOutputs(suspensionInputs);

    expect(withAero.springs.frontStiffness).toBeGreaterThan(withoutAero.springs.frontStiffness);
    expect(withAero.springs.rearStiffness).toBeGreaterThan(withoutAero.springs.rearStiffness);
  });
});
