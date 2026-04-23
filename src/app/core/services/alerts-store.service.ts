import { Injectable, computed, signal } from '@angular/core';
import { InfraAlert } from '../../shared/models/infrastructure.models';

@Injectable({ providedIn: 'root' })
export class AlertsStoreService {
  private readonly _alerts = signal<InfraAlert[]>([]);

  readonly alerts = this._alerts.asReadonly();

  readonly criticalAlertCount = computed(
    () =>
      this._alerts().filter(
        (a) => a.severity === 'critical' && a.status !== 'resolved',
      ).length,
  );

  setAlerts(alerts: InfraAlert[]): void {
    this._alerts.set(alerts);
  }

  addAlert(alert: InfraAlert): void {
    this._alerts.update((alerts) =>
      alerts.some((a) => a.id === alert.id) ? alerts : [alert, ...alerts],
    );
  }

  updateAlert(alert: InfraAlert): void {
    this._alerts.update((alerts) =>
      alerts.map((a) => (a.id === alert.id ? alert : a)),
    );
  }

  removeAlert(id: string): void {
    this._alerts.update((alerts) => alerts.filter((a) => a.id !== id));
  }

  clear(): void {
    this._alerts.set([]);
  }
}
