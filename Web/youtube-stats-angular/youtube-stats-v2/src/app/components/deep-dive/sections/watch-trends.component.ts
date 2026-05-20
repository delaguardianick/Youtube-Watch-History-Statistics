import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WatchTrends } from '../../../models/deep-dive.models';
import {
  baseChart,
  categoryAxis,
  valueAxis,
  areaGradient,
  CHART,
  hexA,
} from '../../../shared/chart-theme';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonth(yyyyMM: string): string {
  const [year, mon] = yyyyMM.split('-');
  const shortYear = year.slice(2);
  return `${MONTH_NAMES[(parseInt(mon, 10) - 1) % 12]} '${shortYear}`;
}

@Component({
  selector: 'app-watch-trends',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section trends-section">

      <!-- Header -->
      <div class="section-header">
        <span class="label">Watch Trends</span>
        <h2 class="headline" *ngIf="peakMonthLabel">
          Your busiest month was
          <span class="hl">{{ peakMonthLabel }}</span>
        </h2>
        <h2 class="headline" *ngIf="!peakMonthLabel">Watch activity over time</h2>
      </div>

      <!-- Stat row -->
      <div class="stats-row" *ngIf="data?.monthly?.length">
        <div class="stat-block">
          <span class="label-sm">Peak Month</span>
          <span class="stat-val">{{ peakMonthLabel }}</span>
          <span class="stat-sub">{{ peakHours | number:'1.0-0' }} hrs watched</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-block">
          <span class="label-sm">Monthly Average</span>
          <span class="stat-val">{{ avgHours | number:'1.0-0' }}<span class="stat-unit">hrs</span></span>
          <span class="stat-sub">across {{ data!.monthly.length }} months</span>
        </div>
        <div class="stat-divider" *ngIf="hasPartial"></div>
        <div class="stat-block partial-note" *ngIf="hasPartial">
          <span class="partial-pill">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <circle cx="5" cy="5" r="4" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>
            </svg>
            Partial month
          </span>
          <span class="stat-sub">{{ partialMonthLabel }} is still in progress</span>
        </div>
      </div>

      <!-- Chart -->
      <div class="chart-wrap" *ngIf="data?.monthly?.length; else empty">
        <div echarts [options]="chartOptions" class="chart"></div>
      </div>

      <ng-template #empty>
        <div class="empty-state">No trend data available yet.</div>
      </ng-template>

    </section>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .trends-section {
      padding: var(--s-9) var(--s-5);
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .section-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      margin-bottom: var(--s-6);
    }

    .headline {
      font: 700 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-2) 0 0;
    }
    .hl { color: var(--accent); }

    /* ── Stat row ── */
    .stats-row {
      display: flex;
      align-items: stretch;
      flex-wrap: wrap;
      gap: var(--s-4);
      padding: var(--s-5);
      background: var(--elevated);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      margin-bottom: var(--s-6);
    }

    .stat-block {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      min-width: 120px;
    }

    .stat-val {
      font: 700 32px/1 var(--font-sans);
      letter-spacing: -0.03em;
      color: var(--fg-1);
    }
    .stat-unit {
      font-size: 16px;
      font-weight: 500;
      color: var(--fg-2);
      margin-left: 3px;
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

    /* ── Partial month note ── */
    .partial-note { justify-content: center; }

    .partial-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid rgba(255, 54, 33, 0.28);
      border-radius: var(--r-pill);
      padding: 3px 10px;
      font: 600 11px/1.3 var(--font-sans);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      width: fit-content;
    }

    /* ── Chart ── */
    .chart-wrap {
      background: var(--elevated);
      border: 1px solid var(--border);
      border-radius: var(--r-lg);
      padding: var(--s-5) var(--s-4) var(--s-3);
      overflow: hidden;
    }

    .chart {
      height: 340px;
      width: 100%;
    }

    /* ── Empty ── */
    .empty-state {
      padding: var(--s-7);
      text-align: center;
      color: var(--fg-3);
      font: 400 14px/1.5 var(--font-sans);
      background: var(--elevated);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
    }
  `],
})
export class WatchTrendsComponent implements OnChanges {
  @Input() data!: WatchTrends;

  chartOptions: EChartsOption = {};
  peakMonthLabel = '';
  peakHours = 0;
  avgHours = 0;
  hasPartial = false;
  partialMonthLabel = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.computeStats();
      this.buildChart();
    }
  }

  private computeStats(): void {
    const monthly = this.data?.monthly;
    if (!monthly?.length) return;

    // Exclude partial month from avg/peak calc
    const complete = monthly.filter(m => !m.is_partial);
    const source = complete.length ? complete : monthly;

    const peak = source.reduce((a, b) => a.hours > b.hours ? a : b);
    this.peakMonthLabel = formatMonth(peak.month);
    this.peakHours = peak.hours;
    this.avgHours = source.reduce((s, m) => s + m.hours, 0) / source.length;

    const last = monthly[monthly.length - 1];
    this.hasPartial = !!last?.is_partial;
    this.partialMonthLabel = this.hasPartial ? formatMonth(last.month) : '';
  }

  private buildChart(): void {
    const monthly = this.data?.monthly;
    if (!monthly?.length) return;

    const labels = monthly.map(m => formatMonth(m.month));
    const hours  = monthly.map(m => Math.round(m.hours * 10) / 10);

    // Find peak index for markPoint
    const complete = monthly.filter(m => !m.is_partial);
    const peakVal  = complete.length
      ? Math.max(...complete.map(m => m.hours))
      : Math.max(...monthly.map(m => m.hours));
    const peakIdx  = hours.indexOf(Math.round(peakVal * 10) / 10);

    // Split series: solid main body, dashed partial tail
    const lastIdx = monthly.length - 1;
    const isLastPartial = !!monthly[lastIdx]?.is_partial;

    // Build series data — main line is all points; the partial segment
    // is overlaid as a separate dashed series sharing the last two points.
    const mainData: (number | null)[] = isLastPartial
      ? hours.map((v, i) => (i === lastIdx ? null : v))
      : hours.slice();

    // Ensure the join is seamless: keep the second-to-last point in main
    // (already there) and include it as the first point of the partial series.
    const partialData: (number | null)[] = isLastPartial
      ? hours.map((v, i) => (i < lastIdx - 1 ? null : v))
      : [];

    const rotate = labels.length > 18 ? 45 : 0;

    const mainSeries: any = {
      name: 'Hours',
      type: 'line',
      data: isLastPartial ? mainData : hours,
      smooth: true,
      showSymbol: false,
      connectNulls: false,
      lineStyle: { color: CHART.accent, width: 2.5 },
      itemStyle: { color: CHART.accent },
      areaStyle: { color: areaGradient(CHART.accent) },
      markPoint: peakIdx >= 0 ? {
        symbol: 'circle',
        symbolSize: 12,
        data: [{
          coord: [peakIdx, hours[peakIdx]],
          label: {
            show: true,
            position: 'top',
            formatter: `${hours[peakIdx]}h`,
            color: CHART.text,
            fontFamily: CHART.font,
            fontSize: 11,
            fontWeight: 700,
            backgroundColor: CHART.surface,
            borderColor: CHART.accent,
            borderWidth: 1,
            borderRadius: 4,
            padding: [3, 6],
          },
          itemStyle: {
            color: CHART.accent,
            borderColor: CHART.text,
            borderWidth: 2,
          },
        }],
      } : undefined,
    };

    const partialSeries: any = isLastPartial ? {
      name: 'Partial',
      type: 'line',
      data: partialData,
      smooth: true,
      showSymbol: true,
      connectNulls: false,
      lineStyle: { color: CHART.accent, width: 2, type: 'dashed', opacity: 0.6 },
      itemStyle: {
        color: 'transparent',
        borderColor: CHART.accent,
        borderWidth: 2,
      },
      symbolSize: 8,
      symbol: 'circle',
      areaStyle: { color: areaGradient(hexA(CHART.accent, 0.4)) },
    } : null;

    const allSeries = partialSeries
      ? [mainSeries, partialSeries]
      : [mainSeries];

    this.chartOptions = {
      ...baseChart(),
      grid: { left: 8, right: 16, top: 32, bottom: 8, containLabel: true },
      tooltip: {
        ...(baseChart().tooltip as object),
        trigger: 'axis',
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const idx: number = p.dataIndex;
          const trend = monthly[idx];
          if (!trend) return '';
          const partialTag = trend.is_partial
            ? `<div style="margin-top:4px;color:${hexA(CHART.accent, 0.8)};font-size:10px;">Partial month</div>`
            : '';
          return `
            <div style="font-family:${CHART.font};min-width:130px;">
              <div style="font-weight:700;color:${CHART.text};margin-bottom:4px;">${formatMonth(trend.month)}</div>
              <div style="color:${CHART.accent};font-size:13px;font-weight:600;">${trend.hours.toFixed(1)} hrs</div>
              <div style="color:${CHART.muted};font-size:11px;">${trend.video_count} videos</div>
              ${partialTag}
            </div>`;
        },
      },
      xAxis: {
        ...categoryAxis({ data: labels }),
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 11,
          rotate,
          interval: labels.length > 24 ? Math.floor(labels.length / 12) - 1 : 0,
        },
      },
      yAxis: {
        ...valueAxis({ name: 'HRS', showSplit: true }),
      },
      series: allSeries,
    };
  }
}
