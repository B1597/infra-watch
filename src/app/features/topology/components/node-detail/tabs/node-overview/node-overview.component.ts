import { Component, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, of } from 'rxjs';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { TopologySelectionService } from '../../../../services/topology-selection.service';
import { TopologyApiService } from '../../../../services/topology-api.service';

function buildSparkline(values: number[], current: number): EChartsOption {
  const color = current >= 80 ? '#ef4444' : current >= 60 ? '#f59e0b' : '#008d00';
  return {
    animation: false,
    grid: { top: 2, right: 0, bottom: 2, left: 0, containLabel: false },
    xAxis: { type: 'category', show: false, boundaryGap: false },
    yAxis: { type: 'value', show: false, min: 0, max: 100 },
    series: [{
      type: 'line',
      data: values,
      smooth: 0.4,
      symbol: 'none',
      lineStyle: { color, width: 1.5 },
      areaStyle: { color: color + '15' },
    }],
  };
}

@Component({
  selector: 'app-node-overview',
  imports: [MatIconModule, TitleCasePipe, NgxEchartsDirective],
  templateUrl: './node-overview.component.html',
  styleUrl: './node-overview.component.scss',
})
export class NodeOverviewComponent {
  private selectionService = inject(TopologySelectionService);
  private api = inject(TopologyApiService);

  node = toSignal(
    toObservable(this.selectionService.selection).pipe(
      switchMap(sel => sel ? this.api.getNodeDetail(sel.id) : of(null))
    )
  );

  private metrics = toSignal(
    toObservable(this.selectionService.selection).pipe(
      switchMap(sel => sel ? this.api.getNodeMetrics(sel.id, '1H') : of(null))
    )
  );

  cpuSparkline = computed<EChartsOption | null>(() => {
    const values = this.metrics()?.cpu;
    const current = this.node()?.stats?.cpuUsage;
    return values?.length && current !== undefined ? buildSparkline(values, current) : null;
  });

  memSparkline = computed<EChartsOption | null>(() => {
    const values = this.metrics()?.memory;
    const current = this.node()?.stats?.memoryUsage;
    return values?.length && current !== undefined ? buildSparkline(values, current) : null;
  });

  progressClass(value: number): string {
    if (value >= 80) return 'overview__progress-fill--danger';
    if (value >= 60) return 'overview__progress-fill--warning';
    return 'overview__progress-fill--success';
  }
}
