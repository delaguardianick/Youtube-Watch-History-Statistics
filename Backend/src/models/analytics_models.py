from pydantic import BaseModel
from typing import Optional


class DateRange(BaseModel):
    start: str
    end: str


class Overview(BaseModel):
    total_hours: float
    total_videos: int
    total_shorts: int
    shorts_hours: float


class WatchPersonality(BaseModel):
    type: str  # "night_owl", "early_bird", "nine_to_five"
    hourly_distribution: list[float]  # 24 values
    peak_hour: int
    weekday_distribution: list[float]  # 7 values
    peak_weekday: str


class CreatorEntry(BaseModel):
    channel: str
    videos: int
    hours: float
    loyalty_pct: float


class TopCreators(BaseModel):
    top_3: list[CreatorEntry]
    one_hit_wonder_count: int


class GenreMonth(BaseModel):
    month: str
    genres: dict[str, float]  # genre_name -> hours


class GenreShift(BaseModel):
    month: str
    from_genre: str
    to_genre: str


class GenreJourney(BaseModel):
    monthly_stacks: list[GenreMonth]
    top_genre: dict  # {"name": str, "pct": float}
    biggest_shift: Optional[GenreShift] = None


class SessionSummary(BaseModel):
    duration_hours: float
    video_count: int
    date: str
    weekday: str


class Binges(BaseModel):
    longest_marathon: Optional[SessionSummary] = None
    top_5_sessions: list[SessionSummary]
    back_to_back_pct: float


class ShortsBinge(BaseModel):
    count: int
    duration_minutes: float


class ShortsData(BaseModel):
    total_count: int
    total_hours: float
    longest_binge: Optional[ShortsBinge] = None
    vs_longform: dict  # {"shorts_pct_videos": float, "shorts_pct_hours": float}
    hourly_comparison: dict  # {"shorts": list[float], "longform": list[float]}


class GraveyardChannel(BaseModel):
    channel: str
    count: int


class Graveyard(BaseModel):
    removed_count: int
    removed_pct: float
    top_channels: list[GraveyardChannel]
    monthly_timeline: list[dict]  # [{"month": str, "count": int}]


class WrappedResponse(BaseModel):
    date_range: DateRange
    overview: Overview
    watch_personality: WatchPersonality
    top_creators: TopCreators
    genre_journey: GenreJourney
    binges: Binges
    shorts: ShortsData
    graveyard: Graveyard


# Deep-dive models

class HeatmapDay(BaseModel):
    date: str
    video_count: int
    hours: float


class ActivityHeatmap(BaseModel):
    data: list[HeatmapDay]
    year_range: list[int]


class HeatmapCell(BaseModel):
    weekday: int
    hour: int
    hours: float


class HourlyWeekdayHeatmap(BaseModel):
    data: list[HeatmapCell]


class MonthlyTrend(BaseModel):
    month: str
    hours: float
    video_count: int
    is_partial: bool = False  # True for the in-progress current month


class WatchTrends(BaseModel):
    monthly: list[MonthlyTrend]


class DurationBucket(BaseModel):
    label: str
    count: int


class DurationDistribution(BaseModel):
    buckets: list[DurationBucket]


class TagEntry(BaseModel):
    tag: str
    count: int
    top_channels: list[str]


class TagCloud(BaseModel):
    tags: list[TagEntry]


class ChannelDiversity(BaseModel):
    total_channels: int
    channels_for_50_pct: int
    watched_once: int
    watched_10_plus: int
    concentration_curve: list[float]


class DeepDiveResponse(BaseModel):
    activity_heatmap: ActivityHeatmap
    hourly_weekday_heatmap: HourlyWeekdayHeatmap
    watch_trends: WatchTrends
    duration_distribution: DurationDistribution
    tag_cloud: TagCloud
    channel_diversity: ChannelDiversity
