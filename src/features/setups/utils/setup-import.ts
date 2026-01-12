import type { SavedSetup } from "@/types";
import type { ShareSetupData } from "../utils/share";

export interface ImportOptions {
  replaceExisting?: boolean;
  generateNewIds?: boolean;
}

export interface ExportOptions {
  includeNotes?: boolean;
  minify?: boolean;
}

export interface ImportResult {
  success: boolean;
  setups: SavedSetup[];
  errors: ImportError[];
}

export interface ImportError {
  index: number;
  message: string;
  field?: string;
}

export interface ExportResult {
  data: string;
  filename: string;
}

const MIN_VERSION = 1;
const CURRENT_DATA_VERSION = 1;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function validateSetup(data: Record<string, unknown>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof data !== "object" || data === null) {
    return { valid: false, errors: ["Data is not an object"] };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== "string") {
    errors.push("Missing or invalid id");
  }
  if (typeof obj.name !== "string") {
    errors.push("Missing or invalid name");
  }
  if (typeof obj.inputs !== "object" || obj.inputs === null) {
    errors.push("Missing or invalid inputs");
  }
  if (obj.version !== undefined && typeof obj.version !== "number") {
    errors.push("Invalid version");
  }
  if (
    obj.version !== undefined &&
    (obj.version ?? Number.MAX_SAFE_INTEGER) < MIN_VERSION
  ) {
    errors.push(
      `Version ${obj.version} is not supported. Minimum required: ${MIN_VERSION}`,
    );
  }

  return { valid: errors.length === 0, errors };
}

export function exportToJSON(
  setups: SavedSetup[],
  options: ExportOptions = {},
): string {
  const { includeNotes = true, minify = false } = options;

  const data = setups.map((setup) => {
    const exportData: Record<string, unknown> = {
      id: setup.id,
      name: setup.name,
      description: setup.description,
      tags: setup.tags,
      carName: setup.carName,
      createdAt: setup.createdAt,
      updatedAt: setup.updatedAt,
      version: setup.version,
      inputs: setup.inputs,
      torqueRpmData: setup.torqueRpmData,
      gearRatios: setup.gearRatios,
      finalDrive: setup.finalDrive,
      tireCompound: setup.tireCompound,
      tractionMode: setup.tractionMode,
      aeroSettings: setup.aeroSettings,
    };

    if (setup.alignmentInputs) {
      exportData.alignmentInputs = setup.alignmentInputs;
    }

    if (includeNotes) {
      exportData.notes = setup.notes;
    }

    return exportData;
  });

  return minify ? JSON.stringify(data) : JSON.stringify(data, null, 2);
}

export function downloadJSON(
  setups: SavedSetup[],
  filename?: string,
  options: ExportOptions = {},
): void {
  const json = exportToJSON(setups, options);
  const name =
    filename ?? `gearx-setups-${new Date().toISOString().split("T")[0]}.json`;
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(
  jsonData: string,
  options: ImportOptions = {},
): ImportResult {
  const { replaceExisting = false, generateNewIds = false } = options;
  const errors: ImportError[] = [];
  const setups: SavedSetup[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonData);
  } catch (e) {
    return {
      success: false,
      setups: [],
      errors: [
        {
          index: 0,
          message: `JSON parse error: ${e instanceof Error ? e.message : "Unknown error"}`,
        },
      ],
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      success: false,
      setups: [],
      errors: [{ index: 0, message: "Expected an array of setups" }],
    };
  }

  parsed.forEach((item, index) => {
    const validation = validateSetup(item as Record<string, unknown>);

    if (!validation.valid) {
      errors.push({
        index,
        message: validation.errors.join("; "),
      });
      return;
    }

    const setup = item as SavedSetup;

    if (generateNewIds) {
      setup.id = generateId();
    }

    if (!replaceExisting) {
      setups.push(setup);
    }
  });

  return {
    success: errors.length === 0,
    setups,
    errors,
  };
}

export function importFromFile(
  file: File,
  options: ImportOptions = {},
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = importFromJSON(reader.result as string, options);
      resolve(result);
    };

    reader.onerror = () => {
      resolve({
        success: false,
        setups: [],
        errors: [{ index: 0, message: "Failed to read file" }],
      });
    };

    reader.readAsText(file);
  });
}

export function createShareDataFromSetup(setup: SavedSetup): ShareSetupData {
  return {
    version: 1,
    inputs: setup.inputs,
    torqueRpmData: setup.torqueRpmData,
    gearRatios: setup.gearRatios,
    finalDrive: setup.finalDrive,
    tireCompound: setup.tireCompound,
    tractionMode: setup.tractionMode,
    aeroSettings: setup.aeroSettings,
    alignmentInputs: setup.alignmentInputs,
  };
}

export function validateImportVersion(version: number): {
  valid: boolean;
  message: string;
} {
  if (version < MIN_VERSION) {
    return {
      valid: false,
      message: `Version ${version} is not supported. Please import a newer format.`,
    };
  }
  if (version > CURRENT_DATA_VERSION) {
    return {
      valid: false,
      message: `Version ${version} may not be fully compatible. Some data might be lost.`,
    };
  }
  return { valid: true, message: "Version compatible" };
}

export function generateSetupSummary(setup: SavedSetup): string {
  const lines: string[] = [
    `${setup.name}`,
    `Car: ${setup.carName}`,
    `Created: ${new Date(setup.createdAt).toLocaleDateString()}`,
  ];

  if (setup.tags.length > 0) {
    lines.push(`Tags: ${setup.tags.map((t) => t.name).join(", ")}`);
  }

  if (setup.notes) {
    lines.push(
      `Notes: ${setup.notes.substring(0, 100)}${setup.notes.length > 100 ? "..." : ""}`,
    );
  }

  return lines.join("\n");
}
