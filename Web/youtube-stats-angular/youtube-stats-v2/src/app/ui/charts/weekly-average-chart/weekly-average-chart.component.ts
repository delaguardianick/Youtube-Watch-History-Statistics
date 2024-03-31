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
          color: '#0396FF', // A color from your gradient
        },
      ],
      // theme: {
      //   mode: 'dark',
      // },
      chart: {
        type: 'area',
        fontFamily: "'Plus Jakarta Sans', sans-serif;",
        foreColor: '#adb0bb',
        toolbar: {
          show: false,
        },
        height: 350,
        zoom: {
          enabled: false,
        },
        dropShadow: {
          enabled: true,
          top: 3,
          left: 2,
          blur: 4,
          opacity: 1,
        },
        background: '#343E59', // Ensure the chart background matches your theme
      },
      grid: {
        show: true,
        padding: {
          bottom: 0,
        },
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      fill: {
        colors: ['#E8F7FF'], // Adjust for gradient effect if desired
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: '#ABDCFF',
              opacity: 1,
            },
            {
              offset: 100,
              color: '#0396FF',
              opacity: 1,
            },
          ],
        },
      },
      // fill: {
      //   colors: ['#E8F7FF'],
      //   type: 'solid',
      // },
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
        x: {
          format: 'dd/MM/yy HH:mm',
        },
        y: {
          formatter: function (val: string) {
            return parseFloat(val).toFixed(1) + ' units'; // Adjust 'units' based on your measurement
          },
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        offsetY: -20,
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
