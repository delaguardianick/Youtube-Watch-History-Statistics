import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { ActivityHeatmap } from '../../../models/deep-dive.models';
import { baseChart, CHART } from '../../../shared/chart-theme';

/** Day-of-week index → short label (Mon-first, ISO weekday 1=Mon). */
const DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Parse 'YYYY-MM-DD' without UTC offset issues. */
function parseDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Format Date as 'YYYY-MM-DD'. */
function fmtIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** ISO weekday: Mon=1 … Sun=7. */
function isoWeekday(d: Date): number {
  return d.getDay() === 0 ? 7 : d.getDay();
}

interface StatPill {
  label: string;
  value: string;
}

@Component({
  selector: 'app-activity-heatmap',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section heatmap-section" *ngIf="data?.data?.length; else empty">

      <!-- Header -->
      <div class="section-header">
        <span class="label">ACTIVITY</span>
        <h2 class="headline">{{ headline }}</h2>
      </div>

      <!-- Rolling 53-week GitHub-style calendar -->
      <div class="chart-wrap">
        <div echarts [options]="chartOptions" class="heatmap-chart"></div>
      </div>

      <!-- Stat row -->
      <div class="stat-row" *ngIf="stats.length">
        <div class="stat-pill" *ngFor="let s of stats">
          <span class="stat-value">{{ s.value }}</span>
          <span class="label-sm">{{ s.label }}</span>
        </div>
      </div>

    </section>

    <ng-template #empty>
      <section class="section heatmap-section">
        <span class="label">ACTIVITY</span>
        <p class="headline no-data">No activity data available</p>
      </section>
    </ng-template>
  `,
  styles: [`
    :host { display: block; }

    .heatmap-section {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }

    /* Header */
    .section-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }

    /* Chart wrapper — let ECharts fill full width */
    .chart-wrap {
      width: 100%;
      background: var(--elevated);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: var(--s-4) var(--s-4) var(--s-3);
      overflow: hidden;
    }
    .heatmap-chart {
      width: 100%;
      height: 190px;
    }

    /* Stat row */
    .stat-row {
      display: flex;
      gap: var(--s-4);
      flex-wrap: wrap;
    }
    .stat-pill {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      background: var(--elevated);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
      padding: var(--s-3) var(--s-5);
      flex: 1;
      min-width: 160px;
    }
    .stat-value {
      font: 700 20px/1.1 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--accent);
    }

    .no-data { color: var(--fg-3); }
  `],
})
export class ActivityHeatmapComponent implements OnChanges {
  @Input() data!: ActivityHeatmap;

  chartOptions: EChartsOption = {};
  headline = '';
  stats: StatPill[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.data?.length) {
      this.buildAll();
    }
  }

  private buildAll(): void {
    const raw = this.data.data;

    // Sort and find date range
    const sorted = [...raw].sort((a, b) => a.date.localeCompare(b.date));
    const latestDate = parseDate(sorted[sorted.length - 1].date);

    // Rolling window: ~53 weeks back (371 days) ending on the latest data date
    const windowStart = new Date(latestDate);
    windowStart.setDate(windowStart.getDate() - 371);
    // Align window start to the Monday of that week
    const dow = isoWeekday(windowStart); // 1=Mon
    if (dow > 1) windowStart.setDate(windowStart.getDate() - (dow - 1));

    // Build lookup map for quick access
    const byDate = new Map<string, { video_count: number; hours: number }>();
    for (const d of raw) byDate.set(d.date, d);

    // Enumerate every day in the rolling window
    type CalCell = [string, number, number, number]; // [iso, weekCol, dowRow(0=Mon), hours]
    const cells: CalCell[] = [];
    const cur = new Date(windowStart);
    let weekCol = 0;
    let prevWeek = -1;

    while (cur <= latestDate) {
      const iso = fmtIso(cur);
      const dow0 = isoWeekday(cur) - 1; // 0=Mon..6=Sun
      const week = Math.floor((cur.getTime() - windowStart.getTime()) / (7 * 86400000));
      if (week !== prevWeek) { weekCol = week; prevWeek = week; }
      const entry = byDate.get(iso);
      cells.push([iso, weekCol, dow0, entry ? entry.hours : 0]);
      cur.setDate(cur.getDate() + 1);
    }

    // Build month label positions (first Monday-aligned week of each month)
    const monthLabels: { weekCol: number; label: string }[] = [];
    const seenMonths = new Set<string>();
    for (const [iso, wc] of cells) {
      const d = parseDate(iso);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seenMonths.has(key) && d.getDate() <= 7) {
        seenMonths.add(key);
        monthLabels.push({ weekCol: wc, label: MONTH_SHORT[d.getMonth()] });
      }
    }

    const maxHours = Math.max(...cells.map(c => c[3]), 1);

    // ECharts scatter on a custom grid acting as the calendar
    const scatterData = cells.map(([, wc, dow0, hours]) => [wc, dow0, hours]);

    // Headline
    const activeDays = sorted.filter(d => {
      const dt = parseDate(d.date);
      return dt >= windowStart && dt <= latestDate && d.video_count > 0;
    }).length;
    const windowDays = Math.round((latestDate.getTime() - windowStart.getTime()) / 86400000) + 1;
    const trackDays = Math.min(windowDays, 365);
    this.headline = `You watched on ${activeDays} of the last ${trackDays} days`;

    // Compute stat pills
    this.stats = this.buildStats(sorted, windowStart, latestDate);

    // Build ECharts option
    const totalWeeks = Math.ceil(windowDays / 7) + 1;
    const monthXAxisData = Array.from({ length: totalWeeks }, (_, i) => String(i));
    const monthAxisLabels = Array.from({ length: totalWeeks }, (_, i) => {
      const ml = monthLabels.find(m => m.weekCol === i);
      return ml ? ml.label : '';
    });

    this.chartOptions = {
      ...baseChart(),
      grid: { left: 40, right: 8, top: 20, bottom: 4, containLabel: false },
      tooltip: {
        trigger: 'item',
        backgroundColor: CHART.surface,
        borderColor: CHART.border,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: CHART.text, fontFamily: CHART.font, fontSize: 12 },
        extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-radius: 8px;',
        formatter: (params: any) => {
          const [wc, dow0, hours] = params.data as [number, number, number];
          // Reconstruct the date from week col + dow
          const d = new Date(windowStart);
          d.setDate(d.getDate() + wc * 7 + dow0);
          const iso = fmtIso(d);
          const entry = byDate.get(iso);
          if (!entry) {
            return `<span style="font: 700 11px ${CHART.font}; color: ${CHART.muted}">${iso}</span><br/>`
              + `<span style="color: ${CHART.faint}">No activity</span>`;
          }
          return `<span style="font: 700 11px ${CHART.font}; color: ${CHART.muted}">${iso}</span><br/>`
            + `<span style="color: ${CHART.text}">${entry.video_count} video${entry.video_count !== 1 ? 's' : ''}</span>`
            + `<span style="color: ${CHART.faint}"> · </span>`
            + `<span style="color: ${CHART.accent}">${entry.hours.toFixed(1)}h</span>`;
        },
      },
      visualMap: {
        min: 0,
        max: maxHours,
        inRange: { color: CHART.heatRamp },
        show: false,
        seriesIndex: 0,
        dimension: 2,
      },
      xAxis: {
        type: 'category',
        data: monthXAxisData,
        axisLabel: {
          show: true,
          interval: 0,
          formatter: (_val: string, idx: number) => monthAxisLabels[idx] ?? '',
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 11,
        },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: DOW_LABELS,
        inverse: false,
        axisLabel: {
          color: CHART.faint,
          fontFamily: CHART.font,
          fontSize: 10,
          interval: 0,
          formatter: (val: string, idx: number) => (idx % 2 === 0 ? val : ''),
        },
        axisTick: { show: false },
        axisLine: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          type: 'scatter',
          symbol: 'rect',
          // symbolSize will be set via a function so cells are square and gap-spaced
          symbolSize: [13, 13],
          itemStyle: {
            borderRadius: 2,
          },
          data: scatterData,
          large: true,
        },
      ],
    };
  }

  private buildStats(
    sorted: { date: string; video_count: number; hours: number }[],
    windowStart: Date,
    latestDate: Date
  ): StatPill[] {
    const pills: StatPill[] = [];

    // -- Most active weekday --
    const dowTotals = new Array(7).fill(0); // 0=Mon..6=Sun
    for (const d of sorted) {
      const dt = parseDate(d.date);
      if (dt >= windowStart && dt <= latestDate && d.video_count > 0) {
        const dow0 = isoWeekday(dt) - 1;
        dowTotals[dow0] += d.video_count;
      }
    }
    const bestDowIdx = dowTotals.indexOf(Math.max(...dowTotals));
    if (dowTotals[bestDowIdx] > 0) {
      pills.push({ value: DOW_LABELS[bestDowIdx], label: 'most active weekday' });
    }

    // -- Longest streak of consecutive days with any watch activity --
    let streak = 0;
    let maxStreak = 0;
    let prev: Date | null = null;
    for (const d of sorted) {
      if (d.video_count === 0) continue;
      const dt = parseDate(d.date);
      if (prev !== null) {
        const diff = Math.round((dt.getTime() - prev.getTime()) / 86400000);
        if (diff === 1) {
          streak++;
        } else {
          streak = 1;
        }
      } else {
        streak = 1;
      }
      if (streak > maxStreak) maxStreak = streak;
      prev = dt;
    }
    if (maxStreak > 0) {
      pills.push({ value: `${maxStreak} days`, label: 'longest streak' });
    }

    // -- Busiest month (by video count) in the window --
    const monthTotals = new Map<string, number>();
    for (const d of sorted) {
      const dt = parseDate(d.date);
      if (dt >= windowStart && dt <= latestDate && d.video_count > 0) {
        const key = `${dt.getFullYear()}-${dt.getMonth()}`;
        monthTotals.set(key, (monthTotals.get(key) ?? 0) + d.video_count);
      }
    }
    if (monthTotals.size > 0) {
      let bestKey = '';
      let bestCount = 0;
      monthTotals.forEach((count, key) => {
        if (count > bestCount) { bestCount = count; bestKey = key; }
      });
      if (bestKey) {
        const [y, m] = bestKey.split('-').map(Number);
        pills.push({ value: `${MONTH_SHORT[m]} ${y}`, label: 'busiest month' });
      }
    }

    return pills;
  }
}
