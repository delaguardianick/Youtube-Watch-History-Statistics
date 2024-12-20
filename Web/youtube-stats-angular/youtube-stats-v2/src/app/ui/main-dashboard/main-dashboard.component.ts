import { Component, OnInit } from '@angular/core';
import { DataService } from '../../state/services/data.service';
import { PlotService } from '../../state/services/plots.service';
import { Stats } from '../../state/models/models';
import { CommonModule } from '@angular/common';
import { PlotsMainComponent } from '../charts/plots-main/plots-main.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MaterialModule } from '../../material.module';
import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'main-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PlotsMainComponent,
    FormsModule,
    MatButtonModule,
    MaterialModule,
    MatCardModule,
  ],
  styleUrls: ['./main-dashboard.component.scss'],
  templateUrl: './main-dashboard.component.html',
  providers: [PlotService, DataService],
})
export class MainDashboardComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private plotsService: PlotService
  ) {}

  takeoutId: string | undefined;
  userStatistics: Stats | undefined;

  ngOnInit() {
    this.plotsService.getAllPlots();
    this.dataService.getStats();
  }

  topcard = {
    id: 1,
    color: 'primary',
    img: '/YTStats.png',
    title: 'Employees',
    subtitle: '96',
  };

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
