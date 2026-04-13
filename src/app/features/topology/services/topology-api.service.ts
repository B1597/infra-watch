import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MetricsValues, NodeConfig, NodeDetail, NodeType, TimeRange, UpdateNodeConfig } from '../models/topology.model';
import { TreeItem } from '../models/topology-tree.model';
import { mapDatacenters, mapNodeMetrics, mapRacks, mapDevices } from './topology.mappers';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TopologyApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** GET /datacenters */
  getDatacenters(): Observable<TreeItem[]> {
    return this.http.get<NodeDetail[]>(`${this.baseUrl}/topology/datacenters`).pipe(
      map(mapDatacenters)
    );
  }

  /** GET /datacenters/:id/racks */
  getRacks(datacenterId: string): Observable<TreeItem[]> {
    return this.http.get<NodeDetail[]>(`${this.baseUrl}/topology/datacenters/${datacenterId}/racks`).pipe(
      map(data => mapRacks(data))
    );
  }

  /** GET /racks/:id/devices */
  getDevices(rackId: string): Observable<TreeItem[]> {
    return this.http.get<NodeDetail[]>(`${this.baseUrl}/topology/racks/${rackId}/devices`).pipe(
      map(data => mapDevices(data))
    );
  }

  /** GET /nodes/:id */
  getNodeDetail(id: string): Observable<NodeDetail | undefined> {
    return this.http.get<NodeDetail>(`${this.baseUrl}/topology/nodes/${id}`);
  }

  /** GET /nodes/check-name?name=&type=&parentId=&currentId= */
  checkNameExists(name: string, type: NodeType, parentId: string | null, currentId: string | null): Observable<boolean> {
    const params: Record<string, string> = { name, type };
    if (parentId) params['parentId'] = parentId;
    if (currentId) params['currentId'] = currentId;
    return this.http.get<{ exists: boolean }>(`${this.baseUrl}/topology/nodes/check-name`, { params }).pipe(
      map(res => res.exists)
    );
  }

  /** GET /nodes/:id/config */
  getNodeConfig(id: string): Observable<NodeConfig | undefined> {
    return this.http.get<NodeConfig>(`${this.baseUrl}/topology/nodes/${id}/config`);
  }

  /** PUT /nodes/:id/config */
  updateNodeConfig(id: string, body: UpdateNodeConfig): Observable<NodeConfig> {
    return this.http.put<NodeConfig>(`${this.baseUrl}/topology/nodes/${id}/config`, body);
  }

  /** GET /nodes/:id/metrics?range= */
  getNodeMetrics(nodeId: string, range: TimeRange): Observable<MetricsValues | null> {
    return this.http.get<any>(`${this.baseUrl}/topology/nodes/${nodeId}/metrics`, { params: { range } }).pipe(
      map(data => data ? mapNodeMetrics(data, range) : null)
    );
  }

  /** GET /nodes/:id/path — returns ordered ancestor IDs from root to parent */
  getNodePath(id: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/topology/nodes/${id}/path`);
  }
}
