import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PlotFactory, PlotsData } from '../models/models';
import { DataStateService } from '../data-state.service';

@Injectable({
  providedIn: 'root',
})
export class PlotService {
  private plotsUrl = 'http://localhost:8000/plots/all'; // Adjust the URL as necessary

  constructor(
    private http: HttpClient,
    private dataStateService: DataStateService
  ) {}

  getAllPlots(): Observable<PlotsData> {
    return this.http.get<PlotsData>(this.plotsUrl).pipe(
      map((getAllPlotsResponse) => {
        const allPlots = PlotFactory.fromApiResponse(getAllPlotsResponse);
        this.dataStateService.updatePlots(allPlots);
        return allPlots;
      })
    );
  }
}
