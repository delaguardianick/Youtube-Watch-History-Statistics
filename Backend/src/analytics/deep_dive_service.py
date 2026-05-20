import pandas as pd
import numpy as np
import ast
from collections import Counter
from models.analytics_models import (
    ActivityHeatmap, HeatmapDay, HourlyWeekdayHeatmap, HeatmapCell,
    WatchTrends, MonthlyTrend, DurationDistribution, DurationBucket,
    TagCloud, TagEntry, ChannelDiversity,
)


class DeepDiveService:
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.df["watch_date"] = pd.to_datetime(self.df["watch_date"], errors="coerce")
        self.df["video_length_secs"] = pd.to_numeric(
            self.df["video_length_secs"], errors="coerce"
        ).fillna(0).astype(int)

    def compute_activity_heatmap(self) -> ActivityHeatmap:
        df = self.df.copy()
        df["day"] = df["watch_date"].dt.date
        daily = df.groupby("day").agg(
            video_count=("video_id", "count"),
            total_secs=("video_length_secs", "sum"),
        ).reset_index()
        daily["hours"] = (daily["total_secs"] / 3600).round(2)

        data = [
            HeatmapDay(date=str(row["day"]), video_count=int(row["video_count"]), hours=float(row["hours"]))
            for _, row in daily.iterrows()
        ]

        years = df["watch_date"].dt.year
        return ActivityHeatmap(data=data, year_range=[int(years.min()), int(years.max())])

    def compute_hourly_weekday_heatmap(self) -> HourlyWeekdayHeatmap:
        df = self.df.copy()
        df["hour"] = df["watch_date"].dt.hour
        df["weekday"] = df["watch_date"].dt.dayofweek

        cells = []
        for weekday in range(7):
            for hour in range(24):
                mask = (df["weekday"] == weekday) & (df["hour"] == hour)
                hours_val = round(df.loc[mask, "video_length_secs"].sum() / 3600, 2)
                cells.append(HeatmapCell(weekday=weekday, hour=hour, hours=hours_val))

        return HourlyWeekdayHeatmap(data=cells)

    def compute_watch_trends(self) -> WatchTrends:
        df = self.df.copy()
        df["month_period"] = df["watch_date"].dt.to_period("M")
        monthly = df.groupby("month_period").agg(
            total_secs=("video_length_secs", "sum"),
            video_count=("video_id", "count"),
        ).reset_index()

        monthly["hours"] = (monthly["total_secs"] / 3600).round(1)
        monthly["month"] = monthly["month_period"].astype(str)

        current_month = pd.Timestamp.now().to_period("M").strftime("%Y-%m")
        trends = [
            MonthlyTrend(
                month=row["month"],
                hours=float(row["hours"]),
                video_count=int(row["video_count"]),
                is_partial=(row["month"] == current_month),
            )
            for _, row in monthly.iterrows()
        ]
        return WatchTrends(monthly=trends)

    def compute_duration_distribution(self) -> DurationDistribution:
        secs = self.df["video_length_secs"]
        buckets_def = [
            ("Shorts (0-1min)", 0, 60),
            ("1-5min", 61, 300),
            ("5-10min", 301, 600),
            ("10-20min", 601, 1200),
            ("20-30min", 1201, 1800),
            ("30-60min", 1801, 3600),
            ("60min+", 3601, float("inf")),
        ]
        buckets = []
        for label, low, high in buckets_def:
            count = int(((secs >= low) & (secs <= high)).sum())
            buckets.append(DurationBucket(label=label, count=count))

        return DurationDistribution(buckets=buckets)

    # Tags that carry no signal: parser artifacts ("None" from repr(None)) and
    # ultra-generic noise that drowns out interesting tags.
    _TAG_STOPWORDS = {
        "none", "nan", "null", "na", "n/a", "-", "video", "videos", "youtube",
        "yt", "shorts", "short", "vlog", "funny", "viral", "music", "new",
    }

    def compute_tag_cloud(self) -> TagCloud:
        tag_counter: Counter = Counter()
        tag_channels: dict[str, Counter] = {}

        for _, row in self.df.iterrows():
            raw_tags = row.get("tags", "")
            if not raw_tags or pd.isna(raw_tags) or raw_tags == "None":
                continue

            try:
                tags = ast.literal_eval(raw_tags) if raw_tags.startswith("[") else raw_tags.split(",")
            except (ValueError, SyntaxError):
                tags = raw_tags.split(",")

            if not isinstance(tags, (list, tuple)):
                continue

            channel = row.get("channel_name", "")
            for tag in tags:
                tag = str(tag).strip().lower()
                if tag and tag not in self._TAG_STOPWORDS and len(tag) > 1:
                    tag_counter[tag] += 1
                    if tag not in tag_channels:
                        tag_channels[tag] = Counter()
                    tag_channels[tag][channel] += 1

        top_50 = tag_counter.most_common(50)
        entries = [
            TagEntry(
                tag=tag,
                count=count,
                top_channels=[ch for ch, _ in tag_channels[tag].most_common(3)],
            )
            for tag, count in top_50
        ]
        return TagCloud(tags=entries)

    def compute_channel_diversity(self) -> ChannelDiversity:
        # Exclude videos with no resolved channel (deleted/private) so they don't
        # distort the channel counts and concentration curve.
        named = self.df[self.df["channel_name"].fillna("").str.strip() != ""]

        channel_secs = named.groupby("channel_name")["video_length_secs"].sum().sort_values(ascending=False)
        total_secs = channel_secs.sum()
        total_channels = len(channel_secs)

        channel_counts = named["channel_name"].value_counts()
        watched_once = int((channel_counts == 1).sum())
        watched_10_plus = int((channel_counts >= 10).sum())

        # Concentration curve: cumulative percentage
        cumulative = channel_secs.cumsum()
        curve_pct = ((cumulative / total_secs) * 100).round(1).tolist() if total_secs > 0 else []

        # Find how many channels make up 50%
        channels_for_50 = 0
        for i, val in enumerate(curve_pct):
            if val >= 50:
                channels_for_50 = i + 1
                break

        return ChannelDiversity(
            total_channels=total_channels,
            channels_for_50_pct=channels_for_50,
            watched_once=watched_once,
            watched_10_plus=watched_10_plus,
            concentration_curve=curve_pct,
        )
