"""Wrapped analytics service: computes all 7 wrapped card datasets from a DataFrame."""

import pandas as pd
import numpy as np
from analytics.session_detector import detect_sessions
from models.analytics_models import (
    Overview, WatchPersonality, TopCreators, CreatorEntry,
    GenreJourney, GenreMonth, GenreShift, Binges, SessionSummary,
    ShortsData, ShortsBinge, Graveyard, GraveyardChannel,
)

GENRE_MAP: dict[int, str] = {
    2: "Autos & Vehicles",
    1: "Film & Animation",
    10: "Music",
    15: "Pets & Animals",
    17: "Sports",
    18: "Short Movies",
    19: "Travel & Events",
    20: "Gaming",
    21: "Videoblogging",
    22: "People & Blogs",
    23: "Comedy",
    24: "Entertainment",
    25: "News & Politics",
    26: "Howto & Style",
    27: "Education",
    28: "Science & Technology",
    29: "Nonprofits & Activism",
    30: "Movies",
    31: "Anime/Animation",
    32: "Action/Adventure",
    33: "Classics",
    34: "Comedy (Film)",
    35: "Documentary",
    36: "Drama",
    37: "Family",
    38: "Foreign",
    39: "Horror",
    40: "Sci-Fi/Fantasy",
    41: "Thriller",
    42: "Shorts",
    43: "Shows",
    44: "Trailers",
}

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


class WrappedService:
    """Computes all wrapped analytics card datasets from a watch-history DataFrame."""

    def __init__(self, df: pd.DataFrame) -> None:
        df = df.copy()

        # Ensure watch_date is datetime
        if not pd.api.types.is_datetime64_any_dtype(df["watch_date"]):
            df["watch_date"] = pd.to_datetime(df["watch_date"])

        # Ensure video_length_secs is int
        df["video_length_secs"] = df["video_length_secs"].fillna(0).astype(int)

        self._df = df
        self._shorts_df = df[df["video_length_secs"] <= 60].copy()
        self._longform_df = df[df["video_length_secs"] > 60].copy()

    # -------------------------------------------------------------------------
    # 1. Overview
    # -------------------------------------------------------------------------

    def compute_overview(self) -> Overview:
        total_hours = round(self._longform_df["video_length_secs"].sum() / 3600, 2)
        total_videos = len(self._longform_df)
        total_shorts = len(self._shorts_df)
        shorts_hours = round(self._shorts_df["video_length_secs"].sum() / 3600, 2)

        return Overview(
            total_hours=total_hours,
            total_videos=total_videos,
            total_shorts=total_shorts,
            shorts_hours=shorts_hours,
        )

    # -------------------------------------------------------------------------
    # 2. Watch Personality
    # -------------------------------------------------------------------------

    def compute_watch_personality(self) -> WatchPersonality:
        df = self._df

        hours = df["watch_date"].dt.hour
        hour_counts = hours.value_counts().reindex(range(24), fill_value=0)
        hourly_distribution = [float(hour_counts[h]) for h in range(24)]
        peak_hour = int(hour_counts.idxmax())

        weekdays = df["watch_date"].dt.dayofweek  # 0=Monday
        weekday_counts = weekdays.value_counts().reindex(range(7), fill_value=0)
        weekday_distribution = [float(weekday_counts[d]) for d in range(7)]
        peak_weekday_idx = int(weekday_counts.idxmax())
        peak_weekday = WEEKDAY_NAMES[peak_weekday_idx]

        if peak_hour >= 21 or peak_hour <= 3:
            personality_type = "night_owl"
        elif peak_hour <= 8:
            personality_type = "early_bird"
        else:
            personality_type = "nine_to_five"

        return WatchPersonality(
            type=personality_type,
            hourly_distribution=hourly_distribution,
            peak_hour=peak_hour,
            weekday_distribution=weekday_distribution,
            peak_weekday=peak_weekday,
        )

    # -------------------------------------------------------------------------
    # 3. Top Creators
    # -------------------------------------------------------------------------

    def compute_top_creators(self) -> TopCreators:
        df = self._df
        total_videos = len(df)

        # Exclude videos with no resolved channel (deleted/private videos) so they
        # don't aggregate into a phantom "creator".
        named = df[df["channel_name"].fillna("").str.strip() != ""]

        channel_stats = (
            named.groupby("channel_name")
            .agg(
                videos=("video_id", "count"),
                channel_secs=("video_length_secs", "sum"),
            )
            .reset_index()
        )

        channel_stats = channel_stats.sort_values("videos", ascending=False)
        top3_rows = channel_stats.head(3)

        top_3: list[CreatorEntry] = []
        for _, row in top3_rows.iterrows():
            # "loyalty" = share of all videos you watched that came from this channel,
            # so the metric tracks the (video-count) ranking shown next to it.
            loyalty_pct = round(int(row["videos"]) / total_videos * 100, 2) if total_videos > 0 else 0.0
            hours = round(row["channel_secs"] / 3600, 2)
            top_3.append(CreatorEntry(
                channel=row["channel_name"],
                videos=int(row["videos"]),
                hours=hours,
                loyalty_pct=loyalty_pct,
            ))

        one_hit_wonder_count = int((channel_stats["videos"] == 1).sum())

        return TopCreators(
            top_3=top_3,
            one_hit_wonder_count=one_hit_wonder_count,
        )

    # -------------------------------------------------------------------------
    # 4. Genre Journey
    # -------------------------------------------------------------------------

    def compute_genre_journey(self) -> GenreJourney:
        df = self._longform_df.copy()
        df["genre"] = df["category_id"].map(GENRE_MAP).fillna("Unknown")
        df["month"] = df["watch_date"].dt.to_period("M").astype(str)

        # Monthly stacks: hours per genre per month
        monthly_genre = (
            df.groupby(["month", "genre"])["video_length_secs"]
            .sum()
            .reset_index()
        )
        monthly_genre["hours"] = monthly_genre["video_length_secs"] / 3600

        months_sorted = sorted(monthly_genre["month"].unique())
        monthly_stacks: list[GenreMonth] = []
        for month in months_sorted:
            month_data = monthly_genre[monthly_genre["month"] == month]
            genres_dict = {row["genre"]: round(row["hours"], 3) for _, row in month_data.iterrows()}
            monthly_stacks.append(GenreMonth(month=month, genres=genres_dict))

        # Top genre overall
        genre_totals = monthly_genre.groupby("genre")["hours"].sum()
        total_hours = genre_totals.sum()
        top_genre_name = genre_totals.idxmax() if len(genre_totals) > 0 else "Unknown"
        top_genre_pct = round(genre_totals[top_genre_name] / total_hours * 100, 2) if total_hours > 0 else 0.0

        # Biggest shift: find the month where the top genre changed from the previous month
        biggest_shift: GenreShift | None = None
        prev_top = None
        for gm in monthly_stacks:
            if not gm.genres:
                continue
            current_top = max(gm.genres, key=lambda g: gm.genres[g])
            if prev_top is not None and current_top != prev_top:
                biggest_shift = GenreShift(
                    month=gm.month,
                    from_genre=prev_top,
                    to_genre=current_top,
                )
                # Keep first detected shift; break to find biggest by magnitude if preferred
                # For now we detect the first shift
            prev_top = current_top

        return GenreJourney(
            monthly_stacks=monthly_stacks,
            top_genre={"name": top_genre_name, "pct": top_genre_pct},
            biggest_shift=biggest_shift,
        )

    # -------------------------------------------------------------------------
    # 5. Binges (long-form sessions)
    # -------------------------------------------------------------------------

    def compute_binges(self) -> Binges:
        df = self._longform_df.sort_values("watch_date")

        videos = df[["watch_date", "video_length_secs", "title", "channel_name"]].to_dict("records")

        sessions = detect_sessions(videos, max_gap_secs=120, min_videos=3)

        # A "marathon" is the longest by elapsed time, so rank by duration (the
        # detector returns sessions ordered by video_count, which is not the same).
        sessions = sorted(sessions, key=lambda s: s.duration_hours, reverse=True)

        top_5_sessions: list[SessionSummary] = [
            SessionSummary(
                duration_hours=s.duration_hours,
                video_count=s.video_count,
                date=s.date,
                weekday=s.weekday,
            )
            for s in sessions[:5]
        ]

        longest_marathon = top_5_sessions[0] if top_5_sessions else None

        # Back-to-back %: consecutive pairs within 120s / total pairs
        back_to_back_pct = 0.0
        if len(videos) >= 2:
            consecutive_count = 0
            for i in range(1, len(videos)):
                prev = videos[i - 1]
                curr = videos[i]
                prev_end = prev["watch_date"].timestamp() + prev["video_length_secs"]
                curr_start = curr["watch_date"].timestamp()
                gap = curr_start - prev_end
                if gap <= 120:
                    consecutive_count += 1
            total_pairs = len(videos) - 1
            back_to_back_pct = round(consecutive_count / total_pairs * 100, 2)

        return Binges(
            longest_marathon=longest_marathon,
            top_5_sessions=top_5_sessions,
            back_to_back_pct=back_to_back_pct,
        )

    # -------------------------------------------------------------------------
    # 6. Shorts
    # -------------------------------------------------------------------------

    def compute_shorts(self) -> ShortsData:
        shorts_df = self._shorts_df.sort_values("watch_date")
        longform_df = self._longform_df

        total_count = len(shorts_df)
        total_hours = round(shorts_df["video_length_secs"].sum() / 3600, 1)

        # Binge detection
        shorts_videos = shorts_df[["watch_date", "video_length_secs", "title", "channel_name"]].to_dict("records")
        short_sessions = detect_sessions(shorts_videos, max_gap_secs=90, min_videos=2)

        longest_binge: ShortsBinge | None = None
        if short_sessions:
            best = short_sessions[0]
            longest_binge = ShortsBinge(
                count=best.video_count,
                duration_minutes=round(best.duration_secs / 60, 1),
            )

        # vs longform
        total_all = len(self._df)
        total_all_secs = self._df["video_length_secs"].sum()
        shorts_pct_videos = round(total_count / total_all * 100, 2) if total_all > 0 else 0.0
        shorts_pct_hours = round(
            shorts_df["video_length_secs"].sum() / total_all_secs * 100, 2
        ) if total_all_secs > 0 else 0.0

        # Hourly comparison
        shorts_hours_dist = (
            shorts_df["watch_date"].dt.hour.value_counts()
            .reindex(range(24), fill_value=0)
        )
        longform_hours_dist = (
            longform_df["watch_date"].dt.hour.value_counts()
            .reindex(range(24), fill_value=0)
        )

        return ShortsData(
            total_count=total_count,
            total_hours=total_hours,
            longest_binge=longest_binge,
            vs_longform={
                "shorts_pct_videos": shorts_pct_videos,
                "shorts_pct_hours": shorts_pct_hours,
            },
            hourly_comparison={
                "shorts": [float(shorts_hours_dist[h]) for h in range(24)],
                "longform": [float(longform_hours_dist[h]) for h in range(24)],
            },
        )

    # -------------------------------------------------------------------------
    # 7. Graveyard (removed videos)
    # -------------------------------------------------------------------------

    def compute_graveyard(self) -> Graveyard:
        df = self._df
        removed_df = df[df["video_status"] != "Available"]

        removed_count = len(removed_df)
        removed_pct = round(removed_count / len(df) * 100, 2) if len(df) > 0 else 0.0

        if removed_count == 0:
            return Graveyard(
                removed_count=0,
                removed_pct=0.0,
                top_channels=[],
                monthly_timeline=[],
            )

        # Top channels with most removed videos
        channel_removed = (
            removed_df.groupby("channel_name")
            .size()
            .reset_index(name="count")
            .sort_values("count", ascending=False)
        )
        top_channels = [
            GraveyardChannel(channel=row["channel_name"], count=int(row["count"]))
            for _, row in channel_removed.head(10).iterrows()
        ]

        # Monthly timeline
        removed_df = removed_df.copy()
        removed_df["month"] = removed_df["watch_date"].dt.to_period("M").astype(str)
        monthly = (
            removed_df.groupby("month")
            .size()
            .reset_index(name="count")
            .sort_values("month")
        )
        monthly_timeline = [
            {"month": row["month"], "count": int(row["count"])}
            for _, row in monthly.iterrows()
        ]

        return Graveyard(
            removed_count=removed_count,
            removed_pct=removed_pct,
            top_channels=top_channels,
            monthly_timeline=monthly_timeline,
        )
