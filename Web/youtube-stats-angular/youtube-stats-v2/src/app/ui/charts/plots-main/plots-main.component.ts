import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TimeRangeAverageChartComponent } from '../time-range-average-chart/time-range-average-chart.component';
import { FormsModule } from '@angular/forms';
import { PlotsData } from '../../../state/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataStateService } from '../../../state/data-state.service';
import { MaterialModule } from '../../../material.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-plots-main',
  standalone: true,
  imports: [
    TimeRangeAverageChartComponent,
    FormsModule,
    CommonModule,
    MaterialModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './plots-main.component.html',
  styleUrl: './plots-main.component.scss',
})
export class PlotsMainComponent implements OnInit {
  @Input() set plotsData(plotsData: PlotsData | undefined) {
    this.allPlotsData = plotsData;
    this.updateChart();
  }
  plotData$: Observable<PlotsData | undefined> | undefined;
  allPlotsData: PlotsData | undefined;
  selectedPlot = 'weekday';
  chartOptions: any;
  @ViewChild(TimeRangeAverageChartComponent) weeklyAverageChart:
    | TimeRangeAverageChartComponent
    | undefined;

  constructor(private dataStateService: DataStateService) {}

  ngOnInit() {
    this.plotData$ = this.dataStateService.getPlotsData();
    this.plotData$.subscribe((plotsData) => {
      this.allPlotsData = plotsData;
      this.updateChart();
    });
  }

  updateChart() {
    switch (this.selectedPlot) {
      case 'hourOfDay':
        this.getHourOfDayOptions();
        break;
      case 'month':
        this.getMonthOptions();
        break;
      case 'dayOfYear':
        console.log('display dayOfYear chart');
        // this.chartOptions = this.getDayOfYearOptions();
        break;
      case 'weekday':
        this.getWeekdayOptions();
        break;
      default:
        this.getWeekdayOptions();
    }
  }

  // Define these methods to return the specific configuration for each plot
  getHourOfDayOptions() {
    this.chartOptions = this.weeklyAverageChart?.configureCharts(
      this.allPlotsData?.hourlyAvg
    );
  }
  getMonthOptions() {
    /* Return chart options for 'Month' */
    this.chartOptions = this.weeklyAverageChart?.configureCharts(
      this.allPlotsData?.monthlyAvg
    );
  }
  getDayOfYearOptions() {
    /* Return chart options for 'Day of Year' */
  }
  getWeekdayOptions() {
    this.chartOptions = this.weeklyAverageChart?.configureCharts(
      this.allPlotsData?.weeklyAvg
    );
  }
}
