export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertStatus   = 'active' | 'acknowledged' | 'resolved';

export interface NavItem {
  label: string;
  icon:  string;
  route: string;
}


export interface InfraAlert {
  id:              string;
  title:           string;
  message:         string;
  severity:        AlertSeverity;
  status:          AlertStatus;
  source:          string;
  deviceType:      string;
  category:        string;
  time:            string;
  timestamp:       string;
  acknowledgedBy?: string;
  nodeId?:         string | null;
}

