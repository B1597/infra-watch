export type NodeStatus = 'online' | 'offline' | 'warning' | 'maintenance' | 'critical';
export type NodeType = 'datacenter' | 'rack' | 'server' | 'vm' | 'service' | 'switch' | 'router' | 'storage';

export interface NodeHardware {
  cpuCores?: number;
  memory?: string;
  storage?: string;
  firmware?: string;
}

export interface NodeStats {
  cpuUsage?: number;
  memoryUsage?: number;
  networkIO?: string;
  networkOut?: string;
  uptimeDays?: number;
  availability?: string;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  location?: string;
  ipAddress?: string;
  vendor?: string;
  serialNumber?: string;
  hardware?: NodeHardware;
  stats?: NodeStats;
  metadata?: Record<string, unknown>;
  children?: InfrastructureNode[];
}
