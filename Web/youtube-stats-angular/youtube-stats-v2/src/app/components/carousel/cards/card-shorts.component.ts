import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ShortsData } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-shorts',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <span class="label">SHORTS LIFE</span>
    <div class="stats-row">
      <div class="stat">
        <span class="stat-number">{{ data?.total_count | number }}</span>
        <span class="stat-label">shorts</span>
      </div>
      <div class="stat">
        <span class="stat-number">{{ data?.total_hours }}</span>
        <span class="stat-label">hours of content</span>
      </div>
    </div>

    <div class="binge" *ngIf="data?.longest_binge">
      <span class="label">LONGEST SHORTS BINGE</span>
      <span class="binge-text">{{ data!.longest_binge!.count }} shorts in {{ data!.longest_binge!.duration_minutes }} minutes</span>
    </div>

    <div class="split" *ngIf="data?.vs_longform">
      <span class="label">FORMAT SPLIT</span>
      <div class="split-bar">
        <div class="split-shorts" [style.width.%]="data!.vs_longform.shorts_pct_videos">
          <span *ngIf="data!.vs_longform.shorts_pct_videos > 15">{{ data!.vs_longform.shorts_pct_videos }}% shorts</span>
        </div>
        <div class="split-long" [style.width.%]="100 - data!.vs_longform.shorts_pct_videos">
          <span *ngIf="(100 - data!.vs_longform.shorts_pct_videos) > 15">{{ 100 - data!.vs_longform.shorts_pct_videos }}% long-form</span>
        </div>
      </div>
    </div>

    <div echarts [options]="chartOptions" style="height: 200px;"></div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .stats-row {
      display: flex;
      gap: var(--s-7);
      margin-top: var(--s-2);
    }
    .stat {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .stat-number {
      font: 800 32px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: #f472b6;
    }
    .stat-label {
      font: 400 13px/1.4 var(--font-sans);
      color: var(--fg-3);
    }
    .binge {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }
    .binge-text {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
    .split {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .split-bar {
      display: flex;
      height: 28px;
      border-radius: var(--r-sm);
      overflow: hidden;
    }
    .split-shorts {
      background: #f472b6;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width var(--dur) var(--ease);
    }
    .split-shorts span {
      font: 600 11px/1 var(--font-mono);
      letter-spacing: 0.04em;
      color: #0a0a0a;
      white-space: nowrap;
    }
    .split-long {
      background: #333;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: width var(--dur) var(--ease);
    }
    .split-long span {
      font: 600 11px/1 var(--font-mono);
      letter-spacing: 0.04em;
      color: var(--fg-2);
      white-space: nowrap;
    }
  `],
})
export class CardShortsComponent implements OnChanges {
  @Input() data: ShortsData | null = null;

  chartOptions: EChartsOption = {};

  private readonly hourLabels = [
    '12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM',
    '12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data?.hourly_comparison) return;

    this.chartOptions = {
      backgroundColor: 'transparent',
      textStyle: { color: '#888', fontFamily: 'Inter' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.06)',
        textStyle: { color: '#f0f0f0', fontSize: 12 },
      },
      legend: {
        data: ['Shorts', 'Long-form'],
        textStyle: { color: '#888', fontSize: 11 },
        top: 0,
        right: 0,
      },
      grid: {
        left: 36,
        right: 16,
        top: 28,
        bottom: 28,
      },
      xAxis: {
        type: 'category',
        data: this.hourLabels,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#555', fontSize: 9, interval: 3 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#222' } },
        axisLabel: { color: '#555', fontSize: 10 },
      },
      series: [
        {
          name: 'Shorts',
          type: 'line',
          data: this.data.hourly_comparison.shorts,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#f472b6', width: 2 },
          itemStyle: { color: '#f472b6' },
        },
        {
          name: 'Long-form',
          type: 'line',
          data: this.data.hourly_comparison.longform,
          smooth: true,
          showSymbol: false,
          lineStyle: { color: '#555', width: 2 },
          itemStyle: { color: '#555' },
        },
      ],
    };
  }
}
