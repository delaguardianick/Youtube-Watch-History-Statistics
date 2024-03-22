import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainDashboardComponent } from "./ui/main/main-dashboard/main-dashboard.component";
// import { StoreModule } from '@ngrx/store';
// import * as fromUserData from './reducers/user-data.reducer';
// import { EffectsModule } from '@ngrx/effects';
// import { UserDataEffects } from './effects/user-data.effects';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [RouterOutlet, MainDashboardComponent]
})
export class AppComponent {
  title = 'youtube-stats';
}
