import { Component } from '@angular/core';
import { DataService } from '../../state/services/data.service';
import { PlotService } from '../../state/services/plots.service';

@Component({
  selector: 'main-dashboard',
  standalone: true,
  styleUrls: ['./main-dashboard.component.scss'],
  templateUrl: './main-dashboard.component.html',
  providers: [PlotService, DataService],
})
export class MainDashboardComponent {
  constructor(private dataService: DataService) {}

  isLoading = false;
  plots: Object | undefined;
  takeoutId: number | undefined;
  data: { takeout_id: number } | undefined;

  ngOnInit() {
    // this.getAllPlotsUrl();
    // this.getDataFrameStats();
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
      this.dataService.uploadTakeout(file).subscribe({
        next: (takeoutId) => {
          this.takeoutId = takeoutId;
          console.log(this.takeoutId);
        },
        error: (error) => console.error('Upload failed:', error),
      });
    }
  }

  // async getDataFrameStats() {
  //   this.isLoading = true;
  //   const data = await this.dataService.getDataFrameStats().toPromise();
  //   // Your logic here...
  //   this.isLoading = false;
  // }
}
