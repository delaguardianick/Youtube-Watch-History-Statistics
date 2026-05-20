import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
import { HourlyWeekdayHeatmap } from '../../../models/deep-dive.models';
import { baseChart, CHART } from '../../../shared/chart-theme';

@Component({
  selector: 'app-hourly-weekday-heatmap',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <div class="section-inner">
        <header class="section-header">
          <span class="label">PATTERNS</span>
          <h2 class="headline">{{ editorialHeadline }}</h2>
        </header>

        <ng-container *ngIf="hasData; else empty">
          <div class="peak-badge" *ngIf="peakLabel">
            <span class="badge-accent">PEAK</span>
            <span class="peak-text">{{ peakLabel }}</span>
          </div>
          <div echarts [options]="chartOptions" class="heatmap-chart"></div>
          <div class="hour-legend">
            <span *ngFor="let h of hourTicks" class="hour-tick">{{ h.label }}</span>
          </div>
        </ng-container>

        <ng-template #empty>
          <p class="empty-msg">No watch-time data available.</p>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .section {
      background: var(--surface);
      width: 100%;
    }

    .section-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--s-7) var(--s-6);
    }

    .section-header {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      margin-bottom: var(--s-5);
    }

    .peak-badge {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin-bottom: var(--s-4);
    }

    .peak-text {
      font: 600 13px/1 var(--font-sans);
      color: var(--fg-2);
    }

    .heatmap-chart {
      width: 100%;
      height: 280px;
    }

    .hour-legend {
      display: flex;
      justify-content: space-between;
      padding: var(--s-2) 0 0 52px; /* align under chart grid — matches left grid offset */
      margin-top: var(--s-1);
    }

    .hour-tick {
      font: 600 10px/1 var(--font-sans);
      letter-spacing: 0.04em;
      color: var(--fg-3);
      flex: 1;
      text-align: center;
    }

    .empty-msg {
      font: 400 14px/1.5 var(--font-sans);
      color: var(--fg-3);
      padding: var(--s-7) 0;
      text-align: center;
    }
  `],
})
export class HourlyWeekdayHeatmapComponent implements OnChanges {
  @Input() data!: HourlyWeekdayHeatmap;

  chartOptions: EChartsOption = {};
  hasData = false;
  editorialHeadline = 'When you watch';
  peakLabel = '';

  // Every-3-hour tick labels shown below the chart (8 ticks for 0,3,6,...,21)
  readonly hourTicks: { label: string }[] = [
    { label: '12a' }, { label: '3a' }, { label: '6a' }, { label: '9a' },
    { label: '12p' }, { label: '3p' }, { label: '6p' }, { label: '9p' },
  ];

  private readonly WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  private readonly WEEKDAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.hasData = !!(this.data?.data?.length);
      if (this.hasData) {
        this.buildChart();
      }
    }
  }

  private hourLabel(h: number): string {
    if (h === 0) return '12a';
    if (h < 12) return `${h}a`;
    if (h === 12) return '12p';
    return `${h - 12}p`;
  }

  private buildChart(): void {
    const cells = this.data.data;

    // Build a complete 7×24 grid; missing cells default to 0
    const grid = new Map<string, number>();
    for (const c of cells) {
      grid.set(`${c.weekday},${c.hour}`, c.hours);
    }

    // Find peak cell
    let peakVal = 0;
    let peakWeekday = 0;
    let peakHour = 0;
    for (const c of cells) {
      if (c.hours > peakVal) {
        peakVal = c.hours;
        peakWeekday = c.weekday;
        peakHour = c.hour;
      }
    }

    // Derive editorial headline from peak
    const dayName = this.WEEKDAY_FULL[peakWeekday] ?? 'weekdays';
    const timeOfDay = this.timeOfDayLabel(peakHour);
    this.editorialHeadline = `You watch most on ${dayName} ${timeOfDay}`;

    // Peak badge copy
    const peakHours = Math.round(peakVal * 10) / 10;
    this.peakLabel =
      `${this.WEEKDAY_LABELS[peakWeekday]} ${this.hourLabel(peakHour)} — ${peakHours.toFixed(1)}h avg`;

    // Build ECharts data: [hour, weekday, value]
    // weekday on y-axis (0=Mon at bottom — ECharts reverses category axis naturally)
    const chartData: [number, number, number][] = [];
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        chartData.push([h, d, Math.round((grid.get(`${d},${h}`) ?? 0) * 100) / 100]);
      }
    }

    const maxVal = Math.max(peakVal, 1);

    // Minimum visible floor: non-zero cells show at least 4% of the ramp
    // We do this by nudging 0 to -epsilon and letting ECharts map 0 to empty
    // and tiny values to a faint-but-visible colour.
    const floorMin = -0.001; // just below 0 so true zeros map to the bg colour

    // Peak cell gets a label annotation
    const peakMarkPoint = {
      data: [
        {
          coord: [peakHour, peakWeekday],
          value: peakHours.toFixed(1),
          itemStyle: { color: 'transparent' },
          label: {
            show: true,
            position: 'inside',
            formatter: `${peakHours.toFixed(1)}h`,
            color: '#ffffff',
            fontFamily: CHART.font,
            fontWeight: 700,
            fontSize: 11,
            textBorderColor: 'rgba(0,0,0,0.6)',
            textBorderWidth: 3,
          },
        },
      ],
    };

    this.chartOptions = {
      ...baseChart(),
      grid: {
        left: 52,
        right: 16,
        top: 36,
        bottom: 8,
        containLabel: false,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: CHART.surface,
        borderColor: CHART.border,
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: CHART.text, fontFamily: CHART.font, fontSize: 12 },
        extraCssText: 'box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-radius: 8px;',
        formatter: (params: any) => {
          const [hour, weekday, hours] = params.data as [number, number, number];
          const isPeak = weekday === peakWeekday && hour === peakHour;
          const peakTag = isPeak
            ? `<span style="background:${CHART.accentSoft};color:${CHART.accent};border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;margin-left:6px;">PEAK</span>`
            : '';
          return (
            `<span style="font-weight:700">${this.WEEKDAY_LABELS[weekday]} ${this.hourLabel(hour)}</span>${peakTag}<br/>` +
            `<span style="color:${CHART.accent};font-weight:700">${hours.toFixed(1)}h</span>` +
            `<span style="color:${CHART.muted}"> avg watched</span>`
          );
        },
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => String(i)),
        axisLabel: { show: false }, // replaced by .hour-legend below chart
        axisLine: { show: false },
        axisTick: { show: false },
        splitArea: { show: false },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'category',
        data: this.WEEKDAY_LABELS,
        axisLabel: {
          color: CHART.muted,
          fontFamily: CHART.font,
          fontSize: 11,
          fontWeight: 600,
          margin: 8,
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitArea: { show: false },
        splitLine: { show: false },
      },
      visualMap: {
        min: floorMin,
        max: maxVal,
        inRange: {
          color: CHART.heatRamp,
        },
        show: false,
      },
      series: [
        {
          type: 'heatmap',
          data: chartData,
          label: { show: false },
          itemStyle: {
            borderColor: CHART.surface,
            borderWidth: 1.5,
            borderRadius: 3,
          },
          emphasis: {
            itemStyle: {
              borderColor: CHART.accent,
              borderWidth: 2,
            },
          },
          markPoint: peakMarkPoint,
        } as any,
      ],
    };
  }

  private timeOfDayLabel(hour: number): string {
    if (hour >= 5 && hour < 12) return 'mornings';
    if (hour >= 12 && hour < 17) return 'afternoons';
    if (hour >= 17 && hour < 21) return 'evenings';
    return 'nights';
  }
}
