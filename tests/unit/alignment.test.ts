import { describe, it, expect } from "vitest";
import { calculateAlignmentOutputs } from "@/features/alignment/alignment";
import { gripAlignment, driftAlignment, streetAlignment, dragAlignment } from "../fixtures";

describe("calculateAlignmentOutputs", () => {
  it("returns valid alignment outputs for grip setup", () => {
    const result = calculateAlignmentOutputs(gripAlignment);

    expect(result.understeerTendency).toBeDefined();
    expect(result.oversteerTendency).toBeDefined();
    expect(result.turnInResponse).toBeDefined();
    expect(result.straightLineStability).toBeGreaterThan(0);
    expect(result.frontCamberGain).toBeGreaterThan(0);
    expect(result.rearCamberGain).toBeGreaterThan(0);
    expect(result.contactPatchFront).toBeLessThanOrEqual(100);
    expect(result.contactPatchRear).toBeLessThanOrEqual(100);
    expect(result.innerWheelAngle).toBeGreaterThan(0);
    expect(result.outerWheelAngle).toBeGreaterThan(0);
    expect(result.ackermannType).toBeDefined();
    expect(result.scrubRadiusEstimate).toBeDefined();
    expect(result.recommendations).toBeInstanceOf(Array);
  });

  it("returns sharp turn-in response for very negative front toe", () => {
    const toeOut = { ...gripAlignment, frontToe: -1.0 };
    const result = calculateAlignmentOutputs(toeOut);
    expect(result.turnInResponse).toBe("sharp");
  });

  it("returns moderate turn-in response for small toe values", () => {
    const smallToe = { ...gripAlignment, frontToe: -0.2 };
    const result = calculateAlignmentOutputs(smallToe);
    expect(result.turnInResponse).toBe("moderate");
  });

  it("detects positive Ackermann when frontAckermann > 10", () => {
    const positiveAckermann = { ...gripAlignment, frontAckermann: 15 };
    const result = calculateAlignmentOutputs(positiveAckermann);
    expect(result.ackermannType).toBe("positive");
  });

  it("detects reverse Ackermann when frontAckermann < -10", () => {
    const reverseAckermann = { ...gripAlignment, frontAckermann: -15 };
    const result = calculateAlignmentOutputs(reverseAckermann);
    expect(result.ackermannType).toBe("reverse");
  });

  it("detects parallel Ackermann for small values", () => {
    const parallelAckermann = { ...gripAlignment, frontAckermann: 5 };
    const result = calculateAlignmentOutputs(parallelAckermann);
    expect(result.ackermannType).toBe("parallel");
  });

  it("calculates higher front camber gain with more negative camber", () => {
    const aggressiveCamber = { ...gripAlignment, frontCamber: -5 };
    const mildCamber = { ...gripAlignment, frontCamber: -2 };
    const resultAggressive = calculateAlignmentOutputs(aggressiveCamber);
    const resultMild = calculateAlignmentOutputs(mildCamber);
    expect(resultAggressive.frontCamberGain).toBeGreaterThan(resultMild.frontCamberGain);
  });

  it("understeer tendency opposes oversteer tendency", () => {
    const result = calculateAlignmentOutputs(gripAlignment);
    expect(result.understeerTendency).toBe(-result.oversteerTendency);
  });

  it("front grip factor increases with more negative camber", () => {
    const aggressive = { ...gripAlignment, frontCamber: -4.5 };
    const mild = { ...gripAlignment, frontCamber: -1.5 };
    const resultAggressive = calculateAlignmentOutputs(aggressive);
    const resultMild = calculateAlignmentOutputs(mild);
    expect(resultAggressive.frontCamberGain).toBeGreaterThan(resultMild.frontCamberGain);
  });

  it("recommends toe out for slow turn-in response", () => {
    const toeIn = { ...gripAlignment, frontToe: 1.0 };
    const result = calculateAlignmentOutputs(toeIn);
    expect(result.recommendations.some(r => r.toLowerCase().includes("toe"))).toBe(true);
  });

  it("recommends reducing rear toe out for poor straight-line stability", () => {
    const unstable = { ...gripAlignment, rearToe: -2.0, frontToe: 0.5 };
    const result = calculateAlignmentOutputs(unstable);
    expect(result.recommendations.some(r => r.toLowerCase().includes("rear toe"))).toBe(true);
  });

  it("recommends monitoring inner tire wear for aggressive front camber", () => {
    const veryAggressive = { ...gripAlignment, frontCamber: -6 };
    const result = calculateAlignmentOutputs(veryAggressive);
    expect(result.recommendations.some(r => r.toLowerCase().includes("inner tire wear"))).toBe(true);
  });

  it("warns about reverse Ackermann", () => {
    const reverse = { ...gripAlignment, frontAckermann: -15 };
    const result = calculateAlignmentOutputs(reverse);
    expect(result.recommendations.some(r => r.toLowerCase().includes("ackermann"))).toBe(true);
  });

  it("drift alignment has different characteristics than grip", () => {
    const gripResult = calculateAlignmentOutputs(gripAlignment);
    const driftResult = calculateAlignmentOutputs(driftAlignment);
    expect(gripResult.understeerTendency).not.toBe(driftResult.understeerTendency);
  });

  it("street alignment has moderate characteristics", () => {
    const result = calculateAlignmentOutputs(streetAlignment);
    expect(result.turnInResponse).toBe("moderate");
    expect(result.straightLineStability).toBeGreaterThanOrEqual(50);
  });

  it("contact patch percentage decreases with more negative camber", () => {
    const flat = { ...gripAlignment, frontCamber: -0.5 };
    const aggressive = { ...gripAlignment, frontCamber: -5 };
    const resultFlat = calculateAlignmentOutputs(flat);
    const resultAggressive = calculateAlignmentOutputs(aggressive);
    expect(resultFlat.contactPatchFront).toBeGreaterThan(resultAggressive.contactPatchFront);
  });

  it("outer wheel angle is less than inner wheel angle with positive Ackermann", () => {
    const ackermann = { ...gripAlignment, frontAckermann: 20 };
    const result = calculateAlignmentOutputs(ackermann);
    expect(result.outerWheelAngle).toBeLessThan(result.innerWheelAngle);
  });

  it("scrub radius estimate scales with caster angle", () => {
    const lowCaster = { ...gripAlignment, frontCaster: 3 };
    const highCaster = { ...gripAlignment, frontCaster: 7 };
    const resultLow = calculateAlignmentOutputs(lowCaster);
    const resultHigh = calculateAlignmentOutputs(highCaster);
    expect(resultHigh.scrubRadiusEstimate).toBeGreaterThan(resultLow.scrubRadiusEstimate);
  });

  it("understeer tendency increases with front grip advantage", () => {
    const frontGrippy = { ...gripAlignment, frontCamber: -4, rearCamber: -1.5 };
    const balanced = { ...gripAlignment, frontCamber: -3, rearCamber: -2.5 };
    const resultFront = calculateAlignmentOutputs(frontGrippy);
    const resultBalanced = calculateAlignmentOutputs(balanced);
    expect(resultFront.understeerTendency).toBeGreaterThan(resultBalanced.understeerTendency);
  });
});
