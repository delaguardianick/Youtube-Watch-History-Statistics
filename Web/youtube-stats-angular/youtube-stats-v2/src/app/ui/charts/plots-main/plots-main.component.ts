import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TimeRangeAverageChartComponent } from '../time-range-average-chart/time-range-average-chart.component';
import { FormsModule } from '@angular/forms';
import { PlotsData, Stats } from '../../../state/models/models';
import { Observable } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
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
  providers: [DatePipe],
})
export class PlotsMainComponent implements OnInit {
  @Input() set plotsData(plotsData: PlotsData | undefined) {
    this.allPlotsData = plotsData;
    this.updateChart();
  }
  plotData$: Observable<PlotsData | undefined> | undefined;
  userStatistics$: Observable<Stats | undefined> | undefined;
  allPlotsData: PlotsData | undefined;
  userStatistics: Stats | undefined;
  selectedPlot = 'weekday';
  chartOptions: any;
  @ViewChild(TimeRangeAverageChartComponent) timeRangeAverageChartComponent:
    | TimeRangeAverageChartComponent
    | undefined;

  constructor(
    private dataStateService: DataStateService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.plotData$ = this.dataStateService.getPlotsData();
    this.plotData$.subscribe((plotsData) => {
      this.allPlotsData = plotsData;
      this.updateChart();
    });
    this.userStatistics$ = this.dataStateService.getUserStatistics();
    this.userStatistics$.subscribe((userStatistics) => {
      this.userStatistics = userStatistics;
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
        this.chartOptions = this.getDayOfYearOptions();
        break;
      case 'weekday':
        this.getWeekdayOptions();
        break;
      case 'topChannels':
        this.getTopChannelsOptions();
        break;
      case 'topGenres':
        this.getTopGenresOptions();
        break;
      default:
        this.getWeekdayOptions();
    }
  }

  getHourOfDayOptions() {
    this.chartOptions = this.timeRangeAverageChartComponent?.configureCharts(
      this.allPlotsData?.hourlyAvg
    );
  }
  getMonthOptions() {
    this.chartOptions = this.timeRangeAverageChartComponent?.configureCharts(
      this.allPlotsData?.monthlyAvg
    );
  }
  getDayOfYearOptions() {
    this.chartOptions = this.timeRangeAverageChartComponent?.configureCharts(
      this.allPlotsData?.dailyAvg
    );
  }
  getWeekdayOptions() {
    this.chartOptions = this.timeRangeAverageChartComponent?.configureCharts(
      this.allPlotsData?.weeklyAvg
    );
  }
  getTopChannelsOptions() {
    this.chartOptions = this.timeRangeAverageChartComponent?.configureCharts(
      this.allPlotsData?.topChannels
    );
  }
  getTopGenresOptions() {
    this.chartOptions = this.timeRangeAverageChartComponent?.configureCharts(
      this.allPlotsData?.topGenres
    );
  }

  getFormattedDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'MMMM d, y, HH:mm') || '';
  }
}
