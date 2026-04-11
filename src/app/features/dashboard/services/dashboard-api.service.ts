import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InfraStats, SystemHealth } from '../models/dashboard.models';
import { InfraAlert } from '../../../shared/models/infrastructure.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getStats(): Observable<InfraStats> {
    return this.http.get<InfraStats>(`${this.baseUrl}/dashboard/stats`);
  }

  getHealth(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.baseUrl}/dashboard/health`);
  }
}