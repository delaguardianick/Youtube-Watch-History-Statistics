import { Component, OnInit } from '@angular/core';
import { DataService } from '../../state/services/data.service';
import { PlotService } from '../../state/services/plots.service';
import { DataStateService } from '../../state/data-state.service';
import { DataState, PlotsData, Stats } from '../../state/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WeeklyAverageChartComponent } from '../charts/weekly-average-chart/weekly-average-chart.component';
import { PlotsMainComponent } from '../charts/plots-main/plots-main.component';

@Component({
  selector: 'main-dashboard',
  standalone: true,
  imports: [CommonModule, WeeklyAverageChartComponent, PlotsMainComponent],
  styleUrls: ['./main-dashboard.component.scss'],
  templateUrl: './main-dashboard.component.html',
  providers: [PlotService, DataService],
})
export class MainDashboardComponent implements OnInit {
  state$: Observable<DataState>;

  constructor(
    private dataService: DataService,
    private dataStateService: DataStateService
  ) {
    this.state$ = this.dataStateService.getState();
  }

  isLoading = false;
  plots: Object | undefined;
  takeoutId: string | undefined;
  userStatistics: Stats | undefined;
  plotsData: PlotsData | undefined;

  ngOnInit() {
    this.state$.subscribe((state) => {
      if (state.userStatistics) {
        this.userStatistics = state.userStatistics;
        this.plotsData = state?.plotsData;
      }
    });
  }

  public async uploadTakeout(event: any) {
    console.log('uploading');
    const file = event.target.files[0];
    if (file) {
      this.dataService.uploadTakeoutAndFetchStats(file).subscribe({
        next: (stats) => {
          this.takeoutId = stats?.takeout_id;
          console.log(this.takeoutId);
        },
        error: (error) => console.error('Upload failed:', error),
      });
    }
  }

  public getDataFrameStats() {
    this.dataService.analyzeTakeout().subscribe({
      next: (stats) => {
        console.log('Statistics fetched successfully:', stats);
      },
      error: (error) => console.error('Failed to fetch statistics:', error),
    });
  }

  public displayStats() {
    console.log(this.userStatistics);
  }
}
