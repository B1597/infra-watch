import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { AlertsSocketService } from '../../core/services/alerts-socket.service';
import { AlertsStoreService } from '../../core/services/alerts-store.service';
import { AlertsApiService } from '../../features/alerts/services/alerts-api.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  private readonly destroyRef    = inject(DestroyRef);
  private readonly socketService = inject(AlertsSocketService);
  private readonly alertsStore   = inject(AlertsStoreService);
  private readonly apiService    = inject(AlertsApiService);

  ngOnInit(): void {
    this.loadInitialAlerts();
    this.listenForNewAlerts();
    this.listenForUpdatedAlerts();
  }

  loadInitialAlerts(): void {
    this.apiService.getAlerts()
      .pipe(
        tap((alerts) => this.alertsStore.setAlerts(alerts)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  listenForNewAlerts(): void {
    this.socketService.newAlert$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((alert) => this.alertsStore.addAlert(alert));
  }

  listenForUpdatedAlerts(): void {
    this.socketService.updatedAlert$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((alert) => {
        if (alert.status === 'resolved') {
          this.alertsStore.removeAlert(alert.id);
        } else {
          this.alertsStore.updateAlert(alert);
        }
      });
  }
}
