import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { WrappedResponse } from '../models/wrapped.models';
import { DeepDiveResponse } from '../models/deep-dive.models';
import { DashboardStateService } from '../state/dashboard-state.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private baseUrl = 'http://localhost:8000';

  constructor(
    private http: HttpClient,
    private state: DashboardStateService,
  ) {}

  loadAll(): void {
    this.state.setLoading(true);
    this.state.setError(null);

    forkJoin({
      wrapped: this.http.get<WrappedResponse>(`${this.baseUrl}/analytics/wrapped`),
      deepDive: this.http.get<DeepDiveResponse>(`${this.baseUrl}/analytics/deep-dive`),
    }).subscribe({
      next: ({ wrapped, deepDive }) => {
        this.state.setWrapped(wrapped);
        this.state.setDeepDive(deepDive);
        this.state.setLoading(false);
      },
      error: (err) => {
        console.error('Failed to load analytics:', err);
        this.state.setError('Failed to load analytics data');
        this.state.setLoading(false);
      },
    });
  }

  uploadAndReload(file: File): void {
    this.state.setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    this.http.post(`${this.baseUrl}/upload`, formData).subscribe({
      next: () => this.loadAll(),
      error: (err) => {
        console.error('Upload failed:', err);
        this.state.setError('Upload failed');
        this.state.setLoading(false);
      },
    });
  }
}
