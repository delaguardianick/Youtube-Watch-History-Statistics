// stats.model.ts
export interface Stats {
    takeout_id: number;
    start_date: string;
    end_date: string;
    watch_time_in_hours: number;
    videos_watched: number;
    most_viewed_month: string;
    fav_creator_by_videos: string;
  }
  
  // plots.model.ts
  export interface PlotData {
    weekly_avg: string; // URL or JSON data for ApexCharts
    hourly_avg: string;
    monthly_avg: string;
    top_channels: string;
    top_genres: string;
    // top_videos: string; // Uncomment or add as needed
  }

 export interface DataState {
    takeoutId: string | undefined;
    userStatistics: Stats | undefined;
    userPlots: PlotData | undefined;
  }