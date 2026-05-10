import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WrappedResponse } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="label">OVERVIEW</span>
    <div class="hero">
      <div class="hours-row">
        <span class="pulse-dot"></span>
        <span class="hours-number">{{ displayHours | number }}</span>
      </div>
      <span class="hours-label">hours of content</span>
      <span class="days-sub">{{ daysOfLife }} days of your life this year</span>
    </div>
    <div class="meta">
      <div class="meta-item">
        <span class="label">TOTAL VIDEOS</span>
        <span class="meta-value">{{ data?.overview?.total_videos | number }}</span>
      </div>
      <div class="meta-item">
        <span class="label">DATE RANGE</span>
        <span class="meta-value">{{ data?.date_range?.start }} to {{ data?.date_range?.end }}</span>
      </div>
    </div>
    <div class="disclaimer">
      <span class="label-sm">BASED ON FULL VIDEO LENGTH · ACTUAL WATCH TIME MAY VARY</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .hero {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      margin-top: var(--s-4);
    }
    .hours-row {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }
    .pulse-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #FF3621;
      animation: pulse 2s ease-in-out infinite;
      flex-shrink: 0;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .hours-number {
      font: 800 72px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
    }
    .hours-label {
      font: 400 16px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
    .days-sub {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-3);
    }
    .meta {
      display: flex;
      gap: var(--s-7);
      margin-top: var(--s-4);
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }
    .meta-value {
      font: 600 16px/1.4 var(--font-sans);
      color: var(--fg-1);
    }
    .disclaimer {
      margin-top: auto;
      padding-top: var(--s-4);
    }
  `],
})
export class CardOverviewComponent implements OnChanges {
  @Input() data: WrappedResponse | null = null;

  displayHours = 0;
  daysOfLife = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.overview) {
      this.daysOfLife = Math.round((this.data.overview.total_hours / 24) * 10) / 10;
      this.animateCount(this.data.overview.total_hours);
    }
  }

  private animateCount(target: number, duration: number = 2000): void {
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
