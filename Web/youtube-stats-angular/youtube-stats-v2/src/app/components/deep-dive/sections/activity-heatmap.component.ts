import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ActivityHeatmap } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-activity-heatmap',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <span class="label">ACTIVITY</span>
      <h3 class="section-title">Daily watch heatmap</h3>
      <div class="year-selector">
        @for (year of data.year_range; track year) {
          <button
            class="year-btn"
            [class.active]="year === selectedYear"
            (click)="selectYear(year)">
            {{ year }}
          </button>
        }
      </div>
      <div echarts [options]="chartOptions" style="height: 200px; width: 100%;"></div>
    </section>
  `,
  styles: [`
    .section-title {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-3) 0 var(--s-5);
    }
    .year-selector {
      display: flex;
      gap: var(--s-2);
      margin-bottom: var(--s-5);
    }
    .year-btn {
      font: 600 11px/1.2 var(--font-mono);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--fg-3);
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      padding: var(--s-1) var(--s-3);
      cursor: pointer;
      transition: all var(--dur) var(--ease);
    }
    .year-btn:hover {
      color: var(--fg-2);
      border-color: var(--border-strong);
    }
    .year-btn.active {
      color: var(--fg-1);
      border-color: var(--fg-1);
    }
  `],
})
export class ActivityHeatmapComponent implements OnChanges {
  @Input() data!: ActivityHeatmap;

  chartOptions: EChartsOption = {};
  selectedYear = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      if (!this.selectedYear && this.data.year_range?.length) {
        this.selectedYear = this.data.year_range[this.data.year_range.length - 1];
      }
      this.buildChart();
    }
  }

  selectYear(year: number): void {
    this.selectedYear = year;
    this.buildChart();
  }

  private buildChart(): void {
    if (!this.data?.data?.length) return;

    const yearData = this.data.data.filter(d => d.date.startsWith(String(this.selectedYear)));
    const chartData = yearData.map(d => [d.date, Math.round(d.hours * 100) / 100]);
    const maxHours = Math.max(...yearData.map(d => d.hours), 1);

    this.chartOptions = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          const d = this.data.data.find(item => item.date === params.data[0]);
          if (!d) return '';
          return `<span style="font-family: var(--font-mono); font-size: 11px;">${d.date}</span><br/>` +
            `<span style="color: #888;">${d.video_count} videos</span><br/>` +
            `<span style="color: #FF3621;">${d.hours.toFixed(1)} hours</span>`;
        },
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.06)',
        textStyle: { color: '#f0f0f0', fontSize: 12 },
      },
      visualMap: {
        min: 0,
        max: maxHours,
        inRange: { color: ['#1a1a1a', '#3a1510', '#6b2015', '#FF3621'] },
        show: false,
      },
      calendar: {
        range: String(this.selectedYear),
        cellSize: [13, 13],
        itemStyle: { borderColor: '#0a0a0a', borderWidth: 2 },
        dayLabel: { color: '#555', fontSize: 10, nameMap: 'en' },
        monthLabel: { color: '#888', fontSize: 11 },
        yearLabel: { show: false },
        splitLine: { show: false },
        top: 30,
        left: 40,
        right: 10,
      },
      series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: chartData,
      }],
    };
  }
}
