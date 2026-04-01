import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, switchMap, of } from 'rxjs';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption, XAXisComponentOption } from 'echarts';
import { MatIconModule } from '@angular/material/icon';

import { TopologySelectionService } from '../../../../services/topology-selection.service';
import { TopologyApiService } from '../../../../services/topology-api.service';
import { TimeRange } from '../../../../models/topology.model';

// Types 

interface RangeConfig {
  label: TimeRange;
  intervalMs: number;
}

type TimeValuePoint = [number, number];

interface PercentSeries {
  points: TimeValuePoint[];
  intervalMs: number;
  current: number;
  peak: number;
  avg: number;
}

interface NetworkSeries {
  inPoints: TimeValuePoint[];
  outPoints: TimeValuePoint[];
  intervalMs: number;
  currentIn: number;
  currentOut: number;
  peakIn: number;
  peakOut: number;
  avgIn: number;
  avgOut: number;
}

// Constants 

const RANGES: RangeConfig[] = [
  { label: '1H',  intervalMs: 60_000      },
  { label: '6H',  intervalMs: 360_000     },
  { label: '24H', intervalMs: 1_440_000   },
  { label: '7D',  intervalMs: 10_080_000  },
];

// Formatting helpers

function formatTick(date: Date, intervalMs: number): string {
  if (intervalMs >= 3_600_000) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function areaGradient(hex: string): object {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: hex + '35' },
      { offset: 1, color: hex + '00' },
    ],
  };
}

const baseTooltip = {
  backgroundColor: '#ffffff',
  borderColor: '#e2e8f0',
  textStyle: { color: '#444040', fontSize: 12 },
};

function buildTimeAxis(intervalMs: number): XAXisComponentOption {
  return {
    type: 'time',
    axisLabel: {
      fontSize: 10,
      color: '#94a3b8',
      hideOverlap: true,
      formatter: (value: string | number) =>
        formatTick(new Date(Number(value)), intervalMs),
    },
    axisLine: {
      lineStyle: { color: '#e2e8f0' },
    },
    axisTick: {
      show: false,
    },
    splitNumber: 6,
  };
}


// Data helpers

function toTimePoints(values: number[], intervalMs: number): TimeValuePoint[] {
  const now = Date.now();
  return values.map((v, i) => [now - (values.length - 1 - i) * intervalMs, v]);
}

function statOf(values: number[]) {
  if (!values.length) return { current: 0, peak: 0, avg: 0 };
  return {
    current: values.at(-1)!,
    peak: Math.max(...values),
    avg: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
  };
}

function buildPercentSeries(values: number[], intervalMs: number): PercentSeries {
  return { points: toTimePoints(values, intervalMs), intervalMs, ...statOf(values) };
}

function buildNetworkSeries(inVals: number[], outVals: number[], intervalMs: number): NetworkSeries {
  const inStat  = statOf(inVals);
  const outStat = statOf(outVals);
  return {
    inPoints:   toTimePoints(inVals,  intervalMs),
    outPoints:  toTimePoints(outVals, intervalMs),
    intervalMs,
    currentIn:  inStat.current,  currentOut:  outStat.current,
    peakIn:     inStat.peak,     peakOut:     outStat.peak,
    avgIn:      inStat.avg,      avgOut:      outStat.avg,
  };
}

// Chart options 

function buildPercentOption(series: PercentSeries, color: string, label: string): EChartsOption {
  const { intervalMs } = series;
  return {
    animationDuration: 1200,
    animationDurationUpdate: 600,
    animationEasing: 'cubicInOut',
    animationEasingUpdate: 'cubicOut',
    grid: { top: 12, right: 8, bottom: 36, left: 44 },
    tooltip: {
      trigger: 'axis',
      ...baseTooltip,
      formatter: (params: any) => {
        const point = Array.isArray(params) ? params[0] : params;
        const value = point?.value?.[1] ?? 0;
        const ts = point?.value?.[0];

        if (!ts) return `${label}: <b>${value}%</b>`;

        return `${formatTick(new Date(ts), intervalMs)}<br/>${label}: <b>${value}%</b>`;
      },
    },
    xAxis: buildTimeAxis(intervalMs),
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%', fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
    },
    series: [
      {
        type: 'line',
        data: series.points,
        smooth: 0.4,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: { color, width: 2 },
        areaStyle: { color: areaGradient(color) },
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ yAxis: 80 }],
          lineStyle: { color: '#ef444466', type: 'dashed', width: 1 },
          label: { show: false },
        },
      },
    ],
  };
}

function buildNetworkOption(series: NetworkSeries): EChartsOption {
  const { intervalMs } = series;
  return {
    animationDuration: 1200,
    animationDurationUpdate: 600,
    animationEasing: 'cubicInOut',
    animationEasingUpdate: 'cubicOut',
    grid: { top: 24, right: 8, bottom: 36, left: 52 },
    tooltip: {
      trigger: 'axis',
      ...baseTooltip,
      formatter: (params: any) => {
        const items = Array.isArray(params) ? params : [params];
        const inbound = items[0];
        const outbound = items[1];

        const ts = inbound?.value?.[0] ?? outbound?.value?.[0];
        const inValue = inbound?.value?.[1] ?? 0;
        const outValue = outbound?.value?.[1] ?? 0;

        const title = ts ? formatTick(new Date(ts), intervalMs) : '';

        return `${title}<br/>Inbound: <b>${inValue} MB/s</b><br/>Outbound: <b>${outValue} MB/s</b>`;
      },
    },
    legend: {
      data: ['Inbound', 'Outbound'],
      top: 4,
      right: 8,
      textStyle: { color: '#64748b', fontSize: 11 },
      itemWidth: 16,
      itemHeight: 2,
    },
    xAxis: buildTimeAxis(intervalMs),
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}', fontSize: 10, color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
    },
    series: [
      {
        name: 'Inbound',
        type: 'line',
        data: series.inPoints,
        smooth: 0.4,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: { color: '#10b981', width: 2 },
        areaStyle: { color: areaGradient('#10b981') },
      },
      {
        name: 'Outbound',
        type: 'line',
        data: series.outPoints,
        smooth: 0.4,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: { color: '#f59e0b', width: 2 },
        areaStyle: { color: areaGradient('#f59e0b') },
      },
    ],
  };
}


@Component({
  selector: 'app-node-statistics',
  imports: [NgxEchartsDirective, MatIconModule],
  templateUrl: './node-statistics.component.html',
  styleUrl: './node-statistics.component.scss',
})
export class NodeStatisticsComponent {
  private readonly sel = inject(TopologySelectionService);
  private readonly api = inject(TopologyApiService);

  readonly ranges = RANGES;
  readonly selectedRange = signal<TimeRange>('1H');

  readonly node = toSignal(
    toObservable(this.sel.selection).pipe(
      switchMap(selection => (selection ? this.api.getNodeDetail(selection.id) : of(null))),
    ),
  );

  private readonly rangeConfig = computed(
    () => RANGES.find(r => r.label === this.selectedRange()) ?? RANGES[0],
  );

  private readonly metrics = toSignal(
    combineLatest([
      toObservable(this.sel.selection),
      toObservable(this.selectedRange),
    ]).pipe(
      switchMap(([sel, range]) =>
        sel ? this.api.getNodeMetrics(sel.id, range) : of(null)
      )
    ),
    { initialValue: null }
  );

  readonly cpuSeries = computed<PercentSeries>(() =>
    buildPercentSeries(this.metrics()?.cpu ?? [], this.rangeConfig().intervalMs)
  );

  readonly memSeries = computed<PercentSeries>(() =>
    buildPercentSeries(this.metrics()?.memory ?? [], this.rangeConfig().intervalMs)
  );

  readonly networkSeries = computed<NetworkSeries>(() =>
    buildNetworkSeries(
      this.metrics()?.network.in  ?? [],
      this.metrics()?.network.out ?? [],
      this.rangeConfig().intervalMs,
    )
  );

  readonly cpuOption     = computed<EChartsOption>(() => buildPercentOption(this.cpuSeries(), '#3b82f6', 'CPU'));
  readonly memOption     = computed<EChartsOption>(() => buildPercentOption(this.memSeries(), '#8b5cf6', 'Memory'));
  readonly networkOption = computed<EChartsOption>(() => buildNetworkOption(this.networkSeries()));

  setRange(range: TimeRange): void {
    this.selectedRange.set(range);
  }

  statusClass(value: number): string {
    if (value >= 80) return 'danger';
    if (value >= 60) return 'warning';
    return 'success';
  }
}