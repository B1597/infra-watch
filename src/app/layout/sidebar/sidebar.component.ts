import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';
import { AlertsStoreService } from '../../core/services/alerts-store.service';
import { NavItem } from '../../shared/models/infrastructure.models';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule, MatRippleModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  private readonly alertsStore = inject(AlertsStoreService);

  readonly criticalCount = this.alertsStore.criticalAlertCount;

  readonly navItems: NavItem[] = [
    { label: 'Dashboard',  icon: 'space_dashboard', route: '/dashboard'  },
    { label: 'Topology',   icon: 'account_tree',    route: '/topology'   },
    { label: 'Network',    icon: 'language',        route: '/network'    },
    { label: 'Monitoring', icon: 'monitor_heart',   route: '/monitoring' },
    { label: 'Alerts',     icon: 'notifications',   route: '/alerts'     },
    { label: 'Reports',    icon: 'bar_chart',       route: '/reports'    },
  ];

  readonly bottomItems: NavItem[] = [
    { label: 'Settings', icon: 'settings',      route: '/settings' },
    { label: 'Profile',  icon: 'person',        route: '/profile'  },
    { label: 'Help',     icon: 'help_outline',  route: '/help'     },
  ];
}
