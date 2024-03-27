import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError, Observable, of } from 'rxjs';
import { Stats } from '../models/models';
import { DataStateService} from '../data-state.service';
import { DataState } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient, private dataStateService: DataStateService) {
    this.state$ = this.dataStateService.getState();

  }

  state$: Observable<DataState>;
  
  // getAllPlots() {
  //   return this.http.get('http://localhost:8000/plots/all');
  // }

  uploadTakeoutAndFetchStats(file: File): Observable<Stats | null> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadTakeout(file).pipe(
      switchMap((response) => {
        console.log('Upload successful, takeout_id:', response.takeout_id);
        return this.analyzeTakeout();
      }),
      catchError((error) => {
        console.error('Upload failed:', error);
        return of(null);
      })
    );
  }

  uploadTakeout(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>('http://localhost:8000/upload', formData);
  }

  analyzeTakeout() {
    // Update state with statistics
    console.log("Analyzing takeout");
    return this.http.get<any>('http://localhost:8000/stats')
    .pipe(
      map((stats) => {
        this.dataStateService.updateStatistics(stats);
        return stats;
      })
    );
  }
}
