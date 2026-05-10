import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Graveyard } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-graveyard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="label">THE GRAVEYARD</span>
    <div class="hero">
      <span class="removed-count">{{ data?.removed_count }}</span>
      <span class="removed-label">videos removed</span>
    </div>
    <span class="removed-pct">{{ data?.removed_pct }}% of what you opened no longer exists</span>

    <div class="channels" *ngIf="data?.top_channels?.length">
      <span class="label">MOST REMOVED BY CHANNEL</span>
      <div class="channel-list">
        @for (ch of data!.top_channels; track ch.channel) {
          <div class="channel-row">
            <span class="channel-name">{{ ch.channel }}</span>
            <span class="channel-count">{{ ch.count }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
    }
    .hero {
      display: flex;
      align-items: baseline;
      gap: var(--s-3);
      margin-top: var(--s-2);
    }
    .removed-count {
      font: 800 56px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: #555;
    }
    .removed-label {
      font: 400 18px/1 var(--font-sans);
      color: var(--fg-3);
    }
    .removed-pct {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-3);
    }
    .channels {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
      margin-top: auto;
      padding-top: var(--s-4);
      border-top: 1px solid var(--border);
    }
    .channel-list {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .channel-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .channel-name {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-2);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
    }
    .channel-count {
      font: 600 13px/1 var(--font-mono);
      color: #555;
      flex-shrink: 0;
      margin-left: var(--s-3);
    }
  `],
})
export class CardGraveyardComponent {
  @Input() data: Graveyard | null = null;
}
