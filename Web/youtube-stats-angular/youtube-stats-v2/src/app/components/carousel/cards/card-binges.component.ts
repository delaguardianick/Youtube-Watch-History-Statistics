import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { Binges, SessionSummary } from '../../../models/wrapped.models';
import { baseChart, CHART, hexA } from '../../../shared/chart-theme';

echarts.use([PieChart, TooltipComponent, CanvasRenderer]);

interface SessionRow {
  humanDuration: string;
  label: string;
  barPct: number;
  rankNum: number;
}

@Component({
  selector: 'app-card-binges',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <header class="top">
      <span class="label">BINGES &amp; MARATHONS</span>
    </header>

    <!-- HERO: longest marathon -->
    <div class="hero" *ngIf="data?.longest_marathon; else noMarathon">
      <p class="headline">
        Your longest marathon:
        <span class="hl">{{ heroDuration }}</span> straight
      </p>
      <div class="hero-meta">
        <span class="meta-pill">{{ data!.longest_marathon!.video_count }} videos</span>
        <span class="meta-sep">·</span>
        <span class="meta-date">{{ heroDate }}</span>
      </div>
    </div>
    <ng-template #noMarathon>
      <p class="headline no-data">No marathon sessions recorded</p>
    </ng-template>

    <!-- TOP 5 SESSIONS: horizontal bar list -->
    <div class="sessions" *ngIf="sessionRows.length">
      <span class="label">TOP SESSIONS</span>
      <div class="bar-list">
        @for (row of sessionRows; track row.rankNum) {
          <div class="bar-row">
            <span class="bar-rank">{{ row.rankNum }}</span>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="row.barPct"></div>
            </div>
            <div class="bar-info">
              <span class="bar-duration">{{ row.humanDuration }}</span>
              <span class="bar-label">{{ row.label }}</span>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- BACK-TO-BACK: donut + big pct -->
    <div class="b2b" *ngIf="data != null">
      <div class="b2b-left">
        <div echarts [options]="donutOptions" class="donut-chart"></div>
      </div>
      <div class="b2b-right">
        <span class="b2b-pct">{{ data!.back_to_back_pct | number:'1.0-0' }}%</span>
        <span class="label-sm">of videos watched back-to-back</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: var(--s-5);
    }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    /* Hero */
    .hero { display: flex; flex-direction: column; gap: var(--s-2); }
    .headline { margin: 0; }
    .hl { color: var(--accent); }
    .no-data { color: var(--fg-3); }

    .hero-meta {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      margin-top: var(--s-1);
    }
    .meta-pill {
      display: inline-flex;
      align-items: center;
      background: var(--accent-soft);
      color: var(--accent);
      border-radius: var(--r-pill);
      padding: 2px 10px;
      font: 700 11px/1.4 var(--font-sans);
      letter-spacing: 0.04em;
    }
    .meta-sep { color: var(--fg-3); font-size: 13px; }
    .meta-date { font: 500 13px/1 var(--font-sans); color: var(--fg-2); }

    /* Sessions bar list */
    .sessions { display: flex; flex-direction: column; gap: var(--s-3); }
    .bar-list { display: flex; flex-direction: column; gap: var(--s-3); }

    .bar-row {
      display: grid;
      grid-template-columns: 18px 1fr auto;
      align-items: center;
      gap: var(--s-2);
    }
    .bar-rank {
      font: 700 11px/1 var(--font-sans);
      color: var(--fg-3);
      text-align: right;
    }
    .bar-track {
      height: 8px;
      background: var(--elevated);
      border-radius: var(--r-pill);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: var(--accent);
      border-radius: var(--r-pill);
      transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .bar-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
      min-width: 90px;
    }
    .bar-duration {
      font: 700 13px/1 var(--font-sans);
      color: var(--fg-1);
    }
    .bar-label {
      font: 400 11px/1 var(--font-sans);
      color: var(--fg-3);
    }

    /* Back-to-back */
    .b2b {
      margin-top: auto;
      display: flex;
      align-items: center;
      gap: var(--s-4);
      padding-top: var(--s-4);
      border-top: 1px solid var(--border);
    }
    .b2b-left { flex-shrink: 0; }
    .donut-chart { width: 64px; height: 64px; }
    .b2b-right {
      display: flex;
      flex-direction: column;
      gap: var(--s-1);
    }
    .b2b-pct {
      font: 800 36px/1 var(--font-sans);
      letter-spacing: -0.03em;
      color: var(--accent);
    }
  `],
})
export class CardBingesComponent implements OnChanges {
  @Input() data: Binges | null = null;

  heroDuration = '';
  heroDate = '';
  sessionRows: SessionRow[] = [];
  donutOptions: EChartsOption = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['data']) return;

    if (this.data?.longest_marathon) {
      this.heroDuration = this.fmtHours(this.data.longest_marathon.duration_hours);
      this.heroDate = this.fmtDate(
        this.data.longest_marathon.date,
        this.data.longest_marathon.weekday
      );
    }

    this.sessionRows = this.buildSessionRows(this.data?.top_5_sessions ?? []);
    this.donutOptions = this.buildDonut(this.data?.back_to_back_pct ?? 0);
  }

  /** Convert decimal hours to "Xh Ym" (e.g. 5.2 → "5h 12m"). */
  private fmtHours(h: number): string {
    const totalMins = Math.round(h * 60);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins}m`;
    return mins ? `${hours}h ${mins}m` : `${hours}h`;
  }

  /** Convert 'YYYY-MM-DD' + weekday string to "Wed, Dec 31". */
  private fmtDate(iso: string, weekday: string): string {
    // Parse manually to avoid UTC/local-timezone shift from new Date(iso)
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (isNaN(d.getTime())) return iso;
    const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
    const shortDay = weekday.length >= 3 ? weekday.slice(0, 3) : weekday;
    return `${shortDay}, ${monthStr} ${day}`;
  }

  private buildSessionRows(sessions: SessionSummary[]): SessionRow[] {
    if (!sessions.length) return [];
    const maxH = sessions[0].duration_hours; // already sorted descending
    return sessions.map((s, i) => ({
      rankNum: i + 1,
      humanDuration: this.fmtHours(s.duration_hours),
      label: `${s.video_count} videos · ${this.fmtDate(s.date, s.weekday)}`,
      barPct: maxH > 0 ? Math.round((s.duration_hours / maxH) * 100) : 0,
    }));
  }

  private buildDonut(pct: number): EChartsOption {
    const filled = Math.min(Math.max(pct, 0), 100);
    const rest = 100 - filled;
    return {
      ...baseChart(),
      series: [
        {
          type: 'pie',
          radius: ['68%', '90%'],
          startAngle: 90,
          itemStyle: { borderWidth: 0 },
          label: { show: false },
          emphasis: { disabled: true },
          data: [
            { value: filled, itemStyle: { color: CHART.accent } },
            { value: rest, itemStyle: { color: CHART.elevated } },
          ],
        },
      ],
    };
  }
}
