import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './components/header/header.component';
import { CarouselContainerComponent } from './components/carousel/carousel-container.component';
import { AnalyticsService } from './services/analytics.service';
import { DashboardStateService } from './state/dashboard-state.service';
import { WrappedResponse } from './models/wrapped.models';
import { DeepDiveResponse } from './models/deep-dive.models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, HeaderComponent, CarouselContainerComponent],
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
