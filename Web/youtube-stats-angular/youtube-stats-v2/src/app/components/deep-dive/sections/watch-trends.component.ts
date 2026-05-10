import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WatchTrends } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-watch-trends',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <span class="label">TRENDS</span>
      <h3 class="section-title">Monthly watch trends</h3>
      <div class="stats-row">
        <div class="stat">
          <span class="label">PEAK MONTH</span>
          <span class="stat-value">{{ peakMonth }}</span>
          <span class="stat-sub">{{ peakHours | number:'1.0-0' }} hours</span>
        </div>
        <div class="stat">
          <span class="label">AVERAGE</span>
          <span class="stat-value">{{ avgHours | number:'1.0-0' }} hrs/mo</span>
        </div>
      </div>
      <div echarts [options]="chartOptions" style="height: 300px; width: 100%;"></div>
    </section>
  `,
  styles: [`
    .section-title {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-3) 0 var(--s-5);
    }
    .stats-row {
      display: flex;
      gap: var(--s-7);
      margin-bottom: var(--s-5);
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }
    .stat-value {
      font: 600 18px/1.3 var(--font-sans);
      color: var(--fg-1);
    }
    .stat-sub {
      font: 400 13px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
  `],
})
export class WatchTrendsComponent implements OnChanges {
  @Input() data!: WatchTrends;

  chartOptions: EChartsOption = {};
  peakMonth = '';
  peakHours = 0;
  avgHours = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.computeStats();
      this.buildChart();
    }
  }

  private computeStats(): void {
    if (!this.data?.monthly?.length) return;
    const peak = this.data.monthly.reduce((a, b) => a.hours > b.hours ? a : b);
    this.peakMonth = peak.month;
    this.peakHours = peak.hours;
    this.avgHours = this.data.monthly.reduce((s, m) => s + m.hours, 0) / this.data.monthly.length;
  }

  private buildChart(): void {
    if (!this.data?.monthly?.length) return;

    const months = this.data.monthly.map(m => m.month);
    const hours = this.data.monthly.map(m => Math.round(m.hours * 10) / 10);

    this.chartOptions = {
      backgroundColor: 'transparent',
      textStyle: { color: '#888', fontFamily: 'Inter' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.06)',
        textStyle: { color: '#f0f0f0', fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0];
          const trend = this.data.monthly[p.dataIndex];
          return `<span style="font-family: var(--font-mono); font-size: 11px;">${trend.month}</span><br/>` +
            `<span style="color: #FF3621;">${trend.hours.toFixed(1)} hours</span><br/>` +
            `<span style="color: #888;">${trend.video_count} videos</span>`;
        },
      },
      grid: {
        left: 50,
        right: 16,
        top: 16,
        bottom: 40,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: {
          color: '#555',
          fontSize: 10,
          rotate: months.length > 18 ? 45 : 0,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#222' } },
        axisLabel: { color: '#555', fontSize: 10 },
      },
      series: [{
        type: 'line',
        data: hours,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#FF3621', width: 2 },
        itemStyle: { color: '#FF3621' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 54, 33, 0.15)' },
              { offset: 1, color: 'rgba(255, 54, 33, 0)' },
            ],
          } as any,
        },
      }],
    };
  }
}
