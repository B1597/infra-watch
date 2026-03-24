import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { InfraAlert, AlertSeverity } from '../../../../shared/models/infrastructure.models';
import { capitalize, SEVERITY_ICONS } from '../../../../shared/utils/health.utils';

@Component({
  selector: 'app-recent-alerts-card',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './recent-alerts-card.component.html',
  styleUrl: './recent-alerts-card.component.scss',
})
export class RecentAlertsCardComponent {
  readonly alerts = input<InfraAlert[]>([]);

  severityIcon(severity: AlertSeverity): string {
    return SEVERITY_ICONS[severity];
  }

  severityLabel(severity: AlertSeverity): string {
    return capitalize(severity);
  }
}