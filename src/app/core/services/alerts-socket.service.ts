import { Injectable, OnDestroy } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { InfraAlert } from '../../shared/models/infrastructure.models';

@Injectable({ providedIn: 'root' })
export class AlertsSocketService implements OnDestroy {
  private readonly socket: Socket;

  readonly newAlert$: Observable<InfraAlert>;
  readonly updatedAlert$: Observable<InfraAlert>;

  constructor() {
    this.socket = io(environment.apiUrl, { transports: ['websocket'] });
    this.newAlert$ = fromEvent<InfraAlert>(this.socket, 'alert:new');
    this.updatedAlert$ = fromEvent<InfraAlert>(this.socket, 'alert:updated');
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
