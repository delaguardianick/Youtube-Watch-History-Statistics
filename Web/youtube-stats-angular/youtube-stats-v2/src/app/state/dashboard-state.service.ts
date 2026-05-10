import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { WrappedResponse } from '../models/wrapped.models';
import { DeepDiveResponse } from '../models/deep-dive.models';

interface DashboardState {
  wrapped: WrappedResponse | null;
  deepDive: DeepDiveResponse | null;
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  private state$ = new BehaviorSubject<DashboardState>({
    wrapped: null,
    deepDive: null,
    loading: false,
    error: null,
  });

  getWrapped(): Observable<WrappedResponse | null> {
    return this.state$.pipe(map(s => s.wrapped));
  }

  getDeepDive(): Observable<DeepDiveResponse | null> {
    return this.state$.pipe(map(s => s.deepDive));
  }

  getLoading(): Observable<boolean> {
    return this.state$.pipe(map(s => s.loading));
  }

  getError(): Observable<string | null> {
    return this.state$.pipe(map(s => s.error));
  }

  setWrapped(data: WrappedResponse): void {
    const current = this.state$.value;
    this.state$.next({ ...current, wrapped: data });
  }

  setDeepDive(data: DeepDiveResponse): void {
    const current = this.state$.value;
    this.state$.next({ ...current, deepDive: data });
  }

  setLoading(loading: boolean): void {
    const current = this.state$.value;
    this.state$.next({ ...current, loading });
  }

  setError(error: string | null): void {
    const current = this.state$.value;
    this.state$.next({ ...current, error });
  }
}
