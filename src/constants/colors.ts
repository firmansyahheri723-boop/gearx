// Gear colors for charts and sliders - consistent across the app
// These colors are chosen to be visually distinct and work well on dark backgrounds

export const GEAR_COLORS = [
  '#f59e0b', // amber-500 - 1st gear
  '#06b6d4', // cyan-500 - 2nd gear
  '#10b981', // emerald-500 - 3rd gear
  '#8b5cf6', // violet-500 - 4th gear
  '#f43f5e', // rose-500 - 5th gear
  '#3b82f6', // blue-500 - 6th gear
  '#ec4899', // pink-500 - 7th gear
  '#14b8a6', // teal-500 - 8th gear
] as const;

// Tailwind class equivalents for CSS styling
export const GEAR_COLOR_CLASSES = [
  { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', gradient: 'from-amber-600 to-amber-400' },
  { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', gradient: 'from-cyan-600 to-cyan-400' },
  { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', gradient: 'from-emerald-600 to-emerald-400' },
  { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500', gradient: 'from-violet-600 to-violet-400' },
  { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500', gradient: 'from-rose-600 to-rose-400' },
  { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500', gradient: 'from-blue-600 to-blue-400' },
  { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500', gradient: 'from-pink-600 to-pink-400' },
  { bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500', gradient: 'from-teal-600 to-teal-400' },
] as const;

// Final drive gets a distinct gray color
export const FINAL_DRIVE_COLOR = '#64748b'; // slate-500
export const FINAL_DRIVE_COLOR_CLASS = { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', gradient: 'from-slate-600 to-slate-400' };

// Traction limit line color (for charts)
export const TRACTION_LIMIT_COLOR = '#ef4444'; // red-500


export function getGearColor(index: number): string {
  return GEAR_COLORS[index % GEAR_COLORS.length];
}

export function getGearColorClass(index: number) {
  return GEAR_COLOR_CLASSES[index % GEAR_COLOR_CLASSES.length];
}
