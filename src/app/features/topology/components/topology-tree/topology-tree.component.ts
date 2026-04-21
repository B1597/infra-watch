import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { MatTreeModule } from '@angular/material/tree';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { TopologyTreeSkeletonComponent } from '../topology-tree-skeleton/topology-tree-skeleton.component';
import { filter, take } from 'rxjs';
import { TopologyApiService } from '../../services/topology-api.service';
import { TopologyDataSource } from '../../services/topology-datasource';
import { TopologySelectionService } from '../../services/topology-selection.service';
import { TopologyTreeActionsService } from '../../services/topology-tree-actions.service';
import { FlatNode } from '../../models/topology-tree.model';
import { NodePath, NodeSearchResult } from '../../models/topology.model';

@Component({
  selector: 'app-topology-tree',
  imports: [MatTreeModule, MatIcon, MatProgressSpinnerModule, CdkContextMenuTrigger, CdkMenu, CdkMenuItem, ErrorStateComponent, TopologyTreeSkeletonComponent],
  templateUrl: './topology-tree.component.html',
  styleUrl: './topology-tree.component.scss',
})
export class TopologyTreeComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly topologyApi = inject(TopologyApiService);
  readonly selectionService = inject(TopologySelectionService);
  readonly treeActions = inject(TopologyTreeActionsService);

  searchQuery   = input('');
  searchResults = input<NodeSearchResult[]>([]);
  searchResultSelected = output();

  treeControl = new FlatTreeControl<FlatNode>(
    node => node.level,
    node => node.hasChildren,
  );
  dataSource = new TopologyDataSource(this.treeControl, this.topologyApi);
  hasChild = (_: number, node: FlatNode) => node.hasChildren;
  isSelected = (node: FlatNode) => this.selectionService.selection()?.id === node.id;

  contextNode     = signal<FlatNode | null>(null);
  loadError       = signal(false);
  isLoadingRoots  = signal(true);

  constructor() {
    this.loadRootNodes();
    this.listenToNodeRouteChanges();
    this.listenToTreeEvents();
  }

  private listenToTreeEvents(): void {
    this.treeActions.event$.pipe(takeUntilDestroyed()).subscribe(event => {
      switch (event.type) {
        case 'renamed': {
          const node = this.dataSource.data.find(n => n.id === event.id);
          if (node) {
            node.name = event.name;
            this.dataSource.data = [...this.dataSource.data];
          }
          break;
        }
        case 'deleted':
          // todo
          break;
        case 'added':
          // todo
          break;
        case 'refreshed':
          // todo
          break;
      }
    });
  }

  loadRootNodes() {
    this.loadError.set(false);
    this.isLoadingRoots.set(true);
    this.topologyApi.getDatacenters().subscribe({
      next: items => {
        this.dataSource.data = items.map(item => new FlatNode(
          item.id, item.name, item.type, item.status, 0, item.hasChildren,
        ));
        this.isLoadingRoots.set(false);
        const nodeId = this.route.firstChild?.snapshot.paramMap.get('nodeId');
        if (nodeId) this.restoreSelectionByNodeId(nodeId);
      },
      error: () => {
        this.isLoadingRoots.set(false);
        this.loadError.set(true);
      },
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

  selectSearchResult(result: NodeSearchResult): void {
    const ancestorIds = result.path.map(p => p.id);
    this.expandAncestorPath(ancestorIds, result.id, result.path);
    this.router.navigate(['/topology', result.id, this.activeTab()]);
    this.searchResultSelected.emit();
  }

  // preserving the active tab when navigating between nodes
  private activeTab(): string {
    const segments = this.router.url.split('/').filter(Boolean);
    const validTabs = ['overview', 'configuration', 'statistics'];
    const last = segments[segments.length - 1];
    return validTabs.includes(last) ? last : 'overview';
  }

  private restoreSelectionByNodeId(nodeId: string): void {
    this.topologyApi.getNodePath(nodeId).pipe(take(1)).subscribe(path => {
      this.expandAncestorPath(path.map(p => p.id), nodeId, path);
    });
  }

  // expands the ancestor chain step-by-step to reveal a target node in a lazy-loaded tree.
  // each level must be expanded before the next one becomes available, so we process
  // ancestors sequentially. If children are not yet loaded, we wait for data changes
  // before continuing to the next level. (recursion)
  private expandAncestorPath(ancestorIds: string[], targetId: string, path: NodePath[], index = 0): void {
    if (index >= ancestorIds.length) {
      this.selectNodeInTree(targetId, path);
      return;
    }

    const id = ancestorIds[index];
    const node = this.dataSource.data.find(n => n.id === id);
    if (!node) return;

    this.treeControl.expand(node);

    // if children are already loaded, continue immediately
    if (this.dataSource.data.some(n => n.parentId === id)) {
      this.expandAncestorPath(ancestorIds, targetId, path, index + 1);
      return;
    }

    // wait for async load to insert children
    this.dataSource.dataChanged$.pipe(
      filter(() => this.dataSource.data.some(n => n.parentId === id)),
      take(1),
    ).subscribe(() => this.expandAncestorPath(ancestorIds, targetId, path, index + 1));
  }

  private selectNodeInTree(nodeId: string, path: NodePath[]): void {
    const node = this.dataSource.data.find(n => n.id === nodeId);
    if (node) this.selectionService.set({ id: node.id, path: [...path, { id: node.id, name: node.name }], type: node.type });
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

  highlightSearchParts(name: string, query: string): { text: string; match: boolean }[] {
    const q = query.trim();
    if (!q) return [{ text: name, match: false }];
    const idx = name.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return [{ text: name, match: false }];
    return [
      { text: name.slice(0, idx), match: false },
      { text: name.slice(idx, idx + q.length), match: true },
      { text: name.slice(idx + q.length), match: false },
    ].filter(part => part.text.length > 0);
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
