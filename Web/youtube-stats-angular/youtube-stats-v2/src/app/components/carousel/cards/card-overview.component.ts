import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WrappedResponse } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="top">
      <span class="label">Your year in review</span>
      <span class="range" *ngIf="rangeLabel">{{ rangeLabel }}</span>
    </header>

    <div class="hero">
      <div class="num">{{ displayHours | number }}</div>
      <div class="unit">hours of content opened</div>
    </div>

    <p class="headline">
      That's <span class="hl">{{ daysOfLife }} days</span> — about
      <span class="hl">{{ perDay }}</span> every single day.
    </p>

    <div class="stats">
      <div class="stat">
        <span class="stat-num">{{ data?.overview?.total_videos | number }}</span>
        <span class="label-sm">Videos</span>
      </div>
      <div class="divider"></div>
      <div class="stat">
        <span class="stat-num">{{ data?.overview?.total_shorts | number }}</span>
        <span class="label-sm">Shorts</span>
      </div>
      <div class="divider"></div>
      <div class="stat">
        <span class="stat-num">{{ daysOfLife }}</span>
        <span class="label-sm">Days</span>
      </div>
    </div>

    <footer class="foot">
      <span class="label-sm">Based on full video length · watch time may vary</span>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .top { display: flex; justify-content: space-between; align-items: baseline; }
    .range { font: 600 12px/1 var(--font-sans); color: var(--fg-2); }

    .hero { margin-top: var(--s-6); }
    .num {
      font: 800 96px/0.9 var(--font-sans);
      letter-spacing: -0.03em;
      color: var(--accent);
    }
    .unit { margin-top: var(--s-3); font: 500 17px/1.3 var(--font-sans); color: var(--fg-2); }

    .headline {
      margin: var(--s-5) 0 0;
      font: 600 19px/1.45 var(--font-sans);
      color: var(--fg-1);
      max-width: 22ch;
    }
    .hl { color: var(--accent); }

    .stats {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding-top: var(--s-5);
    }
    .stat { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .stat-num { font: 700 26px/1 var(--font-sans); color: var(--fg-1); }
    .divider { width: 1px; align-self: stretch; background: var(--border); }

    .foot { margin-top: var(--s-5); padding-top: var(--s-4); border-top: 1px solid var(--border); }
  `],
})
export class CardOverviewComponent implements OnChanges {
  @Input() data: WrappedResponse | null = null;

  displayHours = 0;
  daysOfLife = 0;
  perDay = '';
  rangeLabel = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.overview) {
      const hours = this.data.overview.total_hours;
      this.daysOfLife = Math.round(hours / 24);
      this.perDay = this.formatPerDay(hours / 365);
      this.rangeLabel = this.formatRange(this.data.date_range?.start, this.data.date_range?.end);
      this.animateCount(hours);
    }
  }

  private formatPerDay(hoursPerDay: number): string {
    const mins = Math.round(hoursPerDay * 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  private formatRange(start?: string, end?: string): string {
    if (!start || !end) return '';
    const fmt = (iso: string) => {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };
    return `${fmt(start)} – ${fmt(end)}`;
  }

  private animateCount(target: number, duration: number = 1600): void {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.displayHours = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
