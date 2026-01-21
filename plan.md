# GearX Codebase Improvement Plan

This document outlines inconsistencies, issues, and improvement opportunities identified during codebase analysis.

## Table of Contents

1. [Critical Issues](#critical-issues)
2. [Naming Convention Issues](#naming-convention-issues)
3. [Component Pattern Issues](#component-pattern-issues)
4. [Store Pattern Issues](#store-pattern-issues)
5. [Calculation Pattern Issues](#calculation-pattern-issues)
6. [Architecture Issues](#architecture-issues)
7. [Recommendations by Priority](#recommendations-by-priority)

---

## Critical Issues

### Issue #1: Type Duplication

**Location:**
- `src/features/gearbox/types.ts`
- `src/features/aero/types.ts`
- `src/types/index.ts`

**Description:**
Types are duplicated between feature-specific type files and the central types index.

**Affected Types:**

```typescript
// Duplicated in src/features/gearbox/types.ts (already in @/types/index.ts)
export type SpeedRpmPoint = {
  rpm: number;
  speed: number;
  torque: number;
  wheelTorque: number;
  hp: number;
  exceedsTraction: boolean;
};

export type GearboxOutputs = {
  wheelCircumference: number;
  wheelRadiusM: number;
  effectiveRatios: number[];
  peakHp: number;
  peakHpRpm: number;
  tractionLimitTorque: number;
  speedRpmData: SpeedRpmPoint[][];
  maxSpeedPerGear: number[];
};
```

```typescript
// Duplicated in src/features/aero/types.ts (already in @/types/index.ts)
export type AeroSettings = {
  frontDownforceCoeff: number;
  rearDownforceCoeff: number;
  dragCoeff: number;
  frontWingArea: number;
  rearWingArea: number;
  carData: CarData | null;
};

export type AeroOutputs = {
  frontDownforceN: number;
  rearDownforceN: number;
  totalDownforceN: number;
  dragN: number;
  // ... more fields
};
```

**Impact:**
- Maintenance burden - changes must be made in multiple places
- Potential for type drift if one file is updated without the other
- Confusion about which file is the source of truth

**Fix:**
Delete `src/features/gearbox/types.ts` and `src/features/aero/types.ts`. Import types from `@/types/index.ts`.

---

### Issue #2: Missing Types in Central Index

**Location:** `src/features/suspension/suspension.ts`

**Description:**
Suspension-related types are defined inline instead of in the central types index.

**Affected Types:**
- `SuspensionInputs`
- `SuspensionOutputs`
- `SpringsOutput`
- `DampersOutput`
- `AntiRollBarsOutput`
- `AccelerationOutput`
- `WeightTransferResult`
- `TireLoadChange`

**Current Location:**
```typescript
// src/features/suspension/suspension.ts (lines 4-77)
export type SuspensionInputs = {
  weight: number;
  frontWeightDistribution: number;
  // ... 20+ more fields
};

export type SuspensionOutputs = {
  springStiffness: SpringsOutput;
  dampers: DampersOutput;
  antiRollBars: AntiRollBarsOutput;
  acceleration: AccelerationOutput;
};
```

**Impact:**
- Inconsistent with other features (Gearbox, Aero, Alignment all import from @/types)
- Harder to discover types
- No single source of truth

**Fix:**
Move all suspension types to `src/types/index.ts` alongside other feature types.

---

### Issue #3: Duplicate Function Definitions

**Location:**
- `src/features/suspension/suspension.ts` (lines 138-145)
- `src/features/gearbox/gearbox.ts` (lines 105-112)

**Description:**
`calcWeightTransfer` function is defined in both files.

**Duplicate Code:**

```typescript
// In suspension.ts
function calcWeightTransfer(
  weight: number,
  cgHeightM: number,
  trackWidthM: number,
  accelG: number
): number {
  return (weight * accelG * cgHeightM) / trackWidthM;
}

// In gearbox.ts
export function calcWeightTransfer(
  weight: number,
  cgHeightM: number,
  trackWidthM: number,
  accelG: number
): number {
  return (weight * accelG * cgHeightM) / trackWidthM;
}
```

**Impact:**
- Code duplication
- Potential for divergence if one is updated without the other
- Confusion about which is the canonical version

**Fix:**
1. Create `src/utils/physics.ts` for shared calculation utilities
2. Move `calcWeightTransfer` there
3. Update imports in both feature files

---

### Issue #4: Inconsistent Deserialization in Setups Store

**Location:** `src/features/setups/store.ts` (lines 22-52)

**Description:**
`persistedSetups` and `persistedTags` use default JSON.parse deserialization, while `persistedFilter` and all other persisted stores in the codebase use custom deserialization functions.

**Current Code:**

```typescript
// Lines 22-30 - NO custom deserialization
const [persistedSetups, setPersistedSetups] = makePersisted(
  createSignal<SavedSetup[]>([]),
  { name: SETUPS_STORAGE_KEY }
);

const [persistedTags, setPersistedTags] = makePersisted(
  createSignal<SetupTag[]>([]),
  { name: TAGS_STORAGE_KEY }
);

// Lines 49-52 - HAS custom deserialization
const [persistedFilter, setPersistedFilter] = makePersisted(
  createSignal<SetupFilter | null>(null),
  {
    name: FILTER_STORAGE_KEY,
    deserialize: (str) => JSON.parse(str) as SetupFilter,
  }
);
```

**Comparison with other stores:**

```typescript
// src/features/gearbox/store.ts - ALL stores have custom deserialization
const [gearRatios, setGearRatios] = makePersisted(
  createStore<GearRatios>(defaultGearRatios),
  {
    name: GEAR_RATIOS_KEY,
    deserialize: (str) => deserializeGearRatios(JSON.parse(str)),
  }
);
```

**Impact:**
- If the data structure changes, setups and tags won't migrate gracefully
- Inconsistent error handling during deserialization
- Other stores have migration patterns that setups lacks

**Fix:**
Add custom deserialization functions for `persistedSetups` and `persistedTags` to match the pattern used elsewhere.

---

## Naming Convention Issues

### Issue #5: Inconsistent File Naming

**Location:** All store and type files in feature directories

**Description:**
Store files use `store.ts` and type files use `types.ts` (camelCase), but the project guidelines specify kebab-case for file names.

**Current (Inconsistent):**
```
src/features/gearbox/store.ts
src/features/gearbox/types.ts
src/features/suspension/store.ts
src/features/aero/store.ts
src/features/alignment/store.ts
src/features/setups/store.ts
src/features/chat/store.ts
src/features/database/store.ts
```

**Expected (per guidelines):**
```
src/features/gearbox/gearbox-store.ts
src/features/gearbox/gearbox-types.ts
src/features/suspension/suspension-store.ts
src/features/aero/aero-store.ts
src/features/alignment/alignment-store.ts
src/features/setups/setups-store.ts
src/features/chat/chat-store.ts
src/features/database/database-store.ts
```

**Impact:**
- Violates project guidelines
- Makes globbing patterns less predictable
- Inconsistent with UI component files which use kebab-case

**Fix:**
Rename files following kebab-case convention. Update all import paths accordingly.

---

### Issue #6: Logic/Calculation File Naming

**Location:** Feature calculation files

**Description:**
Calculation logic files use camelCase feature names instead of kebab-case with descriptive suffixes.

**Current:**
```
src/features/suspension/suspension.ts
src/features/gearbox/gearbox.ts
src/features/aero/aero.ts
src/features/alignment/alignment.ts
```

**Expected:**
```
src/features/suspension/suspension-calculations.ts
src/features/gearbox/gearbox-calculations.ts
src/features/aero/aero-calculations.ts
src/features/alignment/alignment-calculations.ts
```

**Fix:**
Rename files to kebab-case with descriptive suffixes.

---

## Component Pattern Issues

### Issue #7: Props Type Location Inconsistency

**Location:** `src/features/gearbox/gearbox.ts` (lines 454-463)

**Description:**
Props types are defined after the component function instead of before it.

**Current Code:**

```typescript
// Line ~400
export function TractionAnalysisSection(props: TractionProps) {
  // component implementation
  // ...
  // Lines 454-463 - TYPES DEFINED AFTER COMPONENT
}

export type GearInfo = { /* ... */ };
export type TractionProps = { /* ... */ };
```

**Expected Pattern:**
```typescript
// Types defined BEFORE component
export type GearInfo = { /* ... */ };
export type TractionProps = { /* ... */ };

export function TractionAnalysisSection(props: TractionProps) {
  // component implementation
}
```

**Fix:**
Move type definitions before the component function.

---

### Issue #8: Missing splitProps Usage

**Location:** `src/components/ui/tab-menu.tsx`

**Description:**
`TabMenu` component doesn't use `splitProps` for separating local and forwarded props, unlike similar components.

**Current Code:**
```typescript
// tab-menu.tsx
export function TabMenu(props: TabMenuProps) {
  const { tabs, activeTab, onTabChange, class: className } = props;
  // Direct destructuring
}
```

**Expected Pattern (like slider-row.tsx and number-input.tsx):**
```typescript
export function TabMenu(props: TabMenuProps) {
  const [local, forwarded] = splitProps(props, ["tabs", "activeTab", "onTabChange"]);
  // Use local and forwarded separately
}
```

**Fix:**
Refactor to use `splitProps` for consistency with other components.

---

## Store Pattern Issues

### Issue #9: Inconsistent Store Naming

**Location:** `src/features/setups/store.ts`

**Description:**
Persisted signals use `persisted*` prefix while the main store doesn't.

**Current:**
```typescript
// Main store - no persisted prefix
const [setupsStore, setSetupsStore] = createStore<SetupsStore>({
  // ...
});

// Persisted signals - have persisted prefix
const [persistedSetups, setPersistedSetups] = makePersisted(/* ... */);
const [persistedTags, setPersistedTags] = makePersisted(/* ... */);
const [persistedFilter, setPersistedFilter] = makePersisted(/* ... */);
```

**Other Stores (no prefix):**
```typescript
// src/features/gearbox/store.ts
const [torqueRpmData, setTorqueRpmData] = makePersisted(/* ... */);
const [gearRatios, setGearRatios] = makePersisted(/* ... */);
const [finalDrive, setFinalDrive] = makePersisted(/* ... */);
```

**Impact:**
- Inconsistent naming convention
- Unclear when to use `persisted*` prefix

**Fix:**
Choose one convention and apply consistently:
- Option A: Remove `persisted*` prefix everywhere
- Option B: Use `persisted*` prefix everywhere

---

### Issue #10: Complex Persistence Pattern

**Location:** `src/features/setups/store.ts`

**Description:**
Setups store uses a hybrid pattern (non-persisted store + persisted signals + sync function) unlike all other stores which directly persist the primary store.

**Current Pattern:**
```typescript
// Non-persisted store
const [setupsStore, setSetupsStore] = createStore<SetupsStore>(defaultState);

// Persisted signals
const [persistedSetups, setPersistedSetups] = makePersisted(createSignal<SavedSetup[]>([]), { name: SETUPS_STORAGE_KEY });

// Sync function to merge persisted data into store
syncPersistedData();
```

**Other Stores Pattern (direct persistence):**
```typescript
// Directly persisted store
const [vehicleInputs, setVehicleInputs] = makePersisted(
  createStore<VehicleInputs>(defaultVehicleInputs),
  { name: VEHICLE_INPUTS_KEY, deserialize: /* ... */ }
);
```

**Impact:**
- More complex code path
- Potential for synchronization issues
- Inconsistent with rest of codebase

**Fix:**
Refactor to use direct store persistence like other stores.

---

### Issue #11: Read-Only Stores Undocumented

**Location:** `src/features/suspension/store.ts`

**Description:**
Some stores are exported as read-only (without setters) but this pattern is not documented or used elsewhere.

**Current Code:**
```typescript
// Read-only stores (no setter exported)
export const [springsStiffness] = createStore<SpringsStiffness>({/* ... */});
export const [dampers] = createStore<Dampers>({/* ... */});
export const [antiRollBars] = createStore<AntiRollBars>({/* ... */});
export const [accelerationMetrics] = createStore<AccelerationOutput>({/* ... */});

// Persisted stores (have setters)
export const [vehicleInputs, setVehicleInputs] = makePersisted(/* ... */);
export const [tireCompound, setTireCompound] = makePersisted(/* ... */);
export const [tractionMode, setTractionMode] = makePersisted(/* ... */);
```

**Impact:**
- Inconsistent pattern - why are some derived and others persisted?
- No documentation explaining the pattern
- New developers may not understand when to use which

**Fix:**
1. Document the pattern in AGENTS.md
2. Ensure consistency if this is intentional, or refactor if not

---

## Calculation Pattern Issues

### Issue #12: Inconsistent Error Handling

**Location:** Feature calculation files

**Description:**
Only `gearbox.ts` has explicit zero-division protection. Other calculation files assume valid inputs.

**Gearbox (has protection):**
```typescript
// src/features/gearbox/gearbox.ts:83
if (totalRatio === 0) {
  return 0;
}
```

**Suspension (no protection):**
```typescript
// src/features/suspension/suspension.ts
// No checks for division by zero or invalid inputs
function calculateSuspension(inputs: SuspensionInputs): SuspensionOutputs {
  // Assumes all inputs are valid
}
```

**Impact:**
- Potential runtime errors with invalid inputs
- Inconsistent behavior across features
- Harder to test edge cases

**Fix:**
Add consistent input validation to all calculation functions.

---

### Issue #13: Inconsistent Output Rounding

**Location:** Feature calculation files

**Description:**
Features use different rounding strategies for outputs.

**Suspension:**
```typescript
// Rounds to 1 decimal place
Math.round(value * 10) / 10
```

**Aero:**
```typescript
// Mixed - some use round, some use round * 10 / 10
Math.round(output.frontDownforceN)
Math.round(output.rearDownforceN * 10) / 10
```

**Gearbox:**
```typescript
// No rounding
return {
  wheelCircumference: 1.23, // Raw calculated value
};
```

**Alignment:**
```typescript
// No rounding
return {
  frontCamber: -1.5, // Raw calculated value
};
```

**Impact:**
- Inconsistent precision in UI
- Harder to compare values across features
- User-facing numbers have different precision

**Fix:**
Establish a rounding convention:
- All calculations return raw values
- UI layer handles rounding for display
- Or specify precision requirements per feature

---

### Issue #14: No Centralized Utilities

**Location:** All feature directories

**Description:**
Calculation functions are locked within feature directories. Shared utilities like `GRAVITY_MS2` are imported inconsistently.

**Current Import Patterns:**

```typescript
// Suspension - imports from constants AND gearbox
import { GRAVITY_MS2 } from "@/constants/physics";
import { calcLongitudinalAccelG } from "@/features/gearbox/gearbox";

// Aero - imports from local constants
import { AIR_DENSITY, GAME_CD_FACTOR } from "./aero-constants";

// Alignment - imports nothing for constants
import type { AlignmentInputs, AlignmentOutputs } from "@/types";
```

**Expected Pattern:**
```typescript
// All imports from centralized utilities
import { GRAVITY_MS2, AIR_DENSITY } from "@/utils/physics";
import { calcWeightTransfer, calcLongitudinalAccelG } from "@/utils/physics";
```

**Impact:**
- Duplicate code (e.g., `calcWeightTransfer`)
- Inconsistent constant usage
- Harder to maintain physics constants

**Fix:**
1. Create `src/utils/physics.ts` for shared constants and functions
2. Create `src/utils/math.ts` for shared math utilities
3. Consolidate imports

---

## Architecture Issues

### Issue #15: Mixed Responsibility in Types Index

**Location:** `src/types/index.ts`

**Description:**
The central types file contains chat/AI types alongside vehicle/domain types.

**Current Structure:**
```typescript
// Domain types (lines 1-100)
export type VehicleInputs = { /* ... */ };
export type GearRatio = { /* ... */ };
export type AeroSettings = { /* ... */ };

// Chat/AI types (lines ~101-118)
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type OpenRouterModel = {
  id: string;
  name: string;
};

export type OpenRouterModelsResponse = {
  data: OpenRouterModel[];
};
```

**Impact:**
- Types file has mixed responsibility
- Chat types aren't related to vehicle setup
- Violates single responsibility principle

**Fix:**
Extract chat types to `src/types/chat.ts`:
```typescript
// src/types/chat.ts
export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type OpenRouterModel = {
  id: string;
  name: string;
};
```

---

### Issue #16: Missing Utils Directory

**Location:** Project root

**Description:**
No `src/utils/` directory exists. Utility functions are scattered across feature directories.

**Current Structure:**
```
src/
  features/
    suspension/
      suspension.ts  <- Contains utility functions
    gearbox/
      gearbox.ts     <- Contains utility functions
    aero/
      aero.ts        <- Contains utility functions
  constants/
    physics.ts       <- Only constants, no functions
    colors.ts
```

**Expected Structure:**
```
src/
  utils/
    physics.ts       <- Shared constants AND functions
    math.ts          <- Math utilities
    validation.ts    <- Input validation helpers
  features/
    suspension/
      suspension.ts  <- Feature-specific logic only
    gearbox/
      gearbox.ts     <- Feature-specific logic only
```

**Fix:**
Create `src/utils/` directory and move shared utilities there.

---

## Recommendations by Priority

### High Priority (Fix Immediately)

| Issue | Description | Files to Change |
|-------|-------------|-----------------|
| #1 | Delete duplicate type files | Delete `gearbox/types.ts`, `aero/types.ts` |
| #4 | Fix setups store deserialization | `features/setups/store.ts` |
| #3 | Extract duplicate `calcWeightTransfer` | Create `utils/physics.ts`, update imports |
| #2 | Centralize suspension types | Move types to `types/index.ts` |

### Medium Priority (Next Sprint)

| Issue | Description | Files to Change |
|-------|-------------|-----------------|
| #5 | Standardize file naming | Rename store/type files across all features |
| #7 | Fix props type location | `features/gearbox/gearbox.ts` |
| #8 | Use splitProps consistently | `components/ui/tab-menu.tsx` |
| #14 | Create utils directory | Create `utils/physics.ts`, `utils/math.ts` |
| #12 | Add consistent error handling | All calculation files |
| #13 | Standardize output rounding | All calculation files + UI components |

### Low Priority (Tech Debt Backlog)

| Issue | Description | Files to Change |
|-------|-------------|-----------------|
| #6 | Rename calculation files | Rename `suspension.ts` → `suspension-calculations.ts`, etc. |
| #9 | Standardize store naming | `features/setups/store.ts` |
| #10 | Simplify setups persistence | `features/setups/store.ts` |
| #11 | Document read-only store pattern | `AGENTS.md` |
| #15 | Extract chat types | Create `types/chat.ts`, update imports |
| #16 | Move constants to utils | `constants/physics.ts` → `utils/physics.ts` |

---

## Migration Strategy

### Phase 1: Critical Fixes (Day 1)

1. Delete duplicate type files
2. Fix setups store deserialization
3. Create `utils/physics.ts` with shared functions
4. Move suspension types to central index

### Phase 2: Consistency (Day 2-3)

1. Standardize file naming across all features
2. Fix component patterns (props location, splitProps)
3. Create remaining utils files
4. Add input validation to calculations

### Phase 3: Architecture (Week 2)

1. Extract chat types to separate file
2. Document patterns in AGENTS.md
3. Simplify setups store persistence
4. Standardize output rounding

---

## Verification Checklist

After fixes are applied, verify:

- [ ] No duplicate type definitions
- [ ] All types import from `@/types/index.ts`
- [ ] All calculation functions import from `@/utils/*`
- [ ] All persisted stores have custom deserialization
- [ ] All files use kebab-case naming
- [ ] All components use `splitProps`
- [ ] All props types are defined before components
- [ ] All calculation functions have input validation
- [ ] UI handles all output rounding
- [ ] AGENTS.md documents all patterns
