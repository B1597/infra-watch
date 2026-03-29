import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TopologyApiService } from '../../services/topology-api.service';
import { TopologyDataSource } from '../../services/topology-datasource';
import { TopologySelectionService } from '../../services/topology-selection.service';
import { FlatNode } from '../../models/topology-tree.model';

@Component({
  selector: 'app-topology-tree',
  imports: [MatTreeModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  private readonly api = inject(TopologyApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly sel = inject(TopologySelectionService);

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.hasChildren,
  );
  dataSource = new TopologyDataSource(this.treeControl, this.api);
  hasChild = (_: number, node: FlatNode) => node.hasChildren;
  isSelected = (node: FlatNode) => this.sel.selection()?.id === node.id;

  constructor() {
    this.api.getDatacenters().subscribe(items => {
      this.dataSource.data = items.map(item => new FlatNode(
        item.id, item.name, item.type, item.status, 0, item.hasChildren,
      ));
    });
  }

  openNode(node: FlatNode) {
    this.sel.set({ id: node.id, path: this.buildPath(node), type: node.type });
    this.router.navigate(['/topology', node.id]);
  }

  private buildPath(node: FlatNode): string[] {
    const byId = new Map(this.dataSource.data.map(n => [n.id, n]));
    const names: string[] = [];
    let cur: FlatNode | undefined = node;
    while (cur) {
      names.unshift(cur.name);
      cur = cur.parentId ? byId.get(cur.parentId) : undefined;
    }
    return names;
  }

  readonly nodeIcons: Record<string, string> = {
    datacenter: 'corporate_fare',
    rack:       'view_module',
    server:     'dns',
    switch:     'device_hub',
    router:     'router',
    storage:    'storage',
    vm:         'desktop_windows',
    service:    'miscellaneous_services',
  };
}
