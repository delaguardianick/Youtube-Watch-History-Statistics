import pytest
from datetime import datetime
from analytics.session_detector import detect_sessions, Session


def _make_video(watch_time_str: str, duration_secs: int) -> dict:
    return {
        "watch_date": datetime.fromisoformat(watch_time_str),
        "video_length_secs": duration_secs,
        "title": "test",
        "channel_name": "test_channel",
    }


class TestDetectSessions:
    def test_empty_list_returns_no_sessions(self):
        assert detect_sessions([], max_gap_secs=120, min_videos=2) == []

    def test_single_video_no_session(self):
        videos = [_make_video("2025-11-15T20:00:00", 600)]
        assert detect_sessions(videos, max_gap_secs=120, min_videos=2) == []

    def test_two_consecutive_videos_within_gap(self):
        videos = [
            _make_video("2025-11-15T20:00:00", 600),   # 10 min video
            _make_video("2025-11-15T20:10:30", 300),    # starts 30s after first ends
        ]
        sessions = detect_sessions(videos, max_gap_secs=120, min_videos=2)
        assert len(sessions) == 1
        assert sessions[0].video_count == 2
        assert sessions[0].weekday == "Saturday"

    def test_gap_too_large_splits_sessions(self):
        videos = [
            _make_video("2025-11-15T20:00:00", 600),
            _make_video("2025-11-15T20:15:00", 600),    # 5 min gap — too large
            _make_video("2025-11-15T21:00:00", 600),
            _make_video("2025-11-15T21:10:30", 600),    # 30s gap — within
        ]
        sessions = detect_sessions(videos, max_gap_secs=120, min_videos=2)
        assert len(sessions) == 1
        assert sessions[0].video_count == 2

    def test_shorts_binge_detection(self):
        videos = [
            _make_video("2025-11-15T20:00:00", 30),
            _make_video("2025-11-15T20:00:45", 25),     # 15s gap
            _make_video("2025-11-15T20:01:20", 40),     # 10s gap
        ]
        sessions = detect_sessions(videos, max_gap_secs=90, min_videos=2)
        assert len(sessions) == 1
        assert sessions[0].video_count == 3

    def test_longest_session_is_first_when_sorted(self):
        videos = [
            _make_video("2025-11-15T10:00:00", 600),
            _make_video("2025-11-15T10:10:30", 600),
            _make_video("2025-11-15T10:21:00", 600),
            _make_video("2025-11-15T10:31:30", 600),    # 4-video session
            _make_video("2025-11-15T20:00:00", 600),
            _make_video("2025-11-15T20:10:30", 600),    # 2-video session
        ]
        sessions = detect_sessions(videos, max_gap_secs=120, min_videos=2)
        assert len(sessions) == 2
        assert sessions[0].video_count == 4
        assert sessions[1].video_count == 2
