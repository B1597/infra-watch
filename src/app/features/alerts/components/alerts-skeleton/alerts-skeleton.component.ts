import { Component } from '@angular/core';
import { SkeletonBlockComponent } from '../../../../shared/components/skeleton-block/skeleton-block.component';

@Component({
  selector: 'app-alerts-skeleton',
  imports: [SkeletonBlockComponent],
  templateUrl: './alerts-skeleton.component.html',
  styleUrl: './alerts-skeleton.component.scss',
})
export class AlertsSkeletonComponent {
  rows = [1, 2, 3, 4, 5];
}
