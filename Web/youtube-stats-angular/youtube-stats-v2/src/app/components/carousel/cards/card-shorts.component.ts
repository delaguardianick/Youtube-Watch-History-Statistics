import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ShortsData } from '../../../models/wrapped.models';
import {
  baseChart,
  categoryAxis,
  valueAxis,
  areaGradient,
  CHART,
  hexA,
} from '../../../shared/chart-theme';

@Component({
  selector: 'app-card-shorts',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <header class="top">
      <span class="label">Shorts Life</span>
    </header>

    <div class="hero">
      <div class="hero-num">{{ data?.total_count | number }}</div>
      <div class="hero-unit">Shorts opened</div>
    </div>

    <p class="headline">
      You scrolled <span class="hl">{{ roundedHours }} hrs</span> of vertical
      video — one after another.
    </p>

    <div class="stats-row">
      <div class="stat-block" *ngIf="data?.longest_binge">
        <span class="label-sm">Longest binge</span>
        <span class="stat-val">{{ data!.longest_binge!.count }}</span>
        <span class="stat-sub">Shorts in {{ roundedBingeMinutes }} min</span>
      </div>
      <div class="stat-divider" *ngIf="data?.longest_binge"></div>
      <div class="stat-block" *ngIf="data?.vs_longform">
        <span class="label-sm">Of all videos</span>
        <span class="stat-val">{{ roundedShortsPct }}<span class="stat-pct">%</span></span>
        <span class="stat-sub">were Shorts</span>
      </div>
    </div>

    <div class="chart-section" *ngIf="data?.hourly_comparison">
      <div class="chart-header">
        <span class="label-sm">Hourly activity</span>
        <span class="chart-note">You scroll Shorts hardest after noon</span>
      </div>
      <div echarts [options]="chartOptions" class="chart"></div>
      <div class="chart-legend">
        <span class="legend-dot shorts"></span><span class="legend-label">Shorts</span>
        <span class="legend-dot longform"></span><span class="legend-label">Long-form</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--s-4);
    }

    .top {
      display: flex;
      align-items: baseline;
    }

    /* ── Hero ── */
    .hero { margin-top: var(--s-2); }
    .hero-num {
      font: 800 88px/0.9 var(--font-sans);
      letter-spacing: -0.03em;
      color: var(--accent);
    }
    .hero-unit {
      margin-top: var(--s-3);
      font: 500 16px/1.3 var(--font-sans);
      color: var(--fg-2);
    }

    /* ── Headline ── */
    .headline {
      margin: 0;
      font: 600 18px/1.45 var(--font-sans);
      color: var(--fg-1);
      max-width: 28ch;
    }
    .hl { color: var(--accent); }

    /* ── Stat row ── */
    .stats-row {
      display: flex;
      align-items: stretch;
      gap: var(--s-4);
      padding: var(--s-4);
      background: var(--elevated);
      border-radius: var(--r-md);
      border: 1px solid var(--border);
    }
    .stat-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }
    .stat-val {
      font: 700 28px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
    }
    .stat-pct {
      font-size: 18px;
      font-weight: 600;
      color: var(--fg-2);
    }
    .stat-sub {
      font: 400 12px/1.4 var(--font-sans);
      color: var(--fg-3);
    }
    .stat-divider {
      width: 1px;
      background: var(--border);
      align-self: stretch;
    }

    /* ── Chart section ── */
    .chart-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      margin-top: auto;
    }
    .chart-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .chart-note {
      font: 500 12px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
    .chart {
      height: 120px;
      width: 100%;
    }
    .chart-legend {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-dot.shorts { background: var(--accent); }
    .legend-dot.longform { background: var(--fg-3); }
    .legend-label {
      font: 600 10px/1.2 var(--font-sans);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--fg-3);
      margin-right: var(--s-2);
    }
  `],
})
export class CardShortsComponent implements OnChanges {
  @Input() data: ShortsData | null = null;

  chartOptions: EChartsOption = {};

  roundedHours = 0;
  roundedBingeMinutes = 0;
  roundedShortsPct = 0;

  private readonly hourLabels = [
    '12A','1A','2A','3A','4A','5A','6A','7A','8A','9A','10A','11A',
    '12P','1P','2P','3P','4P','5P','6P','7P','8P','9P','10P','11P',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.roundedHours = Math.round(this.data.total_hours * 10) / 10;
      this.roundedBingeMinutes = this.data.longest_binge
        ? Math.round(this.data.longest_binge.duration_minutes)
        : 0;
      this.roundedShortsPct = this.data.vs_longform
        ? Math.round(this.data.vs_longform.shorts_pct_videos)
        : 0;
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data?.hourly_comparison) return;

    const longformColor = hexA(CHART.faint, 0.9);

    this.chartOptions = {
      ...baseChart(),
      tooltip: {
        ...(baseChart().tooltip as object),
        trigger: 'axis',
      },
      grid: { left: 8, right: 8, top: 8, bottom: 0, containLabel: true },
      xAxis: {
        ...categoryAxis({ data: this.hourLabels }),
        axisLabel: {
          color: CHART.faint,
          fontFamily: CHART.font,
          fontSize: 9,
          interval: 5,
        },
      },
      yAxis: {
        ...valueAxis({ showSplit: true }),
        axisLabel: { color: CHART.faint, fontFamily: CHART.font, fontSize: 9 },
      },
      series: [
        {
          name: 'Shorts',
          type: 'line',
          data: this.data!.hourly_comparison.shorts,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: CHART.accent, width: 2 },
          itemStyle: { color: CHART.accent },
          areaStyle: { color: areaGradient(CHART.accent) },
        },
        {
          name: 'Long-form',
          type: 'line',
          data: this.data!.hourly_comparison.longform,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: longformColor, width: 1.5 },
          itemStyle: { color: longformColor },
          areaStyle: { color: areaGradient(CHART.faint) },
        },
      ],
    };
  }
}
