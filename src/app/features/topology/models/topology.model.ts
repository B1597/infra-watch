export type NodeStatus  = 'online' | 'offline' | 'warning' | 'maintenance' | 'critical';
export type TimeRange   = '1H' | '6H' | '24H' | '7D';

export interface NodePath {
  id: string;
  name: string;
  type?: string;
}

export interface MetricsValues {
  cpu:      number[];
  memory:   number[];
  network:  { in: number[]; out: number[] };
  storage?: number[];
}
export type NodeType = 'datacenter' | 'rack' | 'server' | 'vm' | 'service' | 'switch' | 'router' | 'storage';

export interface NodeSearchResult {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  parentId?: string;
  path: NodePath[];
}

export interface NodeHardware {
  cpuCores?: number;
  memory?: string;
  storage?: string;
  firmware?: string;
}

export interface NodeStats {
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
  networkIO?: string;
  networkOut?: string;
  uptimeDays?: number;
  availability?: string;
}

export interface NodeConfig {
  password:        string;
  registrationId?: string;
  macAddress?:     string;
}

export interface UpdateNodeConfig {
  name?:           string;
  location?:       string;
  password?:       string;
  registrationId?: string;
  ipAddress?:      string;
}

export interface NodeDetail {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  parentId?: string;
  location?: string;
  ipAddress?: string;
  vendor?: string;
  serialNumber?: string;
  hardware?: NodeHardware;
  stats?: NodeStats;
  metadata?: Record<string, unknown>;
  children?: NodeDetail[];
}
