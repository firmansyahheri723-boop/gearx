import type { VehicleInputs, HelpContent } from '@/types';

export type SliderConfig = {
  key: keyof VehicleInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  help: string;
}

export const SUSPENSION_SLIDERS: SliderConfig[] = [
  {
    key: 'desiredRideFrequency',
    label: 'Ride Frequency',
    min: 2.0,
    max: 6.0,
    step: 0.1,
    unit: 'Hz',
    description: 'Racecars: 3.0 - 5.0+ Hz',
    help: 'Natural frequency of suspension oscillation. Higher values = stiffer suspension. Race cars typically use 3.0-5.0+ Hz.',
  },
  {
    key: 'dampingRatio',
    label: 'Damping Ratio',
    min: 0.5,
    max: 1.5,
    step: 0.05,
    unit: 'ζ',
    description: 'Racecars: 0.65+',
    help: 'Ratio of actual damping to critical damping. 1.0 = critically damped (no oscillation). Race cars typically use 0.65+.',
  },
  {
    key: 'desiredRollGradient',
    label: 'Roll Gradient',
    min: 0.02,
    max: 0.7,
    step: 0.01,
    unit: 'deg/g',
    description: 'Lower = stiffer roll',
    help: 'Degrees of body roll per g of lateral acceleration. Lower values = stiffer roll resistance. Race cars typically use 0.02-0.3 deg/g.',
  },
  {
    key: 'magicNumber',
    label: 'Front ARB Bias',
    min: 40,
    max: 70,
    step: 0.5,
    unit: '%',
    description: 'Front roll stiffness distribution',
    help: 'Front ARB bias percentage. Controls understeer/oversteer balance. Higher values = more understeer tendency.',
  },
  {
    key: 'wheelWeight',
    label: 'Wheel Weight',
    min: 8,
    max: 20,
    step: 0.5,
    unit: 'kg',
    description: 'Per wheel (unsprung mass)',
    help: 'Unsprung mass per wheel (wheel, tire, brake, hub). Subtracted from axle weight to get sprung mass.',
  },
  {
    key: 'rollCenterHeight',
    label: 'Roll Center Height',
    min: 0.05,
    max: 0.4,
    step: 0.01,
    unit: 'm',
    description: 'Height from ground to roll center',
    help: 'Height of the roll center above ground. The distance from roll center to CoG (H) determines roll moment arm.',
  },
];

export const ARB_STIFFNESS_HELP: HelpContent = {
  description: 'Individual ARB stiffness is derived from total roll rate and the front bias percentage (magic number).',
  formula: 'ARB = \\frac{K_{\\phi F/R} \\cdot \\pi}{180 \\cdot t^2}',
  variables: [
    'ARB = anti-roll bar stiffness (kNm)',
    'K_φF/R = front/rear roll rate (Nm/deg)',
    't = average track width (m)',
  ],
};
