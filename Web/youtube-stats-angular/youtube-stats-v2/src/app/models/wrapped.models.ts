export interface DateRange {
  start: string;
  end: string;
}

export interface Overview {
  total_hours: number;
  total_videos: number;
  total_shorts: number;
  shorts_hours: number;
}

export interface WatchPersonality {
  type: 'night_owl' | 'early_bird' | 'nine_to_five';
  hourly_distribution: number[];
  peak_hour: number;
  weekday_distribution: number[];
  peak_weekday: string;
}

export interface CreatorEntry {
  channel: string;
  videos: number;
  hours: number;
  loyalty_pct: number;
}

export interface TopCreators {
  top_3: CreatorEntry[];
  one_hit_wonder_count: number;
}

export interface GenreMonth {
  month: string;
  genres: Record<string, number>;
}

export interface GenreShift {
  month: string;
  from_genre: string;
  to_genre: string;
}

export interface GenreJourney {
  monthly_stacks: GenreMonth[];
  top_genre: { name: string; pct: number };
  biggest_shift: GenreShift | null;
}

export interface SessionSummary {
  duration_hours: number;
  video_count: number;
  date: string;
  weekday: string;
}

export interface Binges {
  longest_marathon: SessionSummary | null;
  top_5_sessions: SessionSummary[];
  back_to_back_pct: number;
}

export interface ShortsBinge {
  count: number;
  duration_minutes: number;
}

export interface ShortsData {
  total_count: number;
  total_hours: number;
  longest_binge: ShortsBinge | null;
  vs_longform: { shorts_pct_videos: number; shorts_pct_hours: number };
  hourly_comparison: { shorts: number[]; longform: number[] };
}

export interface GraveyardChannel {
  channel: string;
  count: number;
}

export interface Graveyard {
  removed_count: number;
  removed_pct: number;
  top_channels: GraveyardChannel[];
  monthly_timeline: { month: string; count: number }[];
}

export interface WrappedResponse {
  date_range: DateRange;
  overview: Overview;
  watch_personality: WatchPersonality;
  top_creators: TopCreators;
  genre_journey: GenreJourney;
  binges: Binges;
  shorts: ShortsData;
  graveyard: Graveyard;
}
