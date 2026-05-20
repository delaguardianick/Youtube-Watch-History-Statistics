import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopCreators, CreatorEntry } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-creators',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="top">
      <span class="label">Top Creators</span>
    </header>

    <p class="headline" *ngIf="topChannel">
      You kept coming back to <span class="hl">{{ topChannel }}</span>.
    </p>
    <p class="headline" *ngIf="!topChannel">Your top creators, ranked.</p>

    <div class="creators-list">
      @for (creator of data?.top_3 ?? []; track creator.channel; let i = $index) {
        <div class="creator-row">
          <span class="rank">{{ i + 1 }}</span>
          <div class="creator-info">
            <div class="creator-name-row">
              <span class="creator-name">{{ creator.channel }}</span>
              <span class="pct-badge">{{ creator.loyalty_pct | number:'1.1-1' }}% of your videos</span>
            </div>
            <span class="creator-sub">{{ creator.videos }} videos · {{ creator.hours }} hrs of content</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                [style.width.%]="barWidth(creator.videos)"
              ></div>
            </div>
          </div>
        </div>
        @if (i < (data?.top_3?.length ?? 0) - 1) {
          <div class="row-divider"></div>
        }
      }
    </div>

    <div class="divider-full"></div>

    <div class="one-hit-hero">
      <div class="one-hit-num">{{ data?.one_hit_wonder_count ?? 0 | number }}</div>
      <div class="one-hit-label-group">
        <span class="one-hit-title">One-Hit Wonders</span>
        <span class="one-hit-desc">channels you watched exactly once</span>
      </div>
    </div>

    <footer class="foot">
      <span class="label-sm">Wide breadth · deep loyalty</span>
    </footer>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 0;
    }

    .top {
      display: flex;
      align-items: center;
      margin-bottom: var(--s-3);
    }

    .headline {
      font: 700 22px/1.25 var(--font-sans);
      color: var(--fg-1);
      letter-spacing: -0.01em;
      margin: 0 0 var(--s-5) 0;
    }
    .hl { color: var(--accent); }

    /* ── Creator list ──────────────────────────────────────────── */
    .creators-list {
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .row-divider {
      height: 1px;
      background: var(--border);
      margin: var(--s-3) 0;
    }

    .creator-row {
      display: flex;
      align-items: flex-start;
      gap: var(--s-4);
    }

    .rank {
      font: 800 32px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--accent);
      min-width: 32px;
      padding-top: 2px;
    }

    .creator-info {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
      flex: 1;
      min-width: 0;
    }

    .creator-name-row {
      display: flex;
      align-items: baseline;
      gap: var(--s-3);
      flex-wrap: wrap;
    }

    .creator-name {
      font: 600 16px/1.3 var(--font-sans);
      color: var(--fg-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pct-badge {
      font: 600 11px/1.2 var(--font-sans);
      letter-spacing: 0.04em;
      color: var(--accent);
      background: var(--accent-soft);
      padding: 2px 7px;
      border-radius: var(--r-pill);
      white-space: nowrap;
      flex-shrink: 0;
    }

    .creator-sub {
      font: 400 12px/1.4 var(--font-sans);
      color: var(--fg-3);
    }

    .bar-track {
      margin-top: var(--s-2);
      width: 100%;
      height: 4px;
      background: var(--elevated);
      border-radius: var(--r-pill);
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: var(--r-pill);
      transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* ── Divider between sections ─────────────────────────────── */
    .divider-full {
      height: 1px;
      background: var(--border);
      margin: var(--s-5) 0;
    }

    /* ── One-hit wonder hero ──────────────────────────────────── */
    .one-hit-hero {
      display: flex;
      align-items: center;
      gap: var(--s-4);
    }

    .one-hit-num {
      font: 800 56px/0.9 var(--font-sans);
      letter-spacing: -0.03em;
      color: var(--fg-1);
      flex-shrink: 0;
    }

    .one-hit-label-group {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }

    .one-hit-title {
      font: 700 14px/1.2 var(--font-sans);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--fg-2);
    }

    .one-hit-desc {
      font: 400 14px/1.5 var(--font-sans);
      color: var(--fg-3);
    }

    /* ── Footer ───────────────────────────────────────────────── */
    .foot {
      margin-top: auto;
      padding-top: var(--s-4);
      border-top: 1px solid var(--border);
    }
  `],
})
export class CardCreatorsComponent implements OnChanges {
  @Input() data: TopCreators | null = null;

  topChannel = '';
  maxVideos = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.top_3?.length) {
      this.topChannel = this.data.top_3[0]?.channel ?? '';
      this.maxVideos = Math.max(...this.data.top_3.map((c: CreatorEntry) => c.videos), 1);
    } else {
      this.topChannel = '';
      this.maxVideos = 1;
    }
  }

  barWidth(videos: number): number {
    if (!this.maxVideos) return 0;
    return Math.round((videos / this.maxVideos) * 100);
  }
}
