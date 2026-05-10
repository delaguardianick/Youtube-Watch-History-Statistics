import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { CarouselContainerComponent } from './components/carousel/carousel-container.component';
import { CardOverviewComponent } from './components/carousel/cards/card-overview.component';
import { CardPersonalityComponent } from './components/carousel/cards/card-personality.component';
import { CardCreatorsComponent } from './components/carousel/cards/card-creators.component';
import { CardGenresComponent } from './components/carousel/cards/card-genres.component';
import { CardBingesComponent } from './components/carousel/cards/card-binges.component';
import { CardShortsComponent } from './components/carousel/cards/card-shorts.component';
import { CardGraveyardComponent } from './components/carousel/cards/card-graveyard.component';
import { AnalyticsService } from './services/analytics.service';
import { DashboardStateService } from './state/dashboard-state.service';
import { WrappedResponse } from './models/wrapped.models';
import { DeepDiveResponse } from './models/deep-dive.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    HeaderComponent,
    CarouselContainerComponent,
    CardOverviewComponent,
    CardPersonalityComponent,
    CardCreatorsComponent,
    CardGenresComponent,
    CardBingesComponent,
    CardShortsComponent,
    CardGraveyardComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  wrapped$: Observable<WrappedResponse | null>;
  deepDive$: Observable<DeepDiveResponse | null>;
  loading$: Observable<boolean>;

  constructor(
    private analytics: AnalyticsService,
    private state: DashboardStateService,
  ) {
    this.wrapped$ = this.state.getWrapped();
    this.deepDive$ = this.state.getDeepDive();
    this.loading$ = this.state.getLoading();
  }

  ngOnInit(): void {
    this.analytics.loadAll();
  }

  onFileSelected(file: File): void {
    this.analytics.uploadAndReload(file);
  }
}
