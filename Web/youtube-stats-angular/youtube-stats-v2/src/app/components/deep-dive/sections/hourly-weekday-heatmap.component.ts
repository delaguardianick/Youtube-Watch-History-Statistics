import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { HourlyWeekdayHeatmap } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-hourly-weekday-heatmap',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <span class="label">PATTERNS</span>
      <h3 class="section-title">When you watch</h3>
      <div echarts [options]="chartOptions" style="height: 320px; width: 100%;"></div>
    </section>
  `,
  styles: [`
    .section-title {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-3) 0 var(--s-5);
    }
  `],
})
export class HourlyWeekdayHeatmapComponent implements OnChanges {
  @Input() data!: HourlyWeekdayHeatmap;

  chartOptions: EChartsOption = {};

  private readonly weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  private readonly hours = Array.from({ length: 24 }, (_, i) =>
    i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`
  );

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data?.data?.length) return;

    const chartData = this.data.data.map(cell => [
      cell.hour,
      cell.weekday,
      Math.round(cell.hours * 100) / 100,
    ]);

    const maxHours = Math.max(...this.data.data.map(c => c.hours), 1);

    this.chartOptions = {
      backgroundColor: 'transparent',
      tooltip: {
        formatter: (params: any) => {
          const [hour, weekday, hours] = params.data;
          return `<span style="font-family: var(--font-mono); font-size: 11px;">${this.weekdays[weekday]} ${this.hours[hour]}</span><br/>` +
            `<span style="color: #4ecdc4;">${hours.toFixed(1)} hours</span>`;
        },
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.06)',
        textStyle: { color: '#f0f0f0', fontSize: 12 },
      },
      grid: {
        left: 50,
        right: 16,
        top: 16,
        bottom: 40,
      },
      xAxis: {
        type: 'category',
        data: this.hours,
        axisLabel: { color: '#666', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: this.weekdays,
        axisLabel: { color: '#666', fontSize: 11 },
        axisLine: { show: false },
        axisTick: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxHours,
        inRange: { color: ['#f5f5f5', '#b2e5e0', '#4ecdc4', '#2a9d8f'] },
        show: false,
      },
      series: [{
        type: 'heatmap',
        data: chartData,
        label: { show: false },
        itemStyle: { borderColor: '#fff', borderWidth: 1 },
      }],
    };
  }
}
