import { NodeDetail } from '../models/topology.model';
import { TreeItem } from '../models/topology-tree.model';

export const mapDatacenters = (nodes: NodeDetail[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: true,
  }));

export const mapRacks = (nodes: NodeDetail[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: true,
  }));

export const mapServers = (nodes: NodeDetail[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: false,
  }));
