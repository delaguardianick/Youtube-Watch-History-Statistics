from dataclasses import dataclass, field
from typing import Optional


@dataclass
class GlobalStats:
    hours_watched: Optional[float] = None
    videos_watched: Optional[int] = None


@dataclass
class MostViewedMonth:
    top_month_name: Optional[str] = None
    videos_watched: Optional[int] = None
    hours_watched: Optional[float] = None


@dataclass
class FavCreator:
    creator: Optional[str] = None
    videos_watched: Optional[int] = None
    hours_watched: Optional[float] = None


@dataclass
class ShortsWatched:
    videos_watched: Optional[int] = None
    hours_watched: Optional[float] = None


@dataclass
class Stats:
    takeout_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    watch_time_in_hours: Optional[float] = None
    videos_watched: Optional[int] = None
    global_stats: GlobalStats = field(default_factory=GlobalStats)
    most_viewed_month: MostViewedMonth = field(default_factory=MostViewedMonth)
    fav_creator: FavCreator = field(default_factory=FavCreator)
    shorts_watched: ShortsWatched = field(default_factory=ShortsWatched)
