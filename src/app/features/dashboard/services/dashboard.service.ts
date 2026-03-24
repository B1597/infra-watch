import { Injectable, inject } from '@angular/core';
import { forkJoin, interval, map, startWith, tap } from 'rxjs';
import { DashboardApiService } from './dashboard-api.service';
import { AlertsStoreService } from '../../../core/services/alerts-store.service';
import { SystemHealth } from '../models/dashboard.models';
import { clamp, randomDelta } from '../utils/dashboard.utils';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly alertsStore = inject(AlertsStoreService);

  loadDashboardData() {
    return forkJoin({
      stats: this.dashboardApi.getStats(),
      health: this.dashboardApi.getHealth(),
      alerts: this.dashboardApi.getAlerts(),
    }).pipe(
      tap(({ alerts }) => this.alertsStore.setAlerts(alerts))
    );
  }

  createLiveHealthStream(initialHealth: SystemHealth) {
    return interval(4000).pipe(
      startWith(0),
      map((tick) => {
        if (tick === 0) {
          return initialHealth;
        }

        return {
          cpu: clamp(initialHealth.cpu + randomDelta(6), 10, 95),
          memory: clamp(initialHealth.memory + randomDelta(3), 60, 92),
          network: clamp(initialHealth.network + randomDelta(8), 5, 75),
          storage: clamp(initialHealth.storage + randomDelta(1), 86, 94),
        };
      })
    );
  }
}