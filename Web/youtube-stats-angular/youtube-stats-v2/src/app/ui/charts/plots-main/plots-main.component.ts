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
  state$: Observable<DataState> | undefined;
  allPlotsData: PlotsData | undefined;
  selectedPlot = 'weekday'; // Default selection
  chartOptions: any; // This will hold your chart configuration
  allPlotsData$: Observable<PlotsData> | undefined;
  @ViewChild(WeeklyAverageChartComponent) weeklyAverageChart:
    | WeeklyAverageChartComponent
    | undefined;

  constructor(
    private plotsService: PlotService,
    private dataStateService: DataStateService
  ) {}

  ngOnInit() {
    this.allPlotsData$ = this.plotsService.getAllPlots();
    // this.state$ = this.dataStateService.getState().subscribe();
    this.dataStateService.getState().subscribe((state) => {
      this.allPlotsData = state.plotsData;
      // Handle state updates
      // Example: this.userStatistics = state.userStatistics;
    });
    this.updateChart();
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
        this.chartOptions = this.weeklyAverageChart?.configureCharts();
        break;
      default:
        this.chartOptions = this.getWeekdayOptions();
      // this.chartOptions = this.weeklyAverageChart?.chartOptions();
      // Handle default case or error
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
    return this.weeklyAverageChart?.configureCharts();
  }
}
