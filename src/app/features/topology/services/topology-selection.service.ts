import { Injectable, signal } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { filter } from 'rxjs';
import { NodeType } from '../models/topology.model';

export interface PathItem {
  id: string;
  name: string;
}

interface SelectionPayload {
  id: string;
  path: PathItem[];
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
}
