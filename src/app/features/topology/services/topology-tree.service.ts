import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TreeItem } from '../models/topology-tree.model';
import { TopologySelectionService } from './topology-selection.service';

type TreeEvent =
  | { type: 'renamed'; id: string; name: string }
  | { type: 'deleted'; id: string }
  | { type: 'added';   parentId: string; node: TreeItem };

@Injectable({ providedIn: 'root' })
export class TopologyTreeService {
  private readonly selectionService = inject(TopologySelectionService);
  private readonly _event$ = new Subject<TreeEvent>();
  readonly event$ = this._event$.asObservable();

  rename(id: string, name: string): void {
    this.selectionService.updateNodeNameInSelectionPath(id, name);
    this._event$.next({ type: 'renamed', id, name });
  }

  delete(id: string): void {
    this._event$.next({ type: 'deleted', id });
  }

  add(parentId: string, node: TreeItem): void {
    this._event$.next({ type: 'added', parentId, node });
  }
}
