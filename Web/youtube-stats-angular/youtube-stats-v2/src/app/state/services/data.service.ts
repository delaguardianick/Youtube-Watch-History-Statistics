import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  getAllPlots() {
    return this.http.get('http://localhost:8000/plots/all');
  }

  uploadTakeout(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post('http://localhost:8000/upload', formData);
  }

  getDataFrameStats() {
    return this.http.get<Stats>('http://localhost:8000/stats');
  }
}
