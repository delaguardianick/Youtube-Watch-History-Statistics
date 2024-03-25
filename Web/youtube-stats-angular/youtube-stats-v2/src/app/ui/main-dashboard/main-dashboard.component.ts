import { Component } from '@angular/core';
import { DataService } from '../../state/services/data.service';

@Component({
  selector: 'main-dashboard',
  standalone: true,
  styleUrls: ['./main-dashboard.component.scss'],
  templateUrl: './main-dashboard.component.html',
})
export class MainDashboardComponent {
  constructor(private dataService: DataService) {}

  isLoading = false;
  plots = undefined;

  ngOnInit() {
    this.getAllPlotsUrl();
    this.getDataFrameStats();
  }

  async getAllPlotsUrl() {
    this.isLoading = true;
    const data = await this.dataService.getAllPlots().toPromise();
    this.plots = data;
    this.isLoading = false;
  }

  async uploadTakeout(event: any) {
    const file = event.target.files[0];
    const data = await this.dataService.uploadTakeout(file).toPromise();
    this.takeoutId = data.takeout_id;
    console.log(this.takeoutId);
  }

  async getDataFrameStats() {
    this.isLoading = true;
    const data = await this.dataService.getDataFrameStats().toPromise();
    // Your logic here...
    this.isLoading = false;
  }
}
