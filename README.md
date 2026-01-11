# GearX

A web-based dashboard for [CarX Street](https://carx-technology.com/) — featuring suspension and gearbox tuning calculators, with more tools coming soon. Based on [StepUnique's calculator](https://youtu.be/P2YeIHZyy8c?si=kaOdPehkrxZzmPYp).

## Features

### Suspension Calculator

Calculate optimal suspension settings based on vehicle parameters:

- **Spring Stiffness** — Front/rear spring rates calculated from ride frequency and sprung mass
- **Damper Settings** — Bump, fast bump, rebound, and fast rebound values
- **Anti-Roll Bars** — FARB/RARB stiffness for handling balance
- **Weight Transfer** — Dynamic weight distribution under acceleration

Adjustable parameters:
- Ride frequency (Hz)
- Damping ratio
- Roll gradient
- Front ARB bias
- Wheel weight (unsprung mass)
- Roll center height

### Gearbox Calculator

Analyze transmission performance and traction limits:

- **Speed/RPM Analysis** — Vehicle speed at each RPM point for all gears
- **Wheel Torque** — Torque delivered to wheels with traction limit detection
- **Effective Ratios** — Gear ratio × final drive calculations
- **Traction Analysis** — Per-gear wheelspin zone visualization

Supports multiple tire compounds with different friction coefficients:
- Street (u = 1.12)
- Street+ (u = 1.16)
- Sport (u = 1.40)
- Sport+ (u = 1.45)
- Racing (u = 1.70)
- Racing+ (u = 1.84)

### Torque Curve Extractor

Extract engine torque data from dyno chart images:

1. Upload a screenshot of a torque curve
2. Calibrate the axes (RPM and torque ranges)
3. Auto-extract data points from the curve
4. Edit points manually if needed
5. Apply data to the calculator

### Data Management

- Store vehicle specifications (wheelbase, track width, transmission, engine data)
- Persistent state across sessions

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js

### Installation

```bash
# Clone the repository
git clone https://github.com/elianiva/gearx.git
cd gearx

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build for production
bun run build

# Preview production build
bun run serve
```

## Tech Stack

- [SolidJS](https://solidjs.com/) — Reactive UI framework
- [TailwindCSS v4](https://tailwindcss.com/) — Utility-first CSS
- [Vite](https://vitejs.dev/) — Build tool
- [Unovis](https://unovis.dev/) — Data visualization
- [TanStack Table](https://tanstack.com/table) — Headless table component
- [KaTeX](https://katex.org/) — Math formula rendering
- [PapaParse](https://papaparse.com/) — CSV parsing

## Credits

- [StepUnique](https://www.youtube.com/@StepUnique) — Original calculator spreadsheet and formulas
- [CarX Technology](https://carx-technology.com/) — CarX Street game

## License

MIT
