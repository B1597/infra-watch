import { Component } from '@angular/core';
import { SkeletonBlockComponent } from '../../../../shared/components/skeleton-block/skeleton-block.component';

@Component({
  selector: 'app-topology-tree-skeleton',
  imports: [SkeletonBlockComponent],
  templateUrl: './topology-tree-skeleton.component.html',
  styleUrl: './topology-tree-skeleton.component.scss',
})
export class TopologyTreeSkeletonComponent {
  rows = ['120px', '90px', '110px', '80px', '130px', '95px', '100px', '115px'];
}
