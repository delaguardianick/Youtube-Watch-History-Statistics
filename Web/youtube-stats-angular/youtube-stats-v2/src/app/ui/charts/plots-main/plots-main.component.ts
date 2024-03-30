import { Component } from '@angular/core';
import { WeeklyAverageChartComponent } from '../weekly-average-chart/weekly-average-chart.component';

@Component({
  selector: 'app-plots-main',
  standalone: true,
  imports: [WeeklyAverageChartComponent],
  templateUrl: './plots-main.component.html',
  styleUrl: './plots-main.component.scss',
})
export class PlotsMainComponent {}
