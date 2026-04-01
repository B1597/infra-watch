import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeModule } from '@angular/material/tree';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { filter, take } from 'rxjs';
import { TopologyApiService } from '../../services/topology-api.service';
import { TopologyDataSource } from '../../services/topology-datasource';
import { TopologySelectionService } from '../../services/topology-selection.service';
import { FlatNode } from '../../models/topology-tree.model';
import { NodePath } from '../../models/topology.model';

@Component({
  selector: 'app-topology-tree',
  imports: [MatTreeModule, MatIcon, MatProgressSpinnerModule],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly topologyApi = inject(TopologyApiService);
  private readonly selectionService  = inject(TopologySelectionService);

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.hasChildren,
  );
  dataSource = new TopologyDataSource(this.treeControl, this.topologyApi);
  hasChild = (_: number, node: FlatNode) => node.hasChildren;
  isSelected = (node: FlatNode) => this.selectionService.selection()?.id === node.id;

  constructor() {
    this.loadRootNodes();
    this.listenToNodeRouteChanges();
  }

  private loadRootNodes() {
    this.topologyApi.getDatacenters().subscribe(items => {
      this.dataSource.data = items.map(item => new FlatNode(
        item.id, item.name, item.type, item.status, 0, item.hasChildren,
      ));

      const nodeId = this.route.firstChild?.snapshot.paramMap.get('nodeId');
      if (nodeId) this.restoreSelectionByNodeId(nodeId);
    });
  }

  private listenToNodeRouteChanges() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    ).subscribe(() => {
      const nodeId = this.route.firstChild?.snapshot.paramMap.get('nodeId');
      // restore if selection is out of sync with URL
      if (nodeId && this.selectionService.selection()?.id !== nodeId) {
        this.restoreSelectionByNodeId(nodeId);
      }
    });
  }

  openNode(node: FlatNode) {
    this.selectionService.set({ id: node.id, path: this.buildNodePath(node), type: node.type });
    this.router.navigate(['/topology', node.id, this.activeTab()]);
  }

  // preserving the active tab when navigating between nodes
  private activeTab(): string {
    const segments = this.router.url.split('/').filter(Boolean);
    const validTabs = ['overview', 'configuration', 'statistics'];
    const last = segments[segments.length - 1];
    return validTabs.includes(last) ? last : 'overview';
  }

  private restoreSelectionByNodeId(nodeId: string): void {
    this.topologyApi.getNodePath(nodeId).pipe(take(1)).subscribe(ancestorIds => {
      this.expandAncestorPath(ancestorIds, nodeId);
    });
  }

  // expands the ancestor chain step-by-step to reveal a target node in a lazy-loaded tree.
  // each level must be expanded before the next one becomes available, so we process
  // ancestors sequentially. If children are not yet loaded, we wait for data changes
  // before continuing to the next level. (recursion)
  private expandAncestorPath(ancestorIds: string[], targetId: string, index = 0): void {
    if (index >= ancestorIds.length) {
      this.selectNodeInTree(targetId);
      return;
    }

    const id = ancestorIds[index];
    const node = this.dataSource.data.find(n => n.id === id);
    if (!node) return;

    this.treeControl.expand(node);

    // if children are already loaded, continue immediately
    if (this.dataSource.data.some(n => n.parentId === id)) {
      this.expandAncestorPath(ancestorIds, targetId, index + 1);
      return;
    }

    // wait for async load to insert children
    this.dataSource.dataChanged$.pipe(
      filter(() => this.dataSource.data.some(n => n.parentId === id)),
      take(1),
    ).subscribe(() => this.expandAncestorPath(ancestorIds, targetId, index + 1));
  }

  private selectNodeInTree(nodeId: string): void {
    const node = this.dataSource.data.find(n => n.id === nodeId);
    if (node) this.selectionService.set({ id: node.id, path: this.buildNodePath(node), type: node.type });
  }

  private buildNodePath(node: FlatNode): NodePath[] {
    const byId = new Map(this.dataSource.data.map(n => [n.id, n]));
    const items: NodePath[] = [];
    let currentNode: FlatNode | undefined = node;
    while (currentNode) {
      items.unshift({ id: currentNode.id, name: currentNode.name });
      currentNode = currentNode.parentId ? byId.get(currentNode.parentId) : undefined;
    }
    return items;
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
