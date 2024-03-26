import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { catchError, Observable, of } from 'rxjs';

interface Stats {
  start_date: string;
  end_date: string;
  watch_time_in_hours: number;
  videos_watched: number;
  most_viewed_month: string;
  fav_creator_by_videos: string;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  // getAllPlots() {
  //   return this.http.get('http://localhost:8000/plots/all');
  // }

  uploadTakeoutAndFetchStats(file: File): Observable<Stats | null> {
    const formData = new FormData();
    formData.append('file', file);

    return this.uploadTakeout(file).pipe(
      switchMap((response) => {
        // Assuming the server responds with { takeout_id: "someId" }
        console.log('Upload successful, takeout_id:', response.takeout_id);
        // If upload is successful, call getDataFrameStats
        return this.getDataFrameStats();
      }),
      catchError(error => {
        // Handle or log error
        console.error('Upload failed:', error);
        return of(null); // Return a null Observable to signify failure
      })
    );
  }

  uploadTakeout(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>('http://localhost:8000/upload', formData);
  }

  getDataFrameStats() {
    return this.http.get<Stats>('http://localhost:8000/stats');
  }
}
