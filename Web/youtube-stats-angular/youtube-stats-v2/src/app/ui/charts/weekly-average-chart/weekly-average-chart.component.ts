import { Component, Input, OnInit } from '@angular/core';
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
  @Input() plotData: Plot | undefined;
  //input plotData: Plot

  public chartOptions: any;

  constructor(private plotsService: PlotService) {}

  ngOnInit(): void {
    this.plotsService.getAllPlots().subscribe((allPlots) => {
      this.configureCharts(allPlots.weeklyAvg);
    });
  }

  configureCharts(plotData: Plot): void {
    const chartData = plotData.chartData;
    this.chartOptions = {
      series: [
        {
          name: chartData.series[0].name,
          data: chartData.series[0].data.map((value) =>
            parseFloat(value.toFixed(1))
          ),
        },
      ],
      chart: {
        type: 'area',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 350,
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
        align: 'left', // Make sure title alignment is correct
        style: {
          fontSize: '16px', // Adjust the font size as needed
        },
      },
      xaxis: {
        categories: chartData.categories,
        labels: {
          show: true, // Ensure x-axis labels are shown
        },
      },
      yaxis: {
        labels: {
          formatter: function (val: string) {
            return parseFloat(val).toFixed(1); // Format y-axis labels to show only one decimal
          },
        },
      },
      // dataLabels: {
      //   enabled: true,
      // },
      tooltip: {
        theme: 'dark',
        x: {
          format: 'dd/MM/yy HH:mm',
        },
        y: {
          formatter: function (val: string) {
            return parseFloat(val).toFixed(1) + ' units'; // Adjust 'units' based on your measurement
          },
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
