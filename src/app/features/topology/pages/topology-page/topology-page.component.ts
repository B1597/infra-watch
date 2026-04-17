import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { TopologyTreeComponent } from '../../components/topology-tree/topology-tree.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LayoutService } from '../../../../core/services/layout.service';
import { TopologySelectionService } from '../../services/topology-selection.service';
import { TopologyApiService } from '../../services/topology-api.service';
import { NodeSearchResult } from '../../models/topology.model';

@Component({
  selector: 'app-topology-page',
  imports: [RouterOutlet, TopologyTreeComponent, MatIcon, MatFormFieldModule, MatInputModule],
  templateUrl: './topology-page.component.html',
  styleUrl: './topology-page.component.scss',
})
export class TopologyPageComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);
  private readonly topologyApi = inject(TopologyApiService);
  readonly sel = inject(TopologySelectionService);

  collapsed     = signal(false);
  searchQuery   = signal('');
  searchResults = signal<NodeSearchResult[]>([]);

  constructor() {
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => query.trim().length >= 2 ? this.topologyApi.searchNodes(query) : of([])),
      takeUntilDestroyed(),
    ).subscribe(results => this.searchResults.set(results));
  }

  ngOnInit(): void {
    this.layoutService.setPage('Topology');
  }

  toggle(): void { this.collapsed.update(collapsed => !collapsed); }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onSearchResultSelected(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }
}
