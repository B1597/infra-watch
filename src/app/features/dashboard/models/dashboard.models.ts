export interface StatTrend {
  change: number;
  direction: 'up' | 'down';
}

export interface InfraStats {
  totalNodes: number;
  online: number;
  warnings: number;
  offline: number;
  datacenters: number;
  racks: number;
  servers: number;
  vms: number;
  services: number;
  trends?: {
    totalNodes?: StatTrend;
    warnings?: StatTrend;
  };
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

