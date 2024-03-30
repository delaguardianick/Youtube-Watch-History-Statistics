import { Component, OnInit } from '@angular/core';
import { PlotService } from '../../../state/services/plots.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { Plot } from '../../../state/models/models';

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
      this.configureCharts(allPlots.weeklyAvg); // Assuming 'weekly_avg' is your desired chart data
    });
  }

  configureCharts(plotData: Plot): void {
    const chartData = plotData.chartData;
    this.chartOptions = {
      series: [
        {
          name: chartData.series[0].name,
          data: chartData.series[0].data,
          color: '#5D87FF',
        },
      ],
      chart: {
        type: 'area',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 60,
        sparkline: {
          enabled: true,
        },
        group: 'sparklines',
      },
      sparkline: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        colors: ['#E8F7FF'],
        type: 'solid',
      },
      markers: {
        size: 0,
      },
      title: {
        text: plotData.title,
      },
      xaxis: {
        categories: chartData.categories,
      },
      // dataLabels: {
      //   enabled: false,
      // },
      tooltip: {
        theme: 'dark',
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }

  // configureCharts(plotData: Plot): void {
  // const chartData = plotData.chartData;
  // this.chartOptions = {
  //   series: { ...chartData.series, color: '#5D87FF' },
  //   chart: {
  //     type: 'area',
  //     fontFamily: "'Plus Jakarta Sans', sans-serif;",
  //     foreColor: '#adb0bb',
  //     toolbar: {
  //       show: false,
  //     },
  //     // height: 60,
  //     sparkline: {
  //       enabled: true,
  //     },
  //     group: 'sparklines',
  //     height: 350,
  //     // type: 'line',
  //   },
  //   stroke: {
  //     curve: 'smooth',
  //     width: 2,
  //   },
  //   title: {
  //     text: plotData.title,
  //   },
  //   fill: {
  //     colors: ['#E8F7FF'],
  //     type: 'solid',
  //   },
  //   markers: {
  //     size: 0,
  //   },
  //   xaxis: {
  //     categories: chartData.categories,
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   tooltip: {
  //     theme: 'dark',
  //     x: {
  //       format: 'dd/MM/yy HH:mm',
  //       show: false,
  //     },
  //   },
  // };
}
