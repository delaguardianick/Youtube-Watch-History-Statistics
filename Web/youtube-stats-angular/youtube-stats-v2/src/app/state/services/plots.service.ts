import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

interface AllPlots {
  weekly_avg: Plot;
  // hourly_avg: string;
  // monthly_avg: string;
  // top_channels: string;
  // top_genres: string;
  // top_videos: string; // Uncomment if you decide to include it later
}

interface Plot {
  title: string;
  data: Array<number>;
  categories: Array<string>;
}

@Injectable({
  providedIn: 'root',
})
export class PlotService {
  private plotsUrl = 'http://localhost:8000/plots/all'; // Adjust the URL as necessary

  constructor(private http: HttpClient) {}

  getAllPlots(): Observable<AllPlots> {
    return this.http.get<AllPlots>(this.plotsUrl).pipe(
      map((getAllPlotsResponse) => {
        return getAllPlotsResponse;
      })
    );
  }

  // getAllPlots(): Observable<AllPlots> {
  //   result = this.http.get<AllPlots>(this.plotsUrl).pipe(
  //     map((getAllPlotsResponse) => {

  //       const weeklyAvgPlot = {
  //         title: 'Weekly Average',
  //         data: getAllPlotsResponse.weekly_avg.data,
  //         categories: getAllPlotsResponse.weekly_avg.categories,
  //       };

  //       return response;
  //     })
  //   );
  // }
}
