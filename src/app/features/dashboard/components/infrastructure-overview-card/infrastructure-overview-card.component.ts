import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InfraStats } from '../../models/dashboard.models';

@Component({
  selector: 'app-infrastructure-overview-card',
  imports: [MatIconModule],
  templateUrl: './infrastructure-overview-card.component.html',
  styleUrl: './infrastructure-overview-card.component.scss',
})
export class InfrastructureOverviewCardComponent {
  readonly stats = input<InfraStats | null>(null);
}
