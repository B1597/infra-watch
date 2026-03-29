import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { delay, map, Observable } from 'rxjs';
import { InfrastructureNode } from '../models/topology.model';
import { TreeItem } from '../models/topology-tree.model';
import { mapDatacenters, mapRacks, mapServers } from './topology.mappers';

@Injectable({ providedIn: 'root' })
export class TopologyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/assets/mock/topology';

  /** /datacenters */
  getDatacenters(): Observable<TreeItem[]> {
    return this.http.get<InfrastructureNode[]>(`${this.base}/datacenters.json`).pipe(
      map(mapDatacenters)
    );
  }

  /** /datacenters/:id/racks */
  getRacks(datacenterId: string): Observable<TreeItem[]> {
    return this.http.get<Record<string, InfrastructureNode[]>>(`${this.base}/racks.json`).pipe(
      map(data => mapRacks(data[datacenterId] ?? [])),
      delay(1000) // simulate network latency
    );
  }

  /** /racks/:id/servers */
  getServers(rackId: string): Observable<TreeItem[]> {
    return this.http.get<Record<string, InfrastructureNode[]>>(`${this.base}/servers.json`).pipe(
      map(data => mapServers(data[rackId] ?? [])),
      delay(1000) // simulate network latency 
    );
  }

  /** GET /nodes/:id */
  getNodeDetail(id: string): Observable<InfrastructureNode | undefined> {
    return this.http.get<Record<string, InfrastructureNode>>(`${this.base}/node-details.json`).pipe(
      map(data => data[id])
    );
  }
}
