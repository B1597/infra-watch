import { MetricsValues, NodeDetail, TimeRange } from '../models/topology.model';
import { TreeItem } from '../models/topology-tree.model';

interface RawNodeMetrics {
  cpu:      Record<TimeRange, number[]>;
  memory:   Record<TimeRange, number[]>;
  network:  Record<TimeRange, { in: number[]; out: number[] }>;
  storage?: Record<TimeRange, number[]>;
}

export const mapNodeMetrics = (node: RawNodeMetrics, range: TimeRange): MetricsValues => ({
  cpu:     node.cpu[range]      ?? [],
  memory:  node.memory[range]   ?? [],
  network: node.network[range]  ?? { in: [], out: [] },
  storage: node.storage?.[range] ?? [],
});

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

export const mapDevices = (nodes: NodeDetail[]): TreeItem[] =>
  nodes.map(n => ({
    id: n.id,
    name: n.name,
    type: n.type,
    status: n.status,
    hasChildren: false,
  }));
