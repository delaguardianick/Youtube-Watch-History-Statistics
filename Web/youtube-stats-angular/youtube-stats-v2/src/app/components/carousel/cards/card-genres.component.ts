import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { GenreJourney } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-genres',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('echarts') })],
  template: `
    <span class="label">GENRE JOURNEY</span>
    <div class="top-genre" *ngIf="data?.top_genre">
      <span class="genre-name">{{ data!.top_genre.name }}</span>
      <span class="genre-pct">{{ data!.top_genre.pct }}% of your content</span>
    </div>
    <div echarts [options]="chartOptions" style="height: 250px;"></div>
    <div class="shift" *ngIf="data?.biggest_shift">
      <span class="label">BIGGEST SHIFT</span>
      <span class="shift-text">
        {{ data!.biggest_shift!.from_genre }} to {{ data!.biggest_shift!.to_genre }}
        in {{ data!.biggest_shift!.month }}
      </span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .top-genre {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: var(--s-2);
    }
    .genre-name {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: #a78bfa;
    }
    .genre-pct {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
    .shift {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      margin-top: auto;
      padding-top: var(--s-4);
      border-top: 1px solid var(--border);
    }
    .shift-text {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
  `],
})
export class CardGenresComponent implements OnChanges {
  @Input() data: GenreJourney | null = null;

  chartOptions: EChartsOption = {};

  private readonly genreColors = [
    '#a78bfa', '#4ecdc4', '#ffe66d', '#f472b6', '#FF3621',
    '#34d399', '#888888', '#555555',
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data) {
      this.buildChart();
    }
  }

  private buildChart(): void {
    if (!this.data || !this.data.monthly_stacks?.length) return;

    const months = this.data.monthly_stacks.map(m => m.month);
    const allGenres = new Set<string>();
    this.data.monthly_stacks.forEach(m => {
      Object.keys(m.genres).forEach(g => allGenres.add(g));
    });

    const genreList = Array.from(allGenres);
    const series: EChartsOption['series'] = genreList.map((genre, i) => ({
      name: genre,
      type: 'line' as const,
      stack: 'total',
      areaStyle: { opacity: 0.6 },
      emphasis: { focus: 'series' as const },
      showSymbol: false,
      lineStyle: { width: 1 },
      itemStyle: { color: this.genreColors[i % this.genreColors.length] },
      data: this.data!.monthly_stacks.map(m => m.genres[genre] || 0),
    }));

    this.chartOptions = {
      backgroundColor: 'transparent',
      textStyle: { color: '#888', fontFamily: 'Inter' },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.06)',
        textStyle: { color: '#f0f0f0', fontSize: 12 },
      },
      grid: {
        left: 40,
        right: 16,
        top: 16,
        bottom: 32,
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#333' } },
        axisLabel: { color: '#555', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#222' } },
        axisLabel: { color: '#555', fontSize: 10 },
      },
      series,
    };
  }
}
