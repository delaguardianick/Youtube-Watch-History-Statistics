import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Binges } from '../../../models/wrapped.models';

@Component({
  selector: 'app-card-binges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="label">BINGES AND MARATHONS</span>

    <div class="marathon" *ngIf="data?.longest_marathon">
      <span class="label">LONGEST MARATHON</span>
      <div class="marathon-hero">
        <span class="marathon-hours">{{ data!.longest_marathon!.duration_hours }}</span>
        <span class="marathon-unit">hours</span>
      </div>
      <div class="marathon-meta">
        <span class="meta-item">{{ data!.longest_marathon!.video_count }} videos</span>
        <span class="meta-sep">·</span>
        <span class="meta-item">{{ data!.longest_marathon!.weekday }}</span>
        <span class="meta-sep">·</span>
        <span class="meta-item">{{ data!.longest_marathon!.date }}</span>
      </div>
    </div>

    <div class="sessions" *ngIf="data?.top_5_sessions?.length">
      <span class="label">TOP SESSIONS</span>
      <div class="session-list">
        @for (session of data!.top_5_sessions; track session.date; let i = $index) {
          <div class="session-row">
            <span class="session-rank">{{ i + 1 }}</span>
            <span class="session-duration">{{ session.duration_hours }}h</span>
            <span class="session-videos">{{ session.video_count }} videos</span>
            <span class="session-date">{{ session.date }}</span>
          </div>
        }
      </div>
    </div>

    <div class="b2b">
      <span class="label">BACK-TO-BACK</span>
      <span class="b2b-value">{{ data?.back_to_back_pct }}% of videos watched consecutively</span>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      gap: var(--s-5);
    }
    .marathon {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
      margin-top: var(--s-2);
    }
    .marathon-hero {
      display: flex;
      align-items: baseline;
      gap: var(--s-2);
    }
    .marathon-hours {
      font: 800 48px/1 var(--font-sans);
      letter-spacing: -0.02em;
      color: #FF3621;
    }
    .marathon-unit {
      font: 400 18px/1 var(--font-sans);
      color: var(--fg-3);
    }
    .marathon-meta {
      display: flex;
      align-items: center;
      gap: var(--s-2);
    }
    .meta-item {
      font: 400 13px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
    .meta-sep {
      color: var(--fg-3);
    }
    .sessions {
      display: flex;
      flex-direction: column;
      gap: var(--s-3);
    }
    .session-list {
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .session-row {
      display: flex;
      align-items: center;
      gap: var(--s-3);
    }
    .session-rank {
      font: 600 12px/1 var(--font-mono);
      color: var(--fg-3);
      min-width: 18px;
    }
    .session-duration {
      font: 700 14px/1 var(--font-sans);
      color: #FF3621;
      min-width: 44px;
    }
    .session-videos {
      font: 400 13px/1 var(--font-sans);
      color: var(--fg-2);
      min-width: 80px;
    }
    .session-date {
      font: 400 12px/1 var(--font-mono);
      color: var(--fg-3);
    }
    .b2b {
      margin-top: auto;
      padding-top: var(--s-4);
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: var(--s-2);
    }
    .b2b-value {
      font: 400 14px/1.4 var(--font-sans);
      color: var(--fg-2);
    }
  `],
})
export class CardBingesComponent {
  @Input() data: Binges | null = null;
}
