import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopCreators } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-creators',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="label">TOP CREATORS</span>
    <div class="creators-list">
      @for (creator of data?.top_3; track creator.channel; let i = $index) {
        <div class="creator-row">
          <span class="rank">{{ i + 1 }}</span>
          <div class="creator-info">
            <span class="creator-name">{{ creator.channel }}</span>
            <span class="creator-stats">{{ creator.videos }} videos · {{ creator.hours }} hours of content</span>
          </div>
          <span class="loyalty">{{ creator.loyalty_pct }}%</span>
        </div>
      }
    </div>
    <div class="one-hit">
      <span class="label">ONE-HIT WONDERS</span>
      <span class="one-hit-count">{{ data?.one_hit_wonder_count }} channels visited exactly once</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .creators-list {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .creator-row {
      display: flex;
      align-items: center;
      gap: var(--s-4);
    }
    .rank {
      font: 800 32px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: #ffe66d;
      min-width: 36px;
    }
    .creator-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }
    .creator-name {
      font: 600 16px/1.3 var(--font-sans);
      color: var(--fg-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .creator-stats {
      font: 400 13px/1.4 var(--font-sans);
      color: var(--fg-3);
    }
    .loyalty {
      font: 600 14px/1 var(--font-mono);
      color: var(--fg-2);
      letter-spacing: 0.04em;
    }
    .one-hit {
      margin-top: auto;
      padding-top: var(--s-4);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .one-hit-count {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
  `],
})
export class CardCreatorsComponent {
  @Input() data: TopCreators | null = null;
}
