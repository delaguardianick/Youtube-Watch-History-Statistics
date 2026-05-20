import re
from datetime import datetime


def parse_html_takeout(html_content: str) -> list[dict]:
    """Parse Google Takeout watch-history.html into the same JSON format
    that the original watch-history.json used."""

    entries = []
    blocks = html_content.split('outer-cell')[1:]  # skip header

    video_pattern = re.compile(
        r'Watched[\s\xa0]*<a href="(https://www\.youtube\.com/watch\?v=[^"]+)">([^<]+)</a>'
    )
    channel_pattern = re.compile(
        r'<a href="(https://www\.youtube\.com/channel/[^"]+)">([^<]+)</a>'
    )
    # Match dates like "May 8, 2026, 10:57:29 PM CEST"
    date_pattern = re.compile(
        r'(\w+ \d{1,2}, \d{4}, \d{1,2}:\d{2}:\d{2}\s*[AP]M)\s*\w*'
    )

    for block in blocks:
        video_match = video_pattern.search(block)
        if not video_match:
            continue

        video_url = video_match.group(1)
        title = video_match.group(2)

        channel_match = channel_pattern.search(block)
        channel_name = channel_match.group(2) if channel_match else ""
        channel_url = channel_match.group(1) if channel_match else ""

        date_match = date_pattern.search(block)
        if date_match:
            date_str = date_match.group(1).replace('\u202f', ' ')
            try:
                dt = datetime.strptime(date_str, "%b %d, %Y, %I:%M:%S %p")
                iso_time = dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
            except ValueError:
                iso_time = "2000-01-01T00:00:00.000Z"
        else:
            iso_time = "2000-01-01T00:00:00.000Z"

        entry = {
            "header": "YouTube",
            "title": f"Watched {title}",
            "titleUrl": video_url,
            "subtitles": [{"name": channel_name, "url": channel_url}] if channel_name else None,
            "time": iso_time,
            "products": ["YouTube"],
            "activityControls": ["YouTube watch history"],
        }
        entries.append(entry)

    return entries
