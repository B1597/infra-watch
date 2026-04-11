import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InfraAlert } from '../../../shared/models/infrastructure.models';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAlerts(): Observable<InfraAlert[]> {
    return this.http.get<InfraAlert[]>(`${this.baseUrl}/alerts`);
  }
}
