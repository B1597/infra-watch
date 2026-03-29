export type NodeStatus = 'online' | 'offline' | 'warning' | 'maintenance' | 'critical';
export type NodeType = 'datacenter' | 'rack' | 'server' | 'vm' | 'service' | 'switch' | 'router' | 'storage';

export interface InfrastructureNode {
  id: string;
  name: string;
  type: NodeType;
  status: NodeStatus;
  location?: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  children?: InfrastructureNode[];
}
