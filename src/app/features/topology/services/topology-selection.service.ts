import { Injectable, signal } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs';
import { NodeType, NodePath } from '../models/topology.model';

interface SelectionPayload {
  id: string;
  path: NodePath[];
  type: NodeType;
}

@Injectable({ providedIn: 'root' })
export class TopologySelectionService {
  private selectionSig = signal<SelectionPayload | null>(null);
  selection = this.selectionSig.asReadonly();

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe((e: any) => {
        if (!e.url.startsWith('/topology/')) this.clear();
      });
  }

  set(sel: SelectionPayload) {
    this.selectionSig.set(sel);
  }

  clear() {
    this.selectionSig.set(null);
  }

  updateNodeNameInSelectionPath(id: string, name: string): void {
    const current = this.selectionSig();
    if (!current) return;
    const updatedPath = current.path.map(crumb =>
      crumb.id === id ? { ...crumb, name } : crumb
    );
    this.selectionSig.set({ ...current, path: updatedPath });
  }
}
