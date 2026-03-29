import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopologyTreeComponent } from '../../components/topology-tree/topology-tree.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-topology-page',
  imports: [RouterOutlet, TopologyTreeComponent, MatIcon, MatFormFieldModule, MatInputModule],
  templateUrl: './topology-page.component.html',
  styleUrl: './topology-page.component.scss',
})
export class TopologyPageComponent {
  collapsed = signal(false);
  toggle() { this.collapsed.update(v => !v); }
}
