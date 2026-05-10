import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { WatchPersonality } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-personality',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <span class="label">WATCH PERSONALITY</span>
    <div class="badge">{{ badgeText }}</div>
    <div echarts [options]="chartOptions" style="height: 280px;"></div>
    <div class="callouts">
      <div class="callout">
        <span class="label">PEAK HOUR</span>
        <span class="callout-value">{{ formatHour(data?.peak_hour) }}</span>
      </div>
      <div class="callout">
        <span class="label">PEAK DAY</span>
        <span class="callout-value">{{ data?.peak_weekday }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .badge {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: #4ecdc4;
      margin-top: var(--s-2);
    }
    .callouts {
      display: flex;
      gap: var(--s-7);
    }
    .callout {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }
    .callout-value {
      font: 600 16px/1.4 var(--font-sans);
      color: var(--fg-1);
    }
  `],
})
export class CardPersonalityComponent implements OnChanges {
  @Input() data: WatchPersonality | null = null;

  badgeText = '';
  chartOptions: EChartsOption = {};

  private readonly hourLabels = [
    '12AM','1AM','2AM','3AM','4AM','5AM','6AM','7AM','8AM','9AM','10AM','11AM',
    '12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM','11PM',
  ];

  private readonly personalityMap: Record<string, string> = {
    'night_owl': 'Night owl',
    'early_bird': 'Early bird',
    'nine_to_five': '9-to-5 watcher',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.badgeText = this.personalityMap[this.data.type] || this.data.type;
      this.buildChart();
    }
  }

  formatHour(hour: number | undefined): string {
    if (hour === undefined || hour === null) return '';
    return this.hourLabels[hour] || `${hour}:00`;
  }

  private buildChart(): void {
    if (!this.data) return;
    this.chartOptions = {
      backgroundColor: 'transparent',
      textStyle: { color: '#888', fontFamily: 'Inter' },
      angleAxis: {
        type: 'category',
        data: this.hourLabels,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#555', fontSize: 10 },
      },
      radiusAxis: { show: false },
      polar: {},
      series: [{
        type: 'bar',
        coordinateSystem: 'polar',
        data: this.data.hourly_distribution,
        itemStyle: { color: '#4ecdc4' },
      }],
    };
  }
}
