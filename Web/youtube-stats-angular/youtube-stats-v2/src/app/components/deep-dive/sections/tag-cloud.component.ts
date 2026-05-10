import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagCloud } from '../../../models/deep-dive.models';

@Component({
  selector: 'app-tag-cloud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section">
      <span class="label">TAGS</span>
      <h3 class="section-title">Content tags</h3>
      <div class="tag-grid">
        @for (tag of data.tags; track tag.tag) {
          <span
            class="tag-chip"
            [class.top-tag]="isTopTag(tag.count)"
            [style.fontSize.px]="getTagSize(tag.count)">
            {{ tag.tag }}
          </span>
        }
      </div>
    </section>
  `,
  styles: [`
    .section-title {
      font: 800 28px/1.2 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-3) 0 var(--s-5);
    }
    .tag-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--s-2);
      align-items: baseline;
    }
    .tag-chip {
      font-family: var(--font-mono);
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--fg-2);
      padding: var(--s-1) var(--s-2);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      white-space: nowrap;
      transition: color var(--dur) var(--ease);
    }
    .tag-chip.top-tag {
      color: var(--fg-1);
      border-color: var(--border-strong);
    }
  `],
})
export class TagCloudComponent implements OnChanges {
  @Input() data!: TagCloud;

  private maxCount = 1;
  private topThreshold = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data?.tags?.length) {
      this.maxCount = Math.max(...this.data.tags.map(t => t.count), 1);
      const sorted = [...this.data.tags].sort((a, b) => b.count - a.count);
      const topN = Math.max(Math.floor(sorted.length * 0.15), 3);
      this.topThreshold = sorted[Math.min(topN - 1, sorted.length - 1)].count;
    }
  }

  getTagSize(count: number): number {
    const minSize = 10;
    const maxSize = 22;
    const ratio = count / this.maxCount;
    return Math.round(minSize + ratio * (maxSize - minSize));
  }

  isTopTag(count: number): boolean {
    return count >= this.topThreshold;
  }
}
