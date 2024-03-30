import { Component, OnInit } from '@angular/core';
import { PlotService } from '../../../state/services/plots.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-weekly-average-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './weekly-average-chart.component.html',
  styleUrl: './weekly-average-chart.component.scss',
})
export class WeeklyAverageChartComponent implements OnInit {
  public chartOptions: any;

  constructor(private plotsService: PlotService) {}

  ngOnInit(): void {
    this.plotsService.getAllPlots().subscribe((allPlots) => {
      this.configureCharts(allPlots.weeklyAvg.chartData); // Assuming 'weekly_avg' is your desired chart data
    });
  }

  configureCharts(chartData: any): void {
    this.chartOptions = {
      series: chartData.series,
      chart: {
        height: 350,
        type: 'line',
      },
      title: {
        text: chartData.series.name,
      },
      xaxis: {
        categories: chartData.categories,
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
      // Customize further according to your needs
    };
  }
}
