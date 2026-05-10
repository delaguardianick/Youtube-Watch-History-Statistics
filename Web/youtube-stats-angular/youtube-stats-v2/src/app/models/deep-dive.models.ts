export interface HeatmapDay {
  date: string;
  video_count: number;
  hours: number;
}

export interface ActivityHeatmap {
  data: HeatmapDay[];
  year_range: number[];
}

export interface HeatmapCell {
  weekday: number;
  hour: number;
  hours: number;
}

export interface HourlyWeekdayHeatmap {
  data: HeatmapCell[];
}

export interface MonthlyTrend {
  month: string;
  hours: number;
  video_count: number;
}

export interface WatchTrends {
  monthly: MonthlyTrend[];
}

export interface DurationBucket {
  label: string;
  count: number;
}

export interface DurationDistribution {
  buckets: DurationBucket[];
}

export interface TagEntry {
  tag: string;
  count: number;
  top_channels: string[];
}

export interface TagCloud {
  tags: TagEntry[];
}

export interface ChannelDiversity {
  total_channels: number;
  channels_for_50_pct: number;
  watched_once: number;
  watched_10_plus: number;
  concentration_curve: number[];
}

export interface DeepDiveResponse {
  activity_heatmap: ActivityHeatmap;
  hourly_weekday_heatmap: HourlyWeekdayHeatmap;
  watch_trends: WatchTrends;
  duration_distribution: DurationDistribution;
  tag_cloud: TagCloud;
  channel_diversity: ChannelDiversity;
}
