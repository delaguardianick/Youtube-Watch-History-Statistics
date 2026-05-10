import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from analytics.deep_dive_service import DeepDiveService


def _make_df(n=200, seed=42):
    rng = np.random.default_rng(seed)
    base = datetime(2022, 1, 1)
    dates = [base + timedelta(hours=int(rng.integers(0, 35040))) for _ in range(n)]
    return pd.DataFrame({
        "watch_date": dates,
        "date_": dates,
        "video_id": [f"vid_{i}" for i in range(n)],
        "title": [f"Video {i}" for i in range(n)],
        "channel_name": [f"Channel_{i % 20}" for i in range(n)],
        "video_length_secs": rng.choice([30, 60, 300, 600, 900, 1200, 1800, 3600, 7200], size=n),
        "category_id": rng.choice([10, 20, 22, 24, 27, 28], size=n),
        "video_status": ["Available"] * n,
        "tags": ["python,coding,tutorial"] * (n // 2) + ["music,pop,2024"] * (n // 2),
        "video_description": ["desc"] * n,
    })


class TestActivityHeatmap:
    def test_returns_one_entry_per_day(self):
        df = _make_df()
        service = DeepDiveService(df)
        result = service.compute_activity_heatmap()
        dates = [d.date for d in result.data]
        assert len(dates) == len(set(dates))

    def test_year_range_covers_data(self):
        df = _make_df()
        service = DeepDiveService(df)
        result = service.compute_activity_heatmap()
        assert result.year_range[0] <= 2022
        assert result.year_range[1] >= 2025


class TestHourlyWeekdayHeatmap:
    def test_returns_168_cells(self):
        df = _make_df()
        service = DeepDiveService(df)
        result = service.compute_hourly_weekday_heatmap()
        assert len(result.data) == 168


class TestDurationDistribution:
    def test_returns_7_buckets(self):
        df = _make_df()
        service = DeepDiveService(df)
        result = service.compute_duration_distribution()
        assert len(result.buckets) == 7
        assert result.buckets[0].label == "Shorts (0-1min)"


class TestChannelDiversity:
    def test_concentration_adds_to_100(self):
        df = _make_df()
        service = DeepDiveService(df)
        result = service.compute_channel_diversity()
        assert abs(result.concentration_curve[-1] - 100.0) < 0.5
