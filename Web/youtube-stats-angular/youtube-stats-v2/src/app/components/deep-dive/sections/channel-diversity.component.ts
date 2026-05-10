import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { ChannelDiversity } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-channel-diversity',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <span class="label">DIVERSITY</span>
      <h3 class="section-title">Channel diversity</h3>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number accent">{{ data.channels_for_50_pct }}</span>
          <span class="stat-desc">channels make up 50% of your watch time</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ data.total_channels | number }}</span>
          <span class="stat-desc">unique channels</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ data.watched_once | number }}</span>
          <span class="stat-desc">channels watched once</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ data.watched_10_plus | number }}</span>
          <span class="stat-desc">channels watched 10+ times</span>
        </div>
      </div>
      <div class="chart-label">
        <span class="label">CONCENTRATION CURVE</span>
      </div>
      <div echarts [options]="chartOptions" style="height: 280px; width: 100%;"></div>
    </section>
  `,
  styles: [`
    .section-title {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-3) 0 var(--s-5);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: var(--s-4);
      margin-bottom: var(--s-6);
    }
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      padding: var(--s-4);
      border: 1px solid var(--border);
      border-radius: var(--r-md);
    }
    .stat-number {
      font: 800 28px/1.1 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
    }
    .stat-number.accent {
      color: #34d399;
    }
    .stat-desc {
      font: 400 13px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
    .chart-label {
      margin-bottom: var(--s-3);
    }
  `],
})
export class ChannelDiversityComponent implements OnChanges {
  @Input() data!: ChannelDiversity;

  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data?.concentration_curve?.length) return;

    const curve = this.data.concentration_curve;
    const xData = curve.map((_, i) => Math.round((i / (curve.length - 1)) * 100));
    const yData = curve.map(v => Math.round(v * 1000) / 10);

    this.chartOptions = {
      backgroundColor: 'transparent',
      textStyle: { color: '#666', fontFamily: 'Inter' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.06)',
        textStyle: { color: '#f0f0f0', fontSize: 12 },
        formatter: (params: any) => {
          const p = params[0];
          return `<span style="font-family: var(--font-mono); font-size: 11px;">Top ${p.name}% of channels</span><br/>` +
            `<span style="color: #34d399;">${p.value}% of watch time</span>`;
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
        data: xData.map(String),
        name: '% of channels',
        nameLocation: 'center',
        nameGap: 25,
        nameTextStyle: { color: '#666', fontSize: 11 },
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
        axisLabel: {
          color: '#666',
          fontSize: 10,
          interval: Math.floor(curve.length / 5),
        },
      },
      yAxis: {
        type: 'value',
        name: '% of watch time',
        nameLocation: 'center',
        nameGap: 35,
        nameTextStyle: { color: '#666', fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisLabel: { color: '#666', fontSize: 10 },
      },
      series: [{
        type: 'line',
        data: yData,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#34d399', width: 2 },
        itemStyle: { color: '#34d399' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(52, 211, 153, 0.15)' },
              { offset: 1, color: 'rgba(52, 211, 153, 0)' },
            ],
          } as any,
        },
      }],
    };
  }
}
