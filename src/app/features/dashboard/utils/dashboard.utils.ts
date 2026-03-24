// Dashboard-specific metric helpers

export type HealthColor = 'success' | 'warning' | 'danger';

export function healthColor(value: number): HealthColor {
  if (value >= 85) return 'danger';
  if (value >= 65) return 'warning';
  return 'success';
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function randomDelta(range: number): number {
  return Math.random() * range * 2 - range;
}