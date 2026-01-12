import { describe, it, expect } from "vitest";
import { formatFieldValue, getImpactColor, getCategoryIcon, compareTwoSetups } from "@/features/setups/comparison/core";
import { createSetup } from "../fixtures/alignment";

describe("formatFieldValue", () => {
  it("formats null/undefined as dashes", () => {
    expect(formatFieldValue(null, "field")).toBe("-");
    expect(formatFieldValue(undefined, "field")).toBe("-");
  });

  it("formats gear ratios correctly", () => {
    const gearRatios = [{ ratio: 3.5 }, { ratio: 2.1 }, { ratio: 1.5 }];
    const result = formatFieldValue(gearRatios, "gearRatios");
    expect(result).toContain("G1: 3.50");
    expect(result).toContain("G2: 2.10");
    expect(result).toContain("G3: 1.50");
  });

  it("formats arrays as item count", () => {
    const result = formatFieldValue([1, 2, 3], "someArray");
    expect(result).toBe("[3 items]");
  });

  it("formats front/rear objects correctly", () => {
    const result = formatFieldValue({ front: 10.5, rear: 20.3 }, "test");
    expect(result).toContain("F: 10.5");
    expect(result).toContain("R: 20.3");
  });

  it("formats frequency values with 3 decimal places", () => {
    expect(formatFieldValue(1.5, "Frequency")).toBe("1.500");
    expect(formatFieldValue(1.234, "desiredRideFrequency")).toBe("1.234");
  });

  it("formats weight values with percentage", () => {
    expect(formatFieldValue(55.5, "Weight")).toBe("55.5%");
    expect(formatFieldValue(60, "frontWeightDistribution")).toBe("60.0%");
  });

  it("formats ratio values with 2 decimal places", () => {
    expect(formatFieldValue(3.5, "Ratio")).toBe("3.50");
  });

  it("formats RPM values without decimals", () => {
    expect(formatFieldValue(8000.5, "Rpm")).toBe("8001");
  });

  it("formats boolean values as Yes/No", () => {
    expect(formatFieldValue(true, "flag")).toBe("Yes");
    expect(formatFieldValue(false, "flag")).toBe("No");
  });
});

describe("getImpactColor", () => {
  it("returns red for high impact", () => {
    expect(getImpactColor("high")).toBe("#ef4444");
  });

  it("returns amber for medium impact", () => {
    expect(getImpactColor("medium")).toBe("#f59e0b");
  });

  it("returns green for low impact", () => {
    expect(getImpactColor("low")).toBe("#22c55e");
  });
});

describe("getCategoryIcon", () => {
  it("returns gear icon for general", () => {
    expect(getCategoryIcon("general")).toBe("⚙️");
  });

  it("returns wrench icon for suspension", () => {
    expect(getCategoryIcon("suspension")).toBe("🔧");
  });

  it("returns lightning icon for gearbox", () => {
    expect(getCategoryIcon("gearbox")).toBe("⚡");
  });

  it("returns wind icon for aero", () => {
    expect(getCategoryIcon("aero")).toBe("💨");
  });

  it("returns ruler icon for alignment", () => {
    expect(getCategoryIcon("alignment")).toBe("📐");
  });

  it("returns dot for unknown categories", () => {
    expect(getCategoryIcon("unknown")).toBe("•");
  });
});

describe("compareTwoSetups", () => {
  it("returns valid comparison for two different setups", () => {
    const setupA = createSetup({ name: "Setup A" });
    const setupB = createSetup({
      name: "Setup B",
      inputs: { ...setupA.inputs, weight: 1300 },
    });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.setupA).toBe(setupA);
    expect(result.setupB).toBe(setupB);
    expect(result.categories).toBeInstanceOf(Array);
    expect(result.summary.totalDiffs).toBeGreaterThan(0);
    expect(result.summary.highImpact).toBeGreaterThan(0);
  });

  it("returns comparison result for different setups", () => {
    const setupA = createSetup({ name: "Setup A", createdAt: 1000, updatedAt: 1000, inputs: { ...createSetup().inputs, weight: 1000 } });
    const setupB = createSetup({ name: "Setup B", createdAt: 1000, updatedAt: 1000, inputs: { ...createSetup().inputs, weight: 1500 } });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.setupA).toBe(setupA);
    expect(result.setupB).toBe(setupB);
    expect(result.categories).toBeInstanceOf(Array);
    expect(result.summary.totalDiffs).toBeGreaterThan(0);
  });

  it("identifies differences in gear ratios", () => {
    const setupA = createSetup();
    const setupB = createSetup({
      gearRatios: setupA.gearRatios.map((g, i) =>
        i === 0 ? { ...g, ratio: g.ratio + 0.5 } : g
      ),
    });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.totalDiffs).toBeGreaterThan(0);
  });

  it("identifies tire compound differences", () => {
    const setupA = createSetup({ tireCompound: "sport" });
    const setupB = createSetup({ tireCompound: "racing" });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.totalDiffs).toBeGreaterThan(0);
  });

  it("identifies traction mode differences", () => {
    const setupA = createSetup({ tractionMode: "rolling" });
    const setupB = createSetup({ tractionMode: "launch" });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.totalDiffs).toBeGreaterThan(0);
  });

  it("identifies aero settings differences", () => {
    const setupA = createSetup({
      aeroSettings: { frontAero: 5, rearAero: 5, airResistance: 3 },
    });
    const setupB = createSetup({
      aeroSettings: { frontAero: 7, rearAero: 7, airResistance: 5 },
    });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.totalDiffs).toBeGreaterThan(0);
  });

  it("identifies alignment differences", () => {
    const setupA = createSetup({
      alignmentInputs: { frontCamber: -3.5, frontCaster: 5, frontToe: -0.2, frontAckermann: 0, frontSteeringSensitivity: 50, rearCamber: -2.5, rearToe: -0.1, maxSteeringAngle: 38 },
    });
    const setupB = createSetup({
      alignmentInputs: { frontCamber: -4.0, frontCaster: 6, frontToe: 0, frontAckermann: 10, frontSteeringSensitivity: 55, rearCamber: -1.5, rearToe: 0, maxSteeringAngle: 40 },
    });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.totalDiffs).toBeGreaterThan(0);
  });

  it("includes all categories in the result", () => {
    const setupA = createSetup();
    const setupB = createSetup({ inputs: { ...setupA.inputs, weight: 1400 } });

    const result = compareTwoSetups(setupA, setupB);

    const categoryNames = result.categories.map(c => c.name);
    expect(categoryNames).toContain("general");
    expect(categoryNames).toContain("suspension");
    expect(categoryNames).toContain("gearbox");
    expect(categoryNames).toContain("aero");
    expect(categoryNames).toContain("alignment");
  });

  it("counts impact levels correctly", () => {
    const setupA = createSetup();
    const setupB = createSetup({ inputs: { ...setupA.inputs, weight: 1800 } });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.totalDiffs).toBeGreaterThanOrEqual(result.summary.highImpact);
    expect(result.summary.totalDiffs).toBeGreaterThanOrEqual(result.summary.mediumImpact);
    expect(result.summary.totalDiffs).toBeGreaterThanOrEqual(result.summary.lowImpact);
  });

  it("handles missing alignment inputs", () => {
    const setupA = createSetup();
    const setupB = createSetup();
    setupB.alignmentInputs = undefined;

    const result = compareTwoSetups(setupA, setupB);

    expect(result.categories.some(c => c.name === "alignment")).toBe(true);
  });

  it("categories contain field-level differences", () => {
    const setupA = createSetup({ inputs: { ...createSetup().inputs, weight: 1000 } });
    const setupB = createSetup({ inputs: { ...createSetup().inputs, weight: 1500 } });

    const result = compareTwoSetups(setupA, setupB);

    const generalCategory = result.categories.find(c => c.name === "general");
    expect(generalCategory).toBeDefined();
    expect(generalCategory!.fields.length).toBeGreaterThan(0);
  });

  it("high impact changes affect summary counts", () => {
    const setupA = createSetup({ inputs: { ...createSetup().inputs, magicNumber: 50 } });
    const setupB = createSetup({ inputs: { ...createSetup().inputs, magicNumber: 80 } });

    const result = compareTwoSetups(setupA, setupB);

    expect(result.summary.highImpact).toBeGreaterThan(0);
  });
});
