import { Component } from '@angular/core';

@Component({
  selector: 'app-transition-band',
  standalone: true,
  template: `
    <div class="transition">
      <div class="transition-inner">
        <span class="label">ALL TIME DATA</span>
        <h2 class="transition-heading">Dig deeper</h2>
      </div>
    </div>
  `,
  styles: [`
    .transition {
      border-top: 1px solid var(--border);
      padding: var(--s-9) var(--s-5);
      text-align: center;
    }
    .transition-heading {
      font: 800 44px/1.05 var(--font-sans);
      letter-spacing: -0.02em;
      color: var(--fg-1);
      margin: var(--s-4) 0 0;
    }
  `],
})
export class TransitionBandComponent {}
