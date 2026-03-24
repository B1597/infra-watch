import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { SystemHealth } from '../../models/dashboard.models';
import { healthColor } from '../../utils/dashboard.utils';

@Component({
  selector: 'app-system-health-card',
  standalone: true,
  imports: [MatProgressBarModule, MatIconModule],
  templateUrl: './system-health-card.component.html',
  styleUrl: './system-health-card.component.scss',
})
export class SystemHealthCardComponent {
  readonly health = input<SystemHealth | null>(null);

  healthColor(value: number) {
    return healthColor(value);
  }
}