import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly _query$ = new BehaviorSubject<string>('');

  /** Debounced stream — subscribe in components for search results */
  readonly query$ = this._query$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
  );

  setQuery(value: string): void {
    this._query$.next(value);
  }
}
