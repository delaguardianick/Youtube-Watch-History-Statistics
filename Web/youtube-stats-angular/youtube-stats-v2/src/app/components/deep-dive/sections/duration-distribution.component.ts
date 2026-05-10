import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { DurationDistribution } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-duration-distribution',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <section class="section">
      <span class="label">DURATION</span>
      <h3 class="section-title">Video length distribution</h3>
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
  `],
})
export class DurationDistributionComponent implements OnChanges {
  @Input() data!: DurationDistribution;

  chartOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data?.buckets?.length) return;

    const labels = this.data.buckets.map(b => b.label);
    const counts = this.data.buckets.map(b => b.count);

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
          return `<span style="font-family: var(--font-mono); font-size: 11px;">${p.name}</span><br/>` +
            `<span style="color: #a78bfa;">${p.value.toLocaleString()} videos</span>`;
        },
      },
      grid: {
        left: 60,
        right: 16,
        top: 16,
        bottom: 40,
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLine: { lineStyle: { color: 'rgba(0,0,0,0.08)' } },
        axisLabel: { color: '#666', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.06)' } },
        axisLabel: { color: '#666', fontSize: 10 },
      },
      series: [{
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#a78bfa',
          borderRadius: [3, 3, 0, 0],
        },
        barMaxWidth: 40,
      }],
    };
  }
}
