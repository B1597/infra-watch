import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertsApiService } from '../../services/alerts-api.service';
import { AlertsStoreService } from '../../../../core/services/alerts-store.service';
import { LayoutService } from '../../../../core/services/layout.service';
import { AlertSeverity } from '../../../../shared/models/infrastructure.models';
import { SEVERITY_ICONS, capitalize } from '../../../../shared/utils/health.utils';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { AlertsSkeletonComponent } from '../../components/alerts-skeleton/alerts-skeleton.component';

@Component({
  selector: 'app-alerts-page',
  imports: [MatIconModule, MatButtonModule, ErrorStateComponent, AlertsSkeletonComponent],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.scss',
})
export class AlertsPageComponent implements OnInit {
  private readonly destroyRef    = inject(DestroyRef);
  private readonly apiService    = inject(AlertsApiService);
  private readonly alertsStore   = inject(AlertsStoreService);
  private readonly layoutService = inject(LayoutService);

  readonly isLoading = signal(true);
  readonly hasError  = signal(false);

  readonly alerts = computed(() =>
    this.alertsStore.alerts().filter((a) => a.status !== 'resolved'),
  );

  ngOnInit(): void {
    this.layoutService.setPage('Alerts');
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.apiService
      .getAlerts()
      .pipe(
        tap((alerts) => this.alertsStore.setAlerts(alerts)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.isLoading.set(false),
        error: () => {
          this.isLoading.set(false);
          this.hasError.set(true);
        },
      });
  }

  acknowledge(id: string): void {
    this.apiService
      .acknowledgeAlert(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => this.alertsStore.updateAlert(updated),
      });
  }

  resolve(id: string): void {
    this.apiService
      .resolveAlert(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.alertsStore.removeAlert(id),
      });
  }

  severityIcon(severity: AlertSeverity): string {
    return SEVERITY_ICONS[severity];
  }

  severityLabel(severity: AlertSeverity): string {
    return capitalize(severity);
  }
}
