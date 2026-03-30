import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { NodeConfig, NodeDetail } from '../models/topology.model';
import { TreeItem } from '../models/topology-tree.model';
import { mapDatacenters, mapRacks, mapServers } from './topology.mappers';

@Injectable({ providedIn: 'root' })
export class TopologyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/assets/mock/topology';

  /** GET /datacenters */
  getDatacenters(): Observable<TreeItem[]> {
    return this.http.get<NodeDetail[]>(`${this.base}/datacenters.json`).pipe(
      map(mapDatacenters)
    );
  }

  /** GET /datacenters/:id/racks */
  getRacks(datacenterId: string): Observable<TreeItem[]> {
    return this.http.get<Record<string, NodeDetail[]>>(`${this.base}/racks.json`).pipe(
      map(data => mapRacks(data[datacenterId] ?? [])),
      delay(1000) // simulate network latency
    );
  }

  /** GET /racks/:id/servers */
  getServers(rackId: string): Observable<TreeItem[]> {
    return this.http.get<Record<string, NodeDetail[]>>(`${this.base}/servers.json`).pipe(
      map(data => mapServers(data[rackId] ?? [])),
      delay(1000) // simulate network latency 
    );
  }

  /** GET /nodes/:id */
  getNodeDetail(id: string): Observable<NodeDetail | undefined> {
    return this.http.get<Record<string, NodeDetail>>(`${this.base}/node-details.json`).pipe(
      map(data => data[id])
    );
  }

  /** GET /nodes — full node map, used for uniqueness checks */
  getAllNodes(): Observable<Record<string, NodeDetail>> {
    return this.http.get<Record<string, NodeDetail>>(`${this.base}/node-details.json`);
  }

  /** GET /nodes/:id/config */
  getNodeConfig(id: string): Observable<NodeConfig | undefined> {
    return this.http.get<Record<string, NodeConfig>>(`${this.base}/node-config.json`).pipe(
      map(data => data[id])
    );
  }

  /** GET /nodes/:id/path — returns ordered ancestor IDs from root to parent */
  getNodePath(id: string): Observable<string[]> {
    return this.http.get<Record<string, string[]>>(`${this.base}/ancestors.json`).pipe(
      map(data => data[id] ?? [])
    );
  }
}
