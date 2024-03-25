import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'i-tabler',
  standalone: true,
  template: `<div [innerHTML]="svgIcon"></div>`,
  styles: [],
})
export class TablerIconComponent implements OnInit {
  @Input() name: string = '';
  svgIcon: SafeHtml = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    import(`@tabler/icons/icons/${this.name}.svg`)
      .then((icon) => {
        this.svgIcon = this.sanitizer.bypassSecurityTrustHtml(icon.default);
      })
      .catch((err) => console.error(`Icon not found: ${this.name}`));
  }
}
