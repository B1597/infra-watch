import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { InfraStats } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-stat-cards',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dashboard-stat-cards.component.html',
  styleUrl: './dashboard-stat-cards.component.scss',
})
export class DashboardStatCardsComponent {
  readonly stats = input<InfraStats | null>(null);
}