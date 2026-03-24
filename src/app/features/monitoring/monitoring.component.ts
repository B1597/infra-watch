import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-monitoring',
  imports: [MatIconModule],
  templateUrl: './monitoring.component.html',
  styleUrl: './monitoring.component.scss',
})
export class MonitoringComponent implements OnInit {
  private readonly layoutService = inject(LayoutService);

  ngOnInit(): void {
    this.layoutService.setPage('Monitoring');
  }
}
