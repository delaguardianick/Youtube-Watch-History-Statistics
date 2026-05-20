import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Graveyard } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-graveyard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="top">
      <span class="label">The graveyard</span>
      <span class="badge-accent" *ngIf="hasData">{{ data!.abandoned_count }} ghosted</span>
    </header>

    <h2 class="headline" *ngIf="hasData">{{ headline }}</h2>

    <div class="list" *ngIf="hasData; else empty">
      <div class="row" *ngFor="let ch of data!.top_channels">
        <div class="info">
          <span class="name">{{ ch.channel }}</span>
          <span class="meta">{{ ch.videos }} videos · last seen {{ sinceLabel(ch.months_since) }}</span>
        </div>
        <div class="bar"><span [style.width.%]="barWidth(ch.videos)"></span></div>
      </div>
    </div>

    <ng-template #empty>
      <div class="empty">
        <span class="empty-num">0</span>
        <p class="empty-msg">Your graveyard is empty — you never really ghost a channel.</p>
      </div>
    </ng-template>

    <footer class="foot" *ngIf="hasData">
      <span class="label-sm">Watched often, then drifted away</span>
    </footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; height: 100%; }
    .top { display: flex; justify-content: space-between; align-items: center; }

    .headline { margin: var(--s-4) 0 var(--s-5); font: 700 22px/1.25 var(--font-sans); color: var(--fg-1); letter-spacing: -0.01em; }
    .headline .hl { color: var(--accent); }

    .list { display: flex; flex-direction: column; gap: var(--s-4); }
    .row { display: flex; flex-direction: column; gap: 8px; }
    .info { display: flex; justify-content: space-between; align-items: baseline; gap: var(--s-3); }
    .name {
      font: 600 16px/1.3 var(--font-sans); color: var(--fg-1);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
    }
    .meta { font: 500 12px/1.3 var(--font-sans); color: var(--fg-3); flex-shrink: 0; }
    .bar { height: 4px; border-radius: var(--r-pill); background: var(--elevated); overflow: hidden; }
    /* decaying fade — full at the left, fading to nothing: the channel's last embers */
    .bar span {
      display: block; height: 100%; border-radius: var(--r-pill);
      background: linear-gradient(90deg, var(--accent), rgba(255,54,33,0.15));
    }

    .empty { margin: auto 0; display: flex; flex-direction: column; gap: var(--s-3); }
    .empty-num { font: 800 72px/1 var(--font-sans); color: var(--fg-3); }
    .empty-msg { margin: 0; font: 500 16px/1.4 var(--font-sans); color: var(--fg-2); max-width: 22ch; }

    .foot { margin-top: auto; padding-top: var(--s-4); border-top: 1px solid var(--border); }
  `],
})
export class CardGraveyardComponent implements OnChanges {
  @Input() data: Graveyard | null = null;

  hasData = false;
  headline = '';
  private maxVideos = 1;

  ngOnChanges(): void {
    const list = this.data?.top_channels ?? [];
    this.hasData = list.length > 0;
    if (this.hasData) {
      this.maxVideos = Math.max(...list.map((c) => c.videos), 1);
      this.headline = `You moved on from ${this.data!.abandoned_count} channels you once binged.`;
    }
  }

  barWidth(videos: number): number {
    return Math.max(12, Math.round((videos / this.maxVideos) * 100));
  }

  sinceLabel(months: number): string {
    if (months <= 1) return 'a month ago';
    if (months < 12) return `${months} months ago`;
    return 'over a year ago';
  }
}
