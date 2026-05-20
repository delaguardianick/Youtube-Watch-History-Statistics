import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { GenreJourney } from '../../../models/wrapped.models';
import {
  CHART, baseChart, categoryAxis, valueAxis, hexA,
} from '../../../shared/chart-theme';

const MAX_GENRES = 5;

@Component({
  selector: 'app-card-genres',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <header class="top">
      <span class="label">Genre Journey</span>
      <span class="badge-accent" *ngIf="data?.top_genre">
        {{ data!.top_genre.pct }}% {{ data!.top_genre.name }}
      </span>
    </header>

    <p class="headline" *ngIf="headlineText">{{ headlineText }}</p>

    <div class="chart-wrap">
      <div echarts [options]="chartOptions" style="height:100%; width:100%;"></div>
    </div>

    <!-- Legend pills -->
    <div class="legend" *ngIf="legendItems.length">
      <span class="legend-pill" *ngFor="let item of legendItems"
            [style.--dot]="item.color">
        <span class="dot"></span>{{ item.name }}
      </span>
    </div>

    <footer class="foot" *ngIf="data?.biggest_shift">
      <span class="label-sm">Biggest shift</span>
      <span class="shift-text">
        <span class="hl">{{ data!.biggest_shift!.from_genre }}</span>
        &rarr;
        <span class="hl">{{ data!.biggest_shift!.to_genre }}</span>
        &nbsp;in {{ shiftMonthLabel }}
      </span>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--s-3);
    }

    /* --- top row --- */
    .top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    /* --- headline --- */
    .headline {
      font: 700 22px/1.25 var(--font-sans);
      color: var(--fg-1);
      letter-spacing: -0.01em;
      margin: 0;
      flex-shrink: 0;
      max-width: 26ch;
    }
    .hl { color: var(--accent); }

    /* --- chart fills remaining space --- */
    .chart-wrap {
      flex: 1 1 0;
      min-height: 0;
    }

    /* --- legend --- */
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      flex-shrink: 0;
    }
    .legend-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font: 600 11px/1 var(--font-sans);
      color: var(--fg-2);
      letter-spacing: 0.02em;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--dot);
      flex-shrink: 0;
    }

    /* --- footer shift --- */
    .foot {
      border-top: 1px solid var(--border);
      padding-top: var(--s-3);
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      flex-shrink: 0;
    }
    .shift-text {
      font: 500 13px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
  `],
})
export class CardGenresComponent implements OnChanges {
  @Input() data: GenreJourney | null = null;

  chartOptions: EChartsOption = {};
  headlineText = '';
  shiftMonthLabel = '';
  legendItems: { name: string; color: string }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.buildHeadline();
      this.buildChart();
    }
  }

  private buildHeadline(): void {
    if (!this.data) return;
    const { top_genre, biggest_shift } = this.data;
    const parts: string[] = [];
    if (top_genre) {
      parts.push(`${top_genre.name} ruled your year — ${top_genre.pct}%`);
    }
    this.headlineText = parts.join(' · ');

    this.shiftMonthLabel = biggest_shift
      ? this.formatMonth(biggest_shift.month)
      : '';
  }

  private buildChart(): void {
    if (!this.data?.monthly_stacks?.length) return;

    const stacks = this.data.monthly_stacks;

    // --- aggregate total hours per genre across all months ---
    const totals: Record<string, number> = {};
    for (const entry of stacks) {
      for (const [genre, hours] of Object.entries(entry.genres)) {
        totals[genre] = (totals[genre] ?? 0) + hours;
      }
    }

    // keep TOP N genres by total hours, collapse rest into "Other"
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    const topGenres = sorted.slice(0, MAX_GENRES).map(([name]) => name);
    const hasOther = sorted.length > MAX_GENRES;

    // build per-genre data arrays
    const genreNames = hasOther ? [...topGenres, 'Other'] : topGenres;
    const dataMap: Record<string, number[]> = {};
    for (const g of genreNames) dataMap[g] = [];

    for (const entry of stacks) {
      let otherSum = 0;
      const seenTop = new Set<string>();
      for (const [genre, hours] of Object.entries(entry.genres)) {
        if (topGenres.includes(genre)) {
          seenTop.add(genre);
          dataMap[genre].push(hours);
        } else {
          otherSum += hours;
        }
      }
      // fill genres absent this month
      for (const g of topGenres) {
        if (!seenTop.has(g)) dataMap[g].push(0);
      }
      if (hasOther) dataMap['Other'].push(otherSum);
    }

    // formatted x-axis labels
    const xLabels = stacks.map(m => this.formatMonth(m.month));

    // build legend items
    this.legendItems = genreNames.map((name, i) => ({
      name,
      color: CHART.palette[i % CHART.palette.length],
    }));

    // markLine for biggest shift
    const shift = this.data.biggest_shift;
    const shiftIdx = shift
      ? stacks.findIndex(m => m.month === shift.month)
      : -1;

    const series: any[] = genreNames.map((genre, i) => {
      const color = CHART.palette[i % CHART.palette.length];
      const s: any = {
        name: genre,
        type: 'line',
        stack: 'total',
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: hexA(color, 0.72) },
              { offset: 1, color: hexA(color, 0.18) },
            ],
          },
        },
        emphasis: { focus: 'series' },
        showSymbol: false,
        smooth: 0.35,
        lineStyle: { width: 1.5, color },
        itemStyle: { color },
        data: dataMap[genre],
      };

      // annotate the shift month on the first/primary series only
      if (i === 0 && shiftIdx >= 0 && shift) {
        s.markLine = {
          silent: true,
          symbol: ['none', 'none'],
          label: {
            formatter: `${this.formatMonth(shift.month)}: genre shift`,
            fontSize: 10,
            color: CHART.muted,
            fontFamily: CHART.font,
          },
          lineStyle: { color: CHART.border, type: 'dashed', width: 1 },
          data: [{ xAxis: shiftIdx }],
        };
      }

      return s;
    });

    this.chartOptions = {
      ...baseChart(),
      color: CHART.palette,
      tooltip: {
        trigger: 'axis',
        backgroundColor: CHART.surface,
        borderColor: CHART.border,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: CHART.text, fontFamily: CHART.font, fontSize: 12 },
        extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-radius: 8px;',
        formatter: (params: any) => {
          if (!Array.isArray(params) || !params.length) return '';
          const label = params[0].axisValueLabel ?? params[0].name;
          const rows = (params as any[])
            .filter((p: any) => p.value > 0)
            .map((p: any) =>
              `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:5px;"></span>` +
              `${p.seriesName}: <b>${(p.value as number).toFixed(1)}h</b>`
            )
            .join('<br/>');
          return `<div style="font:600 11px/1.4 ${CHART.font};color:${CHART.muted};margin-bottom:4px">${label}</div>${rows}`;
        },
      },
      legend: { show: false }, // we use our own CSS legend
      grid: { left: 8, right: 8, top: 8, bottom: 4, containLabel: true },
      xAxis: {
        ...categoryAxis({ data: xLabels }),
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 10,
          interval: 'auto',
        },
        boundaryGap: false,
      },
      yAxis: {
        ...valueAxis({ showSplit: true }),
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 10,
          formatter: (v: number) => v >= 1 ? `${Math.round(v)}h` : '',
        },
      },
      series,
    };
  }

  /** Format 'YYYY-MM' -> "Jul '25" */
  private formatMonth(ym: string): string {
    if (!ym || ym.length < 7) return ym;
    const [year, month] = ym.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    if (isNaN(date.getTime())) return ym;
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
}
