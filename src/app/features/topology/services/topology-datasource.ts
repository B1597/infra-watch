import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject, map, merge, Observable, Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { FlatNode, TreeItem } from '../models/topology-tree.model';
import { TopologyApiService } from './topology-api.service';

export class TopologyDataSource implements DataSource<FlatNode> {
  private dataChange = new BehaviorSubject<FlatNode[]>([]);
  readonly dataChanged$ = this.dataChange.asObservable();
  private cache = new Map<string, TreeItem[]>();
  private sub = new Subscription();

  get data(): FlatNode[] { return this.dataChange.value; }
  set data(value: FlatNode[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(
    private treeControl: FlatTreeControl<FlatNode>,
    private api: TopologyApiService,
  ) {}

  connect(viewer: CollectionViewer): Observable<FlatNode[]> {
    this.sub.add(
      this.treeControl.expansionModel.changed.subscribe((change: SelectionChange<FlatNode>) => {
        change.added?.forEach(node => this.toggle(node, true));
        [...(change.removed ?? [])].reverse().forEach(node => this.toggle(node, false));
      })
    );
    return merge(viewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(): void {
    this.sub.unsubscribe();
    this.dataChange.complete();
  }

  private toggle(node: FlatNode, expand: boolean): void {
    const index = this.data.indexOf(node);
    if (index < 0) return;

    if (expand) {
      if (!node.hasChildren) return;
      node.isLoading.set(true);
      this.loadChildren(node, index);
    } else {
      this.collapse(node, index);
    }
  }

  private loadChildren(node: FlatNode, index: number): void {
    const cached = this.cache.get(node.id);
    if (cached) {
      this.insertChildren(node, cached, index);
      node.isLoading.set(false);
      return;
    }

    const request$ = node.level === 0
      ? this.api.getRacks(node.id)
      : this.api.getServers(node.id);

    request$.pipe(take(1), finalize(() => node.isLoading.set(false))).subscribe({
      next: items => {
        this.cache.set(node.id, items);
        this.insertChildren(node, items, index);
      },
      error: err => console.error('Failed to load children for', node.id, err),
    });
  }

  private insertChildren(parent: FlatNode, items: TreeItem[], index: number): void {
    const nodes = items.map(item => new FlatNode(
      item.id, item.name, item.type, item.status,
      parent.level + 1, item.hasChildren, parent.id,
    ));
    this.data.splice(index + 1, 0, ...nodes);
    this.dataChange.next(this.data);
  }

  private collapse(node: FlatNode, index: number): void {
    let count = 0;
    for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) {}
    if (count > 0) {
      this.data.splice(index + 1, count);
      this.dataChange.next(this.data);
    }
  }
}
