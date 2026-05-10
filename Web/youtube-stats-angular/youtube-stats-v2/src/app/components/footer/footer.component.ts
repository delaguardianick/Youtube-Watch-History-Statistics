import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <span class="label-sm">YOUTUBE STATS</span>
        <span class="label-sm">BUILT WITH ANGULAR + ECHARTS</span>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--border);
      padding: var(--s-7) var(--s-5);
    }
    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
    }
  `],
})
export class FooterComponent {}
