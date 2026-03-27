import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopologyTreeComponent } from '../../components/topology-tree/topology-tree.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-topology-page',
  imports: [RouterOutlet, TopologyTreeComponent, MatIcon],
  templateUrl: './topology-page.component.html',
  styleUrl: './topology-page.component.scss',
})
export class TopologyPageComponent {
  collapsed = signal(false);
  toggle() { this.collapsed.update(v => !v); }
}
