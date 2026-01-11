# GearX Agent Guidelines

## Project-Specific Notes

- **CarX Street Domain**: This is a suspension calculator and gearbox tuner for CarX Street
- **Formula Reference**: Calculations based on formula.xlsx (referenced in comments for complex formulas)
- **SolidJS Conventions**: Use `onMount`/`onCleanup` for lifecycle, not `useEffect`
- **No Build Steps**: Use direct Bun commands; no intermediate build steps

## Build Commands

```bash
# Production build
bun run build

# Preview production build
bun run serve
```

**Note**: No test or lint commands are configured in this project. Do NOT run dev commands.

## Code Style Guidelines

### Components

- Use function declarations for components (not arrow functions)
- Define props using `type` keyword
- Use `splitProps` to separate local and forwarded props
- Use `JSX.EventHandler` for typed event handlers
- Use `class` for className attributes (SolidJS standard)

### State Management

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

### File Structure

- Place reusable UI components in `components/ui/`
- Place feature components in appropriate subdirectories
- Store global state in `stores/` using `createStore`
- Put pure functions and calculations in `utils/`
- Export shared types from `types/index.ts`

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Hand off** - Provide context for next session

## Issue Tracking

```bash
# Find ready work (no blockers)
bd ready --json

# Find ready work including future deferred issues
bd ready --include-deferred --json

# Create new issue
bd create "Issue title" -t bug|feature|task -p 0-4 -d "Description" --json

# Create issue with due date and defer (GH#820)
bd create "Task" --due=+6h              # Due in 6 hours
bd create "Task" --defer=tomorrow       # Hidden from bd ready until tomorrow
bd create "Task" --due="next monday" --defer=+1h  # Both

# Update issue status
bd update <id> --status in_progress --json

# Update issue with due/defer dates
bd update <id> --due=+2d                # Set due date
bd update <id> --defer=""               # Clear defer (show immediately)

# Link discovered work
bd dep add <discovered-id> <parent-id> --type discovered-from

# Complete work
bd close <id> --reason "Done" --json

# Show dependency tree
bd dep tree <id>

# Get issue details
bd show <id> --json

# Query issues by time-based scheduling (GH#820)
bd list --deferred              # Show issues with defer_until set
bd list --defer-before=tomorrow # Deferred before tomorrow
bd list --defer-after=+1w       # Deferred after one week from now
bd list --due-before=+2d        # Due within 2 days
bd list --due-after="next monday" # Due after next Monday
bd list --overdue               # Due date in past (not closed)
```
