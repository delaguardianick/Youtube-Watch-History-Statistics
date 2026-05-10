from dataclasses import dataclass
from datetime import datetime
from typing import List

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@dataclass
class Session:
    video_count: int
    duration_secs: float
    duration_hours: float
    start_time: datetime
    date: str
    weekday: str


def detect_sessions(
    videos: list[dict],
    max_gap_secs: int,
    min_videos: int = 2,
) -> list[Session]:
    """Detect viewing sessions from a sorted list of video dicts.

    Each video dict must have 'watch_date' (datetime) and 'video_length_secs' (int).
    Videos should already be sorted by watch_date ascending.

    Args:
        videos: List of video dicts sorted by watch_date.
        max_gap_secs: Maximum gap in seconds between end of one video
                      and start of next to count as same session.
        min_videos: Minimum videos to count as a session.

    Returns:
        List of Session objects, sorted by video_count descending.
    """
    if len(videos) < min_videos:
        return []

    sorted_videos = sorted(videos, key=lambda v: v["watch_date"])
    sessions: list[Session] = []
    current_session_videos = [sorted_videos[0]]

    for i in range(1, len(sorted_videos)):
        prev = sorted_videos[i - 1]
        curr = sorted_videos[i]

        prev_end = prev["watch_date"].timestamp() + prev["video_length_secs"]
        curr_start = curr["watch_date"].timestamp()
        gap = curr_start - prev_end

        if gap <= max_gap_secs:
            current_session_videos.append(curr)
        else:
            if len(current_session_videos) >= min_videos:
                sessions.append(_build_session(current_session_videos))
            current_session_videos = [curr]

    if len(current_session_videos) >= min_videos:
        sessions.append(_build_session(current_session_videos))

    sessions.sort(key=lambda s: s.video_count, reverse=True)
    return sessions


def _build_session(videos: list[dict]) -> Session:
    start = videos[0]["watch_date"]
    last = videos[-1]
    end_ts = last["watch_date"].timestamp() + last["video_length_secs"]
    duration_secs = end_ts - start.timestamp()

    return Session(
        video_count=len(videos),
        duration_secs=round(duration_secs, 1),
        duration_hours=round(duration_secs / 3600, 1),
        start_time=start,
        date=start.strftime("%Y-%m-%d"),
        weekday=WEEKDAY_NAMES[start.weekday()],
    )
