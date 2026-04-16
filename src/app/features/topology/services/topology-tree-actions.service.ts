import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, tap } from 'rxjs';
import { TreeItem } from '../models/topology-tree.model';
import { TopologySelectionService } from './topology-selection.service';
import { TopologyApiService } from './topology-api.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

export type TreeEvent =
  | { type: 'renamed';  id: string; name: string }
  | { type: 'deleted';  id: string }
  | { type: 'added';    parentId: string; node: TreeItem }
  | { type: 'refreshed'; id: string };

@Injectable({ providedIn: 'root' })
export class TopologyTreeActionsService {
  private readonly selectionService = inject(TopologySelectionService);
  private readonly topologyApi = inject(TopologyApiService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly _event$ = new Subject<TreeEvent>();
  readonly event$ = this._event$.asObservable();

  rename(id: string, name: string): void {
    this.selectionService.updateNodeNameInSelectionPath(id, name);
    this._event$.next({ type: 'renamed', id, name });
  }

  delete(id: string, name?: string, type?: string): void {
    const hasChildren = type === 'datacenter' || type === 'rack';
    const target = name ? `"${name}"` : 'this node';
    const message = hasChildren
      ? `Are you sure you want to delete ${target} and all of its child nodes? This action cannot be undone.`
      : `Are you sure you want to delete ${target}? This action cannot be undone.`;

    this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      autoFocus: false,
      restoreFocus: false,
      disableClose: true,
      data: {
        title: 'Delete Node',
        message,
        confirmText: 'Delete',
        isDanger: true,
        // onConfirm: () => this.topologyApi.deleteNode(id).pipe(
        //   tap(() => this._event$.next({ type: 'deleted', id }))
        // ),
      },
    });
  }

  refresh(id: string): void {
    this._event$.next({ type: 'refreshed', id });
  }

  addRack(datacenterId: string): void {
  }

  addDevice(rackId: string): void {
  }

  powerOn(id: string): void {
  }

  shutdown(id: string): void {
  }

  reboot(id: string): void {
  }

  viewLogs(id: string): void {
  }

  navigateToConfiguration(id: string): void {
    this.router.navigate(['/topology', id, 'configuration']);
  }
}
