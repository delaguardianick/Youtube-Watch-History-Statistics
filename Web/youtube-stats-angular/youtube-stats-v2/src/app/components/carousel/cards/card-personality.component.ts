import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WatchPersonality } from '../../../models/wrapped.models';
import { baseChart, categoryAxis, valueAxis, CHART, hexA } from '../../../shared/chart-theme';

@Component({
  selector: 'app-card-personality',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <header class="top">
      <span class="label">Watch Personality</span>
      <span class="badge-accent" *ngIf="badgeLabel">{{ badgeLabel }}</span>
    </header>

    <p class="headline" *ngIf="headlineText">{{ headlineText }}</p>

    <!-- 24-hour bar chart -->
    <div class="chart-wrap" *ngIf="data">
      <div echarts [options]="chartOptions" style="width:100%; height:180px;"></div>
    </div>

    <div class="divider"></div>

    <!-- Supporting stats row -->
    <div class="stats" *ngIf="data">
      <div class="stat">
        <span class="label-sm">Peak Hour</span>
        <span class="stat-num">{{ formatHour(data.peak_hour) }}</span>
      </div>
      <div class="vdivider"></div>
      <div class="stat">
        <span class="label-sm">Peak Day</span>
        <span class="stat-num">{{ data.peak_weekday }}</span>
      </div>
      <div class="vdivider" *ngIf="showWeekday"></div>
      <div class="stat" *ngIf="showWeekday">
        <span class="label-sm">Weekend %</span>
        <span class="stat-num">{{ weekendPct }}%</span>
      </div>
    </div>

    <!-- Mini 7-bar weekday strip -->
    <div class="week-strip" *ngIf="data && weekdayBars.length">
      <div
        class="week-bar-wrap"
        *ngFor="let bar of weekdayBars; let i = index"
      >
        <div
          class="week-bar"
          [style.height.px]="bar.height"
          [class.peak]="bar.isPeak"
        ></div>
        <span class="week-label">{{ bar.label }}</span>
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
      justify-content: space-between;
      align-items: center;
    }

    .headline {
      font: 700 22px/1.25 var(--font-sans);
      color: var(--fg-1);
      letter-spacing: -0.01em;
      margin: 0;
    }

    .chart-wrap {
      flex: 1 1 auto;
      min-height: 0;
    }

    .divider {
      height: 1px;
      background: var(--border);
    }

    .stats {
      display: flex;
      align-items: center;
      gap: var(--s-4);
    }

    .stat {
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex: 1;
    }

    .stat-num {
      font: 700 18px/1 var(--font-sans);
      color: var(--fg-1);
    }

    .vdivider {
      width: 1px;
      height: 36px;
      background: var(--border);
      flex-shrink: 0;
    }

    /* 7-bar weekday strip */
    .week-strip {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      padding-top: var(--s-1);
    }

    .week-bar-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .week-bar {
      width: 100%;
      border-radius: 3px 3px 0 0;
      background: var(--fg-3);
      min-height: 4px;
      transition: background 200ms;
    }

    .week-bar.peak {
      background: var(--accent);
    }

    .week-label {
      font: 600 9px/1 var(--font-sans);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--fg-3);
    }
  `],
})
export class CardPersonalityComponent implements OnChanges {
  @Input() data: WatchPersonality | null = null;

  badgeLabel = '';
  headlineText = '';
  chartOptions: EChartsOption = {};
  weekdayBars: { height: number; label: string; isPeak: boolean }[] = [];
  weekendPct = 0;
  showWeekday = false;

  private readonly DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  private readonly HEADLINE_MAP: Record<string, string> = {
    night_owl: "You're a Night Owl",
    early_bird: 'An Early Bird',
    nine_to_five: 'A Nine-to-Fiver',
  };

  private readonly BADGE_MAP: Record<string, string> = {
    night_owl: 'Night Owl',
    early_bird: 'Early Bird',
    nine_to_five: '9-to-5',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.headlineText = this.HEADLINE_MAP[this.data.type] ?? this.data.type;
      this.badgeLabel = this.BADGE_MAP[this.data.type] ?? this.data.type;
      this.buildWeekdayBars();
      this.buildChart();
    }
  }

  formatHour(hour: number | undefined | null): string {
    if (hour === undefined || hour === null) return '';
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  }

  private buildWeekdayBars(): void {
    const wd = this.data?.weekday_distribution;
    if (!wd || wd.length < 7) { this.weekdayBars = []; return; }

    const max = Math.max(...wd, 1);
    const MAX_H = 32;

    this.weekdayBars = this.DAY_LABELS.map((label, i) => ({
      height: Math.max(4, Math.round((wd[i] / max) * MAX_H)),
      label,
      isPeak: wd[i] === max,
    }));

    // weekend % (Sat=index 5, Sun=index 6)
    const total = wd.reduce((a, b) => a + b, 0);
    this.weekendPct = total > 0 ? Math.round(((wd[5] + wd[6]) / total) * 100) : 0;
    this.showWeekday = true;
  }

  private buildChart(): void {
    if (!this.data) return;

    const dist = this.data.hourly_distribution;
    const peak = this.data.peak_hour;

    // x-axis labels: show every 3 hours in 12h format
    const xLabels = Array.from({ length: 24 }, (_, h) => {
      if (h % 3 !== 0) return '';
      if (h === 0) return '12a';
      if (h === 12) return '12p';
      return h < 12 ? `${h}a` : `${h - 12}p`;
    });

    // Bar colors: accent for peak, muted for rest
    const itemColors = dist.map((_, i) =>
      i === peak ? CHART.accent : hexA(CHART.accent, 0.28)
    );

    // Night region: 21–5 (9pm to 5am)
    const nightStart = 21;
    const nightEnd = 29; // wraps: 24 + 5 = hours 21,22,23,0,1,2,3,4 => use markArea on 21..24 + 0..5

    this.chartOptions = {
      ...baseChart(),
      grid: { left: 4, right: 4, top: 16, bottom: 0, containLabel: true },
      tooltip: {
        ...(baseChart() as any).tooltip,
        trigger: 'axis',
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          const h = p.dataIndex as number;
          return `<span style="font-family:${CHART.font};font-size:12px;color:${CHART.muted}">${this.formatHour(h)}</span>` +
            `<span style="font-family:${CHART.font};font-size:13px;font-weight:700;color:${CHART.text};margin-left:8px">${p.value}</span>`;
        },
      },
      xAxis: {
        ...categoryAxis({ data: xLabels }),
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 10,
          interval: 0,
        },
        splitLine: { show: false },
      },
      yAxis: {
        ...valueAxis({ showSplit: false }),
        axisLabel: { show: false },
        splitLine: { show: false },
      },
      series: [
        {
          type: 'bar',
          data: dist.map((val, i) => ({
            value: val,
            itemStyle: { color: itemColors[i], borderRadius: [2, 2, 0, 0] },
          })),
          barMaxWidth: 18,
          // Night region shading via markArea
          markArea: {
            silent: true,
            itemStyle: {
              color: hexA(CHART.faint, 0.10),
              borderWidth: 0,
            },
            data: [
              [
                { xAxis: nightStart },
                { xAxis: 23 },
              ],
              [
                { xAxis: 0 },
                { xAxis: 5 },
              ],
            ] as any,
          },
        },
      ],
    };
  }
}
