import { Injectable, computed, signal } from '@angular/core';
import { InfraAlert } from '../../shared/models/infrastructure.models';

@Injectable({ providedIn: 'root' })
export class AlertsStoreService {
  private readonly _alerts = signal<InfraAlert[]>([]);

  readonly alerts = this._alerts.asReadonly();

  readonly criticalAlertCount = computed(
    () => this._alerts().filter((alert) => alert.severity === 'critical').length
  );

  setAlerts(alerts: InfraAlert[]): void {
    this._alerts.set(alerts);
  }

  clear(): void {
    this._alerts.set([]);
  }
}