// data-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DataState, PlotsData, Stats } from './models/models';

@Injectable({
  providedIn: 'root',
})
export class DataStateService {
  private initialState: DataState = {
    takeoutId: undefined,
    userStatistics: undefined,
    userPlots: undefined,
  };
  private stateSubject: BehaviorSubject<DataState> =
    new BehaviorSubject<DataState>(this.initialState);

  constructor() {}

  // Method to get the current state as an Observable
  getState(): Observable<DataState> {
    return this.stateSubject.asObservable();
  }

  // Method to update the takeoutId in the state
  updateTakeoutId(takeoutId: string): void {
    const currentState = this.stateSubject.value;
    const updatedState = { ...currentState, takeoutId };
    this.stateSubject.next(updatedState);
  }

  updateStatistics(stats: Stats): void {
    const currentState = this.stateSubject.value;
    const updatedState = { ...currentState, userStatistics: stats };
    this.stateSubject.next(updatedState);
  }

  updatePlots(plots: PlotsData): void {
    const currentState = this.stateSubject.value;
    const updatedState = { ...currentState, userPlots: plots };
    this.stateSubject.next(updatedState);
  }
}
