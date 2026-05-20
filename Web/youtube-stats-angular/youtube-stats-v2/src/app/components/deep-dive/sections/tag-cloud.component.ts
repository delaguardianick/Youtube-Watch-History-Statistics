import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagCloud, TagEntry } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-tag-cloud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section">
      <header class="top">
        <span class="label">Topics</span>
      </header>

      <h3 class="headline">Your most-watched topics.</h3>

      @if (!topTags.length) {
        <p class="empty">No tag data available.</p>
      } @else {
        <ol class="tag-list">
          @for (tag of topTags; track tag.tag; let i = $index) {
            <li class="tag-row">
              <div class="tag-meta">
                <span class="tag-name">{{ tag.tag }}</span>
                @if (tag.top_channels[0]) {
                  <span class="tag-channel">via {{ tag.top_channels[0] }}</span>
                }
              </div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="barWidth(tag.count)"></div>
              </div>
              <span class="tag-count">{{ tag.count }}</span>
            </li>
          }
        </ol>
      }
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .section {
      padding: var(--s-7) var(--s-6);
      background: var(--surface);
      width: 100%;
    }

    .top {
      margin-bottom: var(--s-3);
    }

    .headline {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: 0 0 var(--s-6) 0;
    }

    /* ── Ranked bar list ─────────────────────────────────────── */
    .tag-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }

    .tag-row {
      display: grid;
      grid-template-columns: 220px 1fr 48px;
      align-items: center;
      gap: var(--s-4);
    }

    .tag-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .tag-name {
      font: 600 14px/1.3 var(--font-sans);
      color: var(--fg-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-transform: capitalize;
    }

    .tag-channel {
      font: 400 11px/1.3 var(--font-sans);
      color: var(--fg-3);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .bar-track {
      width: 100%;
      height: 6px;
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

    .tag-count {
      font: 600 13px/1 var(--font-sans);
      color: var(--fg-2);
      text-align: right;
      white-space: nowrap;
    }

    /* ── Empty state ─────────────────────────────────────────── */
    .empty {
      font: 400 14px/1.5 var(--font-sans);
      color: var(--fg-3);
    }

    /* ── Responsive: collapse label column on small screens ──── */
    @media (max-width: 600px) {
      .tag-row {
        grid-template-columns: 140px 1fr 40px;
        gap: var(--s-3);
      }
    }
  `],
})
export class TagCloudComponent implements OnChanges {
  @Input() data!: TagCloud;

  topTags: TagEntry[] = [];
  private maxCount = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.tags?.length) {
      this.topTags = this.data.tags.slice(0, 12);
      this.maxCount = this.topTags[0]?.count ?? 1;
    } else {
      this.topTags = [];
      this.maxCount = 1;
    }
  }

  barWidth(count: number): number {
    if (!this.maxCount) return 0;
    return Math.round((count / this.maxCount) * 100);
  }
}
