import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-block',
  template: `<div class="skeleton-block" [style.width]="width()" [style.height]="height()" [style.border-radius]="radius()"></div>`,
  styleUrl: './skeleton-block.component.scss',
})
export class SkeletonBlockComponent {
  width  = input('100%');
  height = input('16px');
  radius = input('6px');
}
