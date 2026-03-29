import { InfrastructureNode } from '../models/topology.model';
import { TreeItem } from '../models/topology-tree.model';

export const mapDatacenters = (nodes: InfrastructureNode[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: true,
  }));

export const mapRacks = (nodes: InfrastructureNode[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: true,
  }));

export const mapServers = (nodes: InfrastructureNode[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: false,
  }));
