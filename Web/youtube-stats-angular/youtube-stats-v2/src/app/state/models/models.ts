// plots.model.ts
export interface PlotsData {
  dailyAvg: Plot;
  weeklyAvg: Plot;
  hourlyAvg: Plot;
  monthlyAvg: Plot;
  topChannels: Plot;
  topGenres: Plot;
}

export interface DataState {
  takeoutId: string | undefined;
  userStatistics: Stats | undefined;
  plotsData: PlotsData | undefined;
}

// stats.model.ts
export interface Stats {
  takeout_id: string | undefined;
  start_date: string | undefined;
  end_date: string | undefined;
  watch_time_in_hours: number | undefined;
  videos_watched: number | undefined;
  most_viewed_month: string | undefined;
  fav_creator_by_videos: string | undefined;
}

export class StatsFactory {
  static fromApiResponse(data: any): Stats {
    const stats: Stats = {
      takeout_id: data.takeout_id || undefined,
      start_date: data.start_date || undefined,
      end_date: data.end_date || undefined,
      watch_time_in_hours: data.watch_time_in_hours || undefined,
      videos_watched: data.videos_watched || undefined,
      most_viewed_month: data.most_viewed_month || undefined,
      fav_creator_by_videos: data.fav_creator_by_videos || undefined,
    };
    return stats;
  }
}

export interface Plot {
  plot_id: string | undefined;
  title: string;
  chartData: {
    categories: string[];
    series: {
      name: string;
      data: number[];
    }[];
  };
}

export class PlotFactory {
  static fromApiResponse(data: any): PlotsData {
    // Initialize an empty object that will be populated with Plot data
    const allPlots: Partial<PlotsData> = {};

    // Define a mapping of keys in 'data' to the corresponding keys in 'PlotsData'
    const keyMap: { [key: string]: keyof PlotsData } = {
      daily_avg: 'dailyAvg',
      weekly_avg: 'weeklyAvg',
      hourly_avg: 'hourlyAvg',
      monthly_avg: 'monthlyAvg',
      top_channels: 'topChannels',
      top_genres: 'topGenres',
    };

    // Iterate over the keyMap to dynamically populate allPlots
    Object.entries(keyMap).forEach(([apiResponseKey, plotsDataKey]) => {
      const plotData = data[apiResponseKey];
      if (plotData) {
        allPlots[plotsDataKey] = {
          plot_id: plotData.plot_id || undefined,
          title: plotData.title || '',
          chartData: {
            categories: plotData.chart_data?.categories || [],
            series: plotData.chart_data?.series || [],
          },
        };
      }
    });

    return allPlots as PlotsData;
  }
}
