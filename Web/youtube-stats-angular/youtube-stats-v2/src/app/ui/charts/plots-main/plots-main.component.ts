import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { WeeklyAverageChartComponent } from '../weekly-average-chart/weekly-average-chart.component';
import { FormsModule } from '@angular/forms';
import { PlotService } from '../../../state/services/plots.service';
import { DataState, PlotsData } from '../../../state/models/models';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DataStateService } from '../../../state/data-state.service';

@Component({
  selector: 'app-plots-main',
  standalone: true,
  imports: [WeeklyAverageChartComponent, FormsModule, CommonModule],
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
  @ViewChild(WeeklyAverageChartComponent) weeklyAverageChart:
    | WeeklyAverageChartComponent
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
        // this.chartOptions = this.getHourOfDayOptions();
        console.log('display hour of Day chart');
        break;
      case 'month':
        console.log('display month chart');
        // this.chartOptions = this.getMonthOptions();
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
    /* Return chart options for 'Hour of Day' */
  }
  getMonthOptions() {
    /* Return chart options for 'Month' */
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
