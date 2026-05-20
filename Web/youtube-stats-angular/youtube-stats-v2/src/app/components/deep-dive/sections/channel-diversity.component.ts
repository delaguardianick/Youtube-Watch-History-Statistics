import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ChannelDiversity } from '../../../models/deep-dive.models';
import {
  baseChart,
  valueAxis,
  areaGradient,
  CHART,
  hexA,
} from '../../../shared/chart-theme';

@Component({
  selector: 'app-channel-diversity',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section" *ngIf="data; else empty">

      <!-- Header -->
      <div class="section-header">
        <span class="label">Channel Diversity</span>
        <h3 class="headline">{{ editorialHeadline }}</h3>
      </div>

      <!-- Hero stat -->
      <div class="hero-block">
        <div class="hero-num">{{ data.channels_for_50_pct }}</div>
        <div class="hero-unit">channels = 50% of everything you opened</div>
      </div>

      <!-- Supporting stats -->
      <div class="stats-row">
        <div class="stat-block">
          <span class="label-sm">Total channels</span>
          <span class="stat-val">{{ data.total_channels | number }}</span>
          <span class="stat-sub">unique channels opened</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <span class="label-sm">One-timers</span>
          <span class="stat-val">{{ data.watched_once | number }}</span>
          <span class="stat-sub">watched once</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <span class="label-sm">Regulars</span>
          <span class="stat-val">{{ data.watched_10_plus | number }}</span>
          <span class="stat-sub">opened 10+ times</span>
        </div>
      </div>

      <!-- Concentration curve -->
      <div class="chart-block" *ngIf="data.concentration_curve?.length">
        <div class="chart-header">
          <span class="label-sm">Concentration curve</span>
          <span class="chart-note">
            Gap between the red curve and the dashed diagonal shows how concentrated your viewing is.
          </span>
        </div>
        <div echarts [options]="chartOptions" class="chart"></div>
        <div class="chart-legend">
          <span class="legend-swatch accent-swatch"></span>
          <span class="legend-label">Your concentration</span>
          <span class="legend-swatch equal-swatch"></span>
          <span class="legend-label">Perfect equality</span>
        </div>
      </div>

    </section>

    <ng-template #empty>
      <section class="section section--empty">
        <span class="label">Channel Diversity</span>
        <p class="empty-msg">No data available.</p>
      </section>
    </ng-template>
  `,
  styles: [`
    /* ── Section shell ── */
    .section {
      display: flex;
      flex-direction: column;
      gap: var(--s-6);
      width: 100%;
    }
    .section--empty {
      gap: var(--s-4);
    }
    .empty-msg {
      font: 400 14px/1.5 var(--font-sans);
      color: var(--fg-3);
      margin: 0;
    }

    /* ── Section header ── */
    .section-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .headline {
      margin: 0;
      font: 800 32px/1.15 var(--font-sans);
      letter-spacing: -0.025em;
      color: var(--fg-1);
    }

    /* ── Hero ── */
    .hero-block {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .hero-num {
      font: 800 72px/0.9 var(--font-sans);
      letter-spacing: -0.04em;
      color: var(--accent);
    }
    .hero-unit {
      font: 500 16px/1.4 var(--font-sans);
      color: var(--fg-2);
    }

    /* ── Supporting stats row ── */
    .stats-row {
      display: flex;
      align-items: stretch;
      gap: var(--s-4);
      padding: var(--s-4) var(--s-5);
      background: var(--elevated);
      border-radius: var(--r-md);
      border: 1px solid var(--border);
    }
    .stat-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }
    .stat-val {
      font: 700 28px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
    }
    .stat-sub {
      font: 400 12px/1.4 var(--font-sans);
      color: var(--fg-3);
    }
    .stat-divider {
      width: 1px;
      background: var(--border);
      align-self: stretch;
      flex-shrink: 0;
    }

    /* ── Chart block ── */
    .chart-block {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .chart-header {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .chart-note {
      font: 400 12px/1.5 var(--font-sans);
      color: var(--fg-3);
    }
    .chart {
      height: 300px;
      width: 100%;
    }
    .chart-legend {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }
    .legend-swatch {
      width: 24px;
      height: 3px;
      border-radius: 2px;
      flex-shrink: 0;
    }
    .accent-swatch { background: var(--accent); }
    .equal-swatch {
      background: transparent;
      border-top: 2px dashed var(--fg-3);
    }
    .legend-label {
      font: 600 10px/1.2 var(--font-sans);
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--fg-3);
      margin-right: var(--s-3);
    }
  `],
})
export class ChannelDiversityComponent implements OnChanges {
  @Input() data!: ChannelDiversity;

  chartOptions: EChartsOption = {};
  editorialHeadline = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.editorialHeadline = this.deriveHeadline();
      this.buildChart();
    }
  }

  private deriveHeadline(): string {
    if (!this.data) return 'Your viewing is highly concentrated';
    const total = this.data.total_channels || 1;
    const pct = Math.round((this.data.channels_for_50_pct / total) * 100);
    if (pct <= 5) return 'Your viewing is extremely concentrated';
    if (pct <= 15) return 'Your viewing is highly concentrated';
    if (pct <= 30) return 'You have a solid core of go-to channels';
    return 'Your viewing is spread across many channels';
  }

  private buildChart(): void {
    if (!this.data?.concentration_curve?.length) return;

    const curve = this.data.concentration_curve;
    const n = curve.length;

    // Build (x, y) pairs: x = channel rank as % of total channels (0–100),
    // y = cumulative % of content opened (concentration_curve values already 0–100).
    const seriesData: [number, number][] = curve.map((v, i) => [
      Math.round((i / (n - 1)) * 100),
      Math.round(v * 10) / 10,
    ]);

    // Perfect equality diagonal: (0,0) -> (100,100)
    const equalityData: [number, number][] = [[0, 0], [100, 100]];

    this.chartOptions = {
      ...baseChart(),
      tooltip: {
        ...(baseChart().tooltip as object),
        trigger: 'axis',
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const x = Array.isArray(p.value) ? p.value[0] : p.name;
          const y = Array.isArray(p.value) ? p.value[1] : p.value;
          return `<span style="font-family:${CHART.font};font-size:11px;color:${CHART.muted};">` +
            `Top ${x}% of channels</span><br/>` +
            `<span style="color:${CHART.accent};font-weight:700;">${y}%</span>` +
            `<span style="color:${CHART.muted};"> of content opened</span>`;
        },
      },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: {
        type: 'value',
        name: '% of channels (by volume rank)',
        nameLocation: 'center',
        nameGap: 28,
        nameTextStyle: { color: CHART.muted, fontFamily: CHART.font, fontSize: 11 },
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: CHART.border } },
        axisTick: { show: false },
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 11,
          formatter: (v: number) => `${v}%`,
        },
        splitLine: {
          show: true,
          lineStyle: { color: CHART.grid, type: 'dashed' },
        },
      },
      yAxis: {
        ...valueAxis({ name: '% of content opened', showSplit: true }),
        nameLocation: 'center',
        nameGap: 44,
        min: 0,
        max: 100,
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 11,
          formatter: (v: number) => `${v}%`,
        },
      },
      series: [
        {
          name: 'Your concentration',
          type: 'line',
          data: seriesData,
          smooth: false,
          showSymbol: false,
          lineStyle: { color: CHART.accent, width: 2.5 },
          itemStyle: { color: CHART.accent },
          areaStyle: { color: areaGradient(CHART.accent) },
          z: 2,
        },
        {
          name: 'Perfect equality',
          type: 'line',
          data: equalityData,
          smooth: false,
          showSymbol: false,
          lineStyle: {
            color: hexA(CHART.muted, 0.45),
            width: 1.5,
            type: 'dashed',
          },
          itemStyle: { color: hexA(CHART.muted, 0.45) },
          areaStyle: { color: 'none' as any },
          z: 1,
          tooltip: { show: false } as any,
        },
      ],
    };
  }
}
