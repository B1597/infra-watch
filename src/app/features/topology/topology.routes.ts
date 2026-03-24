import { Routes } from '@angular/router';

export const TOPOLOGY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/topology-page/topology-page.component').then(
        (m) => m.TopologyPageComponent,
      ),
    children: [
      {
        path: ':nodeId',
        loadComponent: () =>
          import('./components/node-detail/node-detail.component').then(
            (m) => m.NodeDetailComponent,
          ),
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          {
            path: 'overview',
            loadComponent: () =>
              import('./components/node-detail/tabs/node-overview/node-overview.component').then(
                (m) => m.NodeOverviewComponent,
              ),
          },
          {
            path: 'configuration',
            loadComponent: () =>
              import('./components/node-detail/tabs/node-configuration/node-configuration.component').then(
                (m) => m.NodeConfigurationComponent,
              ),
          },
          {
            path: 'statistics',
            loadComponent: () =>
              import('./components/node-detail/tabs/node-statistics/node-statistics.component').then(
                (m) => m.NodeStatisticsComponent,
              ),
          },
        ],
      },
    ],
  },
];
