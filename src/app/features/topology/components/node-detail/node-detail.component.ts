import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TopologySelectionService } from '../../services/topology-selection.service';

@Component({
  selector: 'app-node-detail',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIcon, MatTabsModule],
  templateUrl: './node-detail.component.html',
  styleUrl: './node-detail.component.scss',
})
export class NodeDetailComponent {
  readonly sel = inject(TopologySelectionService);
}
