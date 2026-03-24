import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { LayoutService } from '../../../../core/services/layout.service';
import { DashboardService } from '../../services/dashboard.service';
import { InfraStats, SystemHealth } from '../../models/dashboard.models';
import { InfraAlert } from '../../../../shared/models/infrastructure.models';

import { DashboardStatCardsComponent } from '../../components/dashboard-stat-cards/dashboard-stat-cards.component';
import { InfrastructureOverviewCardComponent } from '../../components/infrastructure-overview-card/infrastructure-overview-card.component';
import { SystemHealthCardComponent } from '../../components/system-health-card/system-health-card.component';
import { RecentAlertsCardComponent } from '../../components/recent-alerts-card/recent-alerts-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    DashboardStatCardsComponent,
    InfrastructureOverviewCardComponent,
    SystemHealthCardComponent,
    RecentAlertsCardComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dashboardService = inject(DashboardService);
  private readonly layoutService = inject(LayoutService);

  readonly stats = signal<InfraStats | null>(null);
  readonly health = signal<SystemHealth | null>(null);
  readonly alerts = signal<InfraAlert[]>([]);
  readonly recentAlerts = computed(() => this.alerts().slice(0, 5));
  readonly isLoading = signal(true);

  ngOnInit(): void {
    this.layoutService.setPage('Dashboard');
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.dashboardService
      .loadDashboardData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ stats, health, alerts }) => {
          this.stats.set(stats);
          this.health.set(health);
          this.alerts.set(alerts);
          this.isLoading.set(false);

          this.startLiveHealthUpdates(health);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private startLiveHealthUpdates(initialHealth: SystemHealth): void {
    this.dashboardService
      .createLiveHealthStream(initialHealth)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((health) => {
        this.health.set(health);
      });
  }
}