import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-social-card',
  standalone: true,
  imports: [MaterialModule, TablerIconsModule],
  templateUrl: './social-card.component.html',
})
export class AppSocialCardComponent {}
