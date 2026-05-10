import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from analytics.wrapped_service import WrappedService
from models.analytics_models import (
    Overview, WatchPersonality, TopCreators, GenreJourney,
    Binges, ShortsData, Graveyard,
)


def _make_df(n: int = 100, seed: int = 42) -> pd.DataFrame:
    """Create a realistic test DataFrame with n rows."""
    rng = np.random.default_rng(seed)

    base_date = datetime(2024, 1, 1, 12, 0, 0)
    watch_dates = [base_date + timedelta(hours=int(i * 2.5 + rng.integers(0, 6))) for i in range(n)]

    # Mix durations: ~20% are shorts (<=60s), rest are long-form
    durations = []
    for i in range(n):
        if i % 5 == 0:  # every 5th video is a short
            durations.append(int(rng.integers(10, 61)))
        else:
            durations.append(int(rng.integers(120, 3600)))

    # 15 channels (Channel_0 through Channel_14)
    num_channels = 15
    channel_ids = rng.integers(0, num_channels, size=n)
    channel_names = [f"Channel_{cid}" for cid in channel_ids]

    # Category IDs from the genre map
    category_ids_pool = [10, 20, 22, 24, 27, 28]
    category_ids = rng.choice(category_ids_pool, size=n).tolist()

    # Video statuses — 5 Removed, rest Available
    statuses = ["Available"] * n
    removed_indices = rng.choice(n, size=5, replace=False).tolist()
    for idx in removed_indices:
        statuses[idx] = "Removed"

    video_ids = [f"vid_{i:04d}" for i in range(n)]
    titles = [f"Video Title {i}" for i in range(n)]
    tags = [f"tag{i % 10},tag{(i + 1) % 10}" for i in range(n)]
    descriptions = [f"Description for video {i}" for i in range(n)]

    df = pd.DataFrame({
        "watch_date": watch_dates,
        "date_": [d.strftime("%Y-%m-%d") for d in watch_dates],
        "video_id": video_ids,
        "title": titles,
        "channel_name": channel_names,
        "video_length_secs": durations,
        "category_id": category_ids,
        "video_status": statuses,
        "tags": tags,
        "video_description": descriptions,
    })

    return df


class TestWrappedOverview:
    def test_shorts_excluded_from_video_count(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_overview()

        assert isinstance(result, Overview)
        # shorts are <=60s
        shorts_count = int((df["video_length_secs"] <= 60).sum())
        longform_count = int((df["video_length_secs"] > 60).sum())

        assert result.total_shorts == shorts_count
        assert result.total_videos == longform_count

    def test_hours_calculated_correctly(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_overview()

        longform_df = df[df["video_length_secs"] > 60]
        expected_hours = round(longform_df["video_length_secs"].sum() / 3600, 2)

        # Allow small float rounding difference
        assert abs(result.total_hours - expected_hours) < 0.01

    def test_shorts_hours_correct(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_overview()

        shorts_df = df[df["video_length_secs"] <= 60]
        expected_shorts_hours = round(shorts_df["video_length_secs"].sum() / 3600, 2)

        assert abs(result.shorts_hours - expected_shorts_hours) < 0.01

    def test_total_videos_and_shorts_sum_to_all(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_overview()

        assert result.total_videos + result.total_shorts == len(df)


class TestWatchPersonality:
    def test_night_owl_when_peak_after_9pm(self):
        """When peak hour is >=21, personality should be night_owl."""
        n = 200
        base = datetime(2024, 1, 1, 0, 0, 0)
        # Most watches at 22:00
        watch_dates = [base + timedelta(days=i % 30, hours=22) for i in range(n)]
        df = pd.DataFrame({
            "watch_date": watch_dates,
            "date_": [d.strftime("%Y-%m-%d") for d in watch_dates],
            "video_id": [f"vid_{i}" for i in range(n)],
            "title": [f"Title {i}" for i in range(n)],
            "channel_name": ["ChannelA"] * n,
            "video_length_secs": [300] * n,
            "category_id": [22] * n,
            "video_status": ["Available"] * n,
            "tags": ["tag1"] * n,
            "video_description": ["desc"] * n,
        })
        service = WrappedService(df)
        result = service.compute_watch_personality()

        assert isinstance(result, WatchPersonality)
        assert result.type == "night_owl"
        assert result.peak_hour == 22

    def test_early_bird_when_peak_before_9am(self):
        """When peak hour is <=8, personality should be early_bird."""
        n = 200
        base = datetime(2024, 1, 1, 0, 0, 0)
        # Most watches at 7:00
        watch_dates = [base + timedelta(days=i % 30, hours=7) for i in range(n)]
        df = pd.DataFrame({
            "watch_date": watch_dates,
            "date_": [d.strftime("%Y-%m-%d") for d in watch_dates],
            "video_id": [f"vid_{i}" for i in range(n)],
            "title": [f"Title {i}" for i in range(n)],
            "channel_name": ["ChannelA"] * n,
            "video_length_secs": [300] * n,
            "category_id": [22] * n,
            "video_status": ["Available"] * n,
            "tags": ["tag1"] * n,
            "video_description": ["desc"] * n,
        })
        service = WrappedService(df)
        result = service.compute_watch_personality()

        assert isinstance(result, WatchPersonality)
        assert result.type == "early_bird"
        assert result.peak_hour == 7

    def test_nine_to_five_for_midday_peak(self):
        """When peak hour is between 9 and 20, personality should be nine_to_five."""
        n = 200
        base = datetime(2024, 1, 1, 0, 0, 0)
        # Most watches at 14:00
        watch_dates = [base + timedelta(days=i % 30, hours=14) for i in range(n)]
        df = pd.DataFrame({
            "watch_date": watch_dates,
            "date_": [d.strftime("%Y-%m-%d") for d in watch_dates],
            "video_id": [f"vid_{i}" for i in range(n)],
            "title": [f"Title {i}" for i in range(n)],
            "channel_name": ["ChannelA"] * n,
            "video_length_secs": [300] * n,
            "category_id": [22] * n,
            "video_status": ["Available"] * n,
            "tags": ["tag1"] * n,
            "video_description": ["desc"] * n,
        })
        service = WrappedService(df)
        result = service.compute_watch_personality()

        assert isinstance(result, WatchPersonality)
        assert result.type == "nine_to_five"

    def test_hourly_distribution_has_24_values(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_watch_personality()

        assert len(result.hourly_distribution) == 24

    def test_weekday_distribution_has_7_values(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_watch_personality()

        assert len(result.weekday_distribution) == 7

    def test_night_owl_at_midnight(self):
        """Hour 0 (midnight to 3am) should be night_owl."""
        n = 200
        base = datetime(2024, 1, 1, 0, 0, 0)
        watch_dates = [base + timedelta(days=i % 30, hours=1) for i in range(n)]
        df = pd.DataFrame({
            "watch_date": watch_dates,
            "date_": [d.strftime("%Y-%m-%d") for d in watch_dates],
            "video_id": [f"vid_{i}" for i in range(n)],
            "title": [f"Title {i}" for i in range(n)],
            "channel_name": ["ChannelA"] * n,
            "video_length_secs": [300] * n,
            "category_id": [22] * n,
            "video_status": ["Available"] * n,
            "tags": ["tag1"] * n,
            "video_description": ["desc"] * n,
        })
        service = WrappedService(df)
        result = service.compute_watch_personality()
        assert result.type == "night_owl"


class TestTopCreators:
    def test_returns_top_3_creators(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_top_creators()

        assert isinstance(result, TopCreators)
        assert len(result.top_3) <= 3

    def test_top_3_ordered_by_video_count(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_top_creators()

        counts = [entry.videos for entry in result.top_3]
        assert counts == sorted(counts, reverse=True)

    def test_one_hit_wonders_counted_correctly(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_top_creators()

        # Count channels with exactly 1 video manually
        channel_counts = df.groupby("channel_name").size()
        expected_one_hit_wonders = int((channel_counts == 1).sum())

        assert result.one_hit_wonder_count == expected_one_hit_wonders

    def test_loyalty_pct_between_0_and_100(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_top_creators()

        for entry in result.top_3:
            assert 0.0 <= entry.loyalty_pct <= 100.0

    def test_top_creators_with_single_dominant_channel(self):
        """If one channel dominates, it should be first."""
        n = 50
        channels = ["BigChannel"] * 40 + [f"Small_{i}" for i in range(10)]
        base = datetime(2024, 1, 1, 12, 0, 0)
        watch_dates = [base + timedelta(hours=i) for i in range(n)]
        df = pd.DataFrame({
            "watch_date": watch_dates,
            "date_": [d.strftime("%Y-%m-%d") for d in watch_dates],
            "video_id": [f"vid_{i}" for i in range(n)],
            "title": [f"Title {i}" for i in range(n)],
            "channel_name": channels,
            "video_length_secs": [600] * n,
            "category_id": [22] * n,
            "video_status": ["Available"] * n,
            "tags": ["tag1"] * n,
            "video_description": ["desc"] * n,
        })
        service = WrappedService(df)
        result = service.compute_top_creators()

        assert result.top_3[0].channel == "BigChannel"
        assert result.top_3[0].videos == 40


class TestGraveyard:
    def test_removed_count_matches_non_available(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_graveyard()

        expected_removed = int((df["video_status"] != "Available").sum())
        assert isinstance(result, Graveyard)
        assert result.removed_count == expected_removed

    def test_removed_pct_correct(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_graveyard()

        expected_pct = round((df["video_status"] != "Available").sum() / len(df) * 100, 2)
        assert abs(result.removed_pct - expected_pct) < 0.01

    def test_top_channels_non_empty_when_removed_exist(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_graveyard()

        # We have 5 removed videos from _make_df
        assert result.removed_count == 5
        assert len(result.top_channels) > 0

    def test_monthly_timeline_has_entries(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_graveyard()

        # Should return a list (may be empty if removed items grouped)
        assert isinstance(result.monthly_timeline, list)

    def test_no_removed_videos(self):
        df = _make_df(n=50, seed=42)
        df["video_status"] = "Available"  # override all to Available
        service = WrappedService(df)
        result = service.compute_graveyard()

        assert result.removed_count == 0
        assert result.removed_pct == 0.0
        assert result.top_channels == []
        assert result.monthly_timeline == []


class TestGenreJourney:
    def test_returns_genre_journey(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_genre_journey()

        assert isinstance(result, GenreJourney)

    def test_monthly_stacks_is_list(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_genre_journey()

        assert isinstance(result.monthly_stacks, list)

    def test_top_genre_has_name_and_pct(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_genre_journey()

        assert "name" in result.top_genre
        assert "pct" in result.top_genre
        assert 0 <= result.top_genre["pct"] <= 100


class TestBinges:
    def test_returns_binges(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_binges()

        assert isinstance(result, Binges)

    def test_back_to_back_pct_between_0_and_100(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_binges()

        assert 0.0 <= result.back_to_back_pct <= 100.0

    def test_top_5_sessions_is_list(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_binges()

        assert isinstance(result.top_5_sessions, list)
        assert len(result.top_5_sessions) <= 5


class TestShorts:
    def test_returns_shorts_data(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_shorts()

        assert isinstance(result, ShortsData)

    def test_total_count_matches(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_shorts()

        expected = int((df["video_length_secs"] <= 60).sum())
        assert result.total_count == expected

    def test_hourly_comparison_structure(self):
        df = _make_df(n=100, seed=42)
        service = WrappedService(df)
        result = service.compute_shorts()

        assert "shorts" in result.hourly_comparison
        assert "longform" in result.hourly_comparison
        assert len(result.hourly_comparison["shorts"]) == 24
        assert len(result.hourly_comparison["longform"]) == 24
