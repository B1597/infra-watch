import { AlertSeverity } from '../models/infrastructure.models';

// Shared across features — severity icons and generic string helpers

export const SEVERITY_ICONS: Record<AlertSeverity, string> = {
  critical: 'cancel',
  warning:  'warning',
  info:     'schedule',
};

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
