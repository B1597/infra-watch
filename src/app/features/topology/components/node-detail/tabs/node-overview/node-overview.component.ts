import { Component, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TopologySelectionService } from '../../../../services/topology-selection.service';
import { TopologyApiService } from '../../../../services/topology-api.service';

@Component({
  selector: 'app-node-overview',
  imports: [MatIconModule, TitleCasePipe],
  templateUrl: './node-overview.component.html',
  styleUrl: './node-overview.component.scss',
})
export class NodeOverviewComponent {
  private selectionService = inject(TopologySelectionService);
  private api = inject(TopologyApiService);

  node = toSignal(
    toObservable(this.selectionService.selection).pipe(
      switchMap(sel => sel ? this.api.getNodeDetail(sel.id) : of(null))
    )
  );

  progressClass(value: number): string {
    if (value >= 80) return 'overview__progress-fill--danger';
    if (value >= 60) return 'overview__progress-fill--warning';
    return 'overview__progress-fill--success';
  }
}
