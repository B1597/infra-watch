import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopologyTreeComponent } from '../../components/topology-tree/topology-tree.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LayoutService } from '../../../../core/services/layout.service';
import { TopologySelectionService } from '../../services/topology-selection.service';

@Component({
  selector: 'app-topology-page',
  imports: [RouterOutlet, TopologyTreeComponent, MatIcon, MatFormFieldModule, MatInputModule],
  templateUrl: './topology-page.component.html',
  styleUrl: './topology-page.component.scss',
})
export class TopologyPageComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);
  readonly sel = inject(TopologySelectionService);
  collapsed = signal(false);

  ngOnInit(): void {
    this.layoutService.setPage('Topology');
  }

  toggle() { this.collapsed.update(v => !v); }
}
