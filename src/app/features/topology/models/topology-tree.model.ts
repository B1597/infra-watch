import { signal } from '@angular/core';
import { NodeStatus, NodeType } from './topology.model';

export interface TreeItem {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  hasChildren: boolean;
  parentId?: string;
}

export class FlatNode {
  isLoading = signal(false);

  constructor(
    public id: string,
    public name: string,
    public type: NodeType,
    public status: NodeStatus,
    public level: number,
    public hasChildren: boolean,
    public parentId?: string,
  ) {}
}
