import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DurationDistribution } from '../../../models/deep-dive.models';
import { baseChart, categoryAxis, valueAxis, CHART, hexA } from '../../../shared/chart-theme';

@Component({
  selector: 'app-duration-distribution',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <header class="section-header">
        <span class="label">DURATION</span>
        <h3 class="headline">{{ editorialHeadline }}</h3>
      </header>

      <div *ngIf="data?.buckets?.length; else empty" class="chart-wrap">
        <div echarts [options]="chartOptions" class="chart"></div>
      </div>

      <ng-template #empty>
        <p class="empty-state">No duration data available.</p>
      </ng-template>
    </section>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .section {
      padding: var(--s-6) var(--s-6) var(--s-5);
      background: var(--surface);
      border-radius: var(--r-lg);
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }

    .section-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }

    /* .label is global — just override margin */
    .headline {
      margin: 0;
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
    }

    .chart-wrap { width: 100%; }

    .chart {
      width: 100%;
      height: 320px;
    }

    .empty-state {
      color: var(--fg-3);
      font: 400 14px/1.5 var(--font-sans);
      margin: 0;
      padding: var(--s-5) 0;
      text-align: center;
    }
  `],
})
export class DurationDistributionComponent implements OnChanges {
  @Input() data!: DurationDistribution;

  chartOptions: EChartsOption = {};
  editorialHeadline = 'Video length distribution';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.buckets?.length) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data?.buckets?.length) return;

    const buckets = this.data.buckets;
    const maxCount = Math.max(...buckets.map(b => b.count));
    const maxIndex = buckets.findIndex(b => b.count === maxCount);
    const modalLabel = buckets[maxIndex]?.label ?? '';

    // Editorial headline based on the dominant bucket
    this.editorialHeadline = this.buildHeadline(modalLabel);

    // Horizontal bar: yAxis = categories, xAxis = values
    const labels = buckets.map(b => b.label);
    const seriesData = buckets.map((b, i) => ({
      value: b.count,
      itemStyle: {
        color: i === maxIndex ? CHART.accent : hexA(CHART.accent, 0.32),
        borderRadius: [0, 4, 4, 0],
      },
    }));

    this.chartOptions = {
      ...baseChart(),
      grid: { left: 16, right: 80, top: 8, bottom: 8, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'none' },
        backgroundColor: CHART.surface,
        borderColor: CHART.border,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: CHART.text, fontFamily: CHART.font, fontSize: 12 },
        extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-radius: 8px;',
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `<span style="font: 600 12px ${CHART.font}; color: ${CHART.muted}">${p.name}</span><br/>` +
            `<span style="font: 700 14px ${CHART.font}; color: ${CHART.accent}">${(p.value as number).toLocaleString()} videos</span>`;
        },
      },
      xAxis: {
        ...valueAxis({ showSplit: true }),
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 11,
          formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`,
        },
      },
      yAxis: {
        ...categoryAxis({ data: labels }),
        inverse: false,
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 12,
          width: 120,
          overflow: 'break',
        },
      },
      series: [
        {
          type: 'bar',
          data: seriesData,
          barMaxWidth: 32,
          label: {
            show: true,
            position: 'right',
            color: CHART.muted,
            fontFamily: CHART.font,
            fontSize: 11,
            fontWeight: 600,
            formatter: (p: any) =>
              (p.value as number) >= 1000
                ? `${((p.value as number) / 1000).toFixed(1)}k`
                : `${p.value}`,
          },
          emphasis: {
            itemStyle: { opacity: 0.85 },
          },
        },
      ],
    };
  }

  private buildHeadline(label: string): string {
    const lower = label.toLowerCase();
    if (lower.includes('short') || lower.includes('0-1') || lower.includes('0–1')) {
      return 'Most of what you open is under a minute';
    }
    if (lower.includes('1-5') || lower.includes('1–5')) {
      return 'Short clips dominate your watch history';
    }
    if (lower.includes('5-10') || lower.includes('5–10')) {
      return 'Medium-length videos are your sweet spot';
    }
    if (lower.includes('10-20') || lower.includes('10–20')) {
      return 'You gravitate toward deeper dives';
    }
    if (lower.includes('20-30') || lower.includes('20–30')) {
      return 'Long-form content is your comfort zone';
    }
    if (lower.includes('30-60') || lower.includes('30–60')) {
      return 'Half-hour videos hold your attention most';
    }
    if (lower.includes('60') || lower.includes('1h')) {
      return 'Hour-long videos are your most-watched format';
    }
    return `You watch the most ${label} videos`;
  }
}
