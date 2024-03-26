import { Component } from '@angular/core';
import { DataService } from '../../state/services/data.service';
import { PlotService } from '../../state/services/plots.service';
import { DataStateService } from '../../state/data-state.service';
import { DataState, Stats } from '../../state/models/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'main-dashboard',
  standalone: true,
  styleUrls: ['./main-dashboard.component.scss'],
  templateUrl: './main-dashboard.component.html',
  providers: [PlotService, DataService],
})
export class MainDashboardComponent {
  state$: Observable<DataState>;

  constructor(private dataService: DataService, private dataStateService: DataStateService) {
    this.state$ = this.dataStateService.getState();
  }

  isLoading = false;
  plots: Object | undefined;
  takeoutId: number | undefined;
  data: Stats | undefined;

  ngOnInit() {
    // this.getAllPlotsUrl();
    this.state$.subscribe((state) => {
      if (state.userStatistics) {
        this.data = state.userStatistics;
      }
    });
  }

  // async getAllPlotsUrl() {
  //   this.isLoading = true;
  //   const data = await this.dataService.getAllPlots().toPromise();
  //   this.plots = data;
  //   this.isLoading = false;
  // }

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
    // Method to get user statistics from state
    this.dataService.analyzeTakeout();
    this.state$.subscribe((state) => {
      if (state.userStatistics) {
        this.data = state.userStatistics;
      }
    });
  }
}
