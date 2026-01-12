import type { TireCompound, TractionMode } from '@/types';

export type TireOption = {
  value: TireCompound;
  label: string;
  friction: number;
}

export const TIRE_OPTIONS: TireOption[] = [
  { value: 'street', label: 'Street', friction: 1.12 },
  { value: 'street+', label: 'Street+', friction: 1.16 },
  { value: 'sport', label: 'Sport', friction: 1.40 },
  { value: 'sport+', label: 'Sport+', friction: 1.45 },
  { value: 'racing', label: 'Racing', friction: 1.70 },
  { value: 'racing+', label: 'Racing+', friction: 1.836 },
];

export type TractionModeOption = {
  value: TractionMode;
  label: string;
}

export const TRACTION_MODE_OPTIONS: TractionModeOption[] = [
  { value: 'launch', label: 'Launch' },
  { value: 'rolling', label: 'Rolling' },
];
