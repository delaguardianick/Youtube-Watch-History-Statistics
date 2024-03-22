import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import * as fromUserData from './reducers/user-data.reducer';
import { EffectsModule } from '@ngrx/effects';
import { UserDataEffects } from './effects/user-data.effects';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'youtube-stats';
}
