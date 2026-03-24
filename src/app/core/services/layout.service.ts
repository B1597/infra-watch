import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly _pageTitle = signal('Dashboard');

  readonly pageTitle = this._pageTitle.asReadonly();

  setPage(title: string): void {
    this._pageTitle.set(title);
  }
}
