# GearX Agent Guidelines

## Build Commands

```bash
# Production build
bun run build

# Preview production build
bun run serve
```

**Note**: No test or lint commands are configured in this project. Do NOT run dev commands.

## Code Style Guidelines

### General

- 2-space indentation
- Single quotes for strings
- No comments in code unless absolutely necessary
- Line length is not strictly enforced, but prefer reasonable lengths (~100-120 chars)
- End files with a newline
- Use semicolons

### Imports

```typescript
// Group imports by library order
import { createSignal, createEffect } from 'solid-js';                      // SolidJS primitives
import { DashboardHeader } from './components/dashboard-header';           // Local components
import { vehicleInputs, setVehicleInputs } from './stores/vehicle';        // Stores
import { calculateSuspensionOutputs } from '../../utils/suspension';      // Utilities
```

- Import SolidJS primitives and utilities first
- Then local component imports
- Then store imports
- Finally utility imports

### Components

```typescript
import { splitProps, type JSX } from 'solid-js';

type MyComponentProps = {
  value: number;
  onChange: (value: number) => void;
  class?: string;
}

export function MyComponent(props: MyComponentProps) {
  const [local, otherProps] = splitProps(props, ['value', 'onChange', 'class']);

  // Reactive signals
  const [state, setState] = createSignal('');

  // Side effects
  createEffect(() => {
    // Effect logic
  });

  // Event handlers with proper typing
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    // Handler logic
  };

  return <div class={local.class}>...</div>;
}
```

- Use function declarations for components (not arrow functions)
- Define props using `type` keyword
- Use `splitProps` to separate local and forwarded props
- Use `JSX.EventHandler` for typed event handlers
- Use `class` for className attributes (SolidJS standard)

### State Management

```typescript
// Local signals
const [value, setValue] = createSignal(0);

// Complex state with stores
import { createStore } from 'solid-js/store';
const [data, setData] = createStore({ items: [], count: 0 });

// Reuse existing stores from src/stores/
import { vehicleInputs, setVehicleInputs } from '../stores/vehicle';
setVehicleInputs('weight', 1788);
```

- Use `createSignal` for simple reactive values
- Use `createStore` for complex nested objects
- Import and reuse stores from `src/stores/` for application-wide state

### Types

```typescript
// Type for object shapes
export type VehicleInputs = {
  weight: number;
  frontWeightDistribution: number;
  // ...
}

// Type for unions or simple types
export type TireCompound = 'street' | 'street+' | 'racing';

// Export from types/index.ts for reusability
```

- Use `type` keyword for all types
- Export shared types from `src/types/index.ts`
- Use `typeof variable` for type inference from existing values

### Naming Conventions

- **Components**: PascalCase (`DataTable`, `NumberInput`, `SuspensionTab`)
- **Functions**: camelCase (`calculateSuspensionOutputs`, `handleInput`, `isValid`)
- **Constants**: UPPER_SNAKE_CASE (`VALID_TABS`, `SUSPENSION_SLIDERS`, `GEAR_LABELS`)
- **Signals**: `[value, setValue]` pattern (getter/setter)
- **Types**: PascalCase (`VehicleInputs`, `SuspensionOutputs`)
- **File names**: kebab-case (`suspension-tab.tsx`, `number-input.tsx`)

### Error Handling

```typescript
const parsed = parseFloat(value);
if (isNaN(parsed)) {
  // Handle invalid input with fallback
  return defaultValue;
}

// Use conditional rendering for error states
<Show when={error()} fallback={<div>No error</div>}>
  <div class="error">{error()}</div>
</Show>
```

- Validate user inputs with `isNaN` and type guards
- Provide fallback values for invalid inputs
- Use `Show` component for conditional rendering
- Don't throw errors for expected invalid states (return defaults instead)

### Styling

- Use Tailwind CSS v4 utility classes
- Configure theme variables in `src/index.css`
- All styling uses utility classes; no custom CSS files
- Design tokens are in Tailwind theme

### File Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── tabs/         # Tab-specific components
├── stores/           # Global state with solid-js/store
├── types/            # Shared TypeScript types
└── utils/            # Pure functions and calculations
```

- Place reusable UI components in `components/ui/`
- Place feature components in appropriate subdirectories
- Store global state in `stores/` using `createStore`
- Put pure functions and calculations in `utils/`
- Export shared types from `types/index.ts`

### Project-Specific Notes

- **CarX Street Domain**: This is a suspension calculator and gearbox tuner for CarX Street
- **Formula Reference**: Calculations based on formula.xlsx (referenced in comments for complex formulas)
- **SolidJS Conventions**: Use `onMount`/`onCleanup` for lifecycle, not `useEffect`
- **No Build Steps**: Use direct Bun commands; no intermediate build steps
