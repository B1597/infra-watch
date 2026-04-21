import { Component } from '@angular/core';
import { SkeletonBlockComponent } from '../../../../shared/components/skeleton-block/skeleton-block.component';

@Component({
  selector: 'app-dashboard-skeleton',
  imports: [SkeletonBlockComponent],
  templateUrl: './dashboard-skeleton.component.html',
  styleUrl: './dashboard-skeleton.component.scss',
})
export class DashboardSkeletonComponent {}
