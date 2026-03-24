import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutService } from '../../core/services/layout.service';
import { SearchService } from '../../core/services/search.service';
import { AlertsStoreService } from '../../core/services/alerts-store.service';

@Component({
  selector: 'app-header',
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly layoutService = inject(LayoutService);
  private readonly searchService = inject(SearchService);
  private readonly alertsStore   = inject(AlertsStoreService);

  readonly pageTitle  = this.layoutService.pageTitle;
  readonly alertCount = this.alertsStore.criticalAlertCount;

  searchQuery = '';

  onSearch(value: string): void {
    this.searchService.setQuery(value);
  }
}
