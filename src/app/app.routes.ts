import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard-page/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
      {
        path: 'topology',
        loadChildren: () =>
          import('./features/topology/topology.routes').then(
            (m) => m.TOPOLOGY_ROUTES,
          ),
      },
      {
        path: 'network',
        loadComponent: () =>
          import('./features/network/network.component').then(
            (m) => m.NetworkComponent,
          ),
      },
      {
        path: 'monitoring',
        loadComponent: () =>
          import('./features/monitoring/monitoring.component').then(
            (m) => m.MonitoringComponent,
          ),
      },
      {
        path: 'alerts',
        loadComponent: () =>
          import('./features/alerts/pages/alerts-page/alerts-page.component').then(
            (m) => m.AlertsPageComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
