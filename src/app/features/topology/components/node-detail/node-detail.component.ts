import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { TopologySelectionService } from '../../services/topology-selection.service';

@Component({
  selector: 'app-node-detail',
  imports: [RouterOutlet, RouterLink, MatIcon],
  templateUrl: './node-detail.component.html',
  styleUrl: './node-detail.component.scss',
})
export class NodeDetailComponent {
  readonly sel = inject(TopologySelectionService);
}
