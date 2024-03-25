import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Plots {
  weekly_avg: string;
  hourly_avg: string;
  monthly_avg: string;
  top_channels: string;
  top_genres: string;
  // top_videos: string; // Uncomment if you decide to include it later
}

@Injectable({
  providedIn: 'root',
})
export class PlotService {
  private plotsUrl = 'http://localhost:8000/plots/all'; // Adjust the URL as necessary

  constructor(private http: HttpClient) {}

  getAllPlots(): Observable<Plots> {
    return this.http.get<Plots>(this.plotsUrl);
  }
}
