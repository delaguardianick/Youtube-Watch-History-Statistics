from YoutubeVideo import YoutubeVideo
from datetime import datetime


class DataModifier:
    def clean_data(self, video) -> YoutubeVideo:
        raw_date_time = video.get("time")
        date = raw_date_time[:10]
        time = raw_date_time[11 : len(raw_date_time) - 1]
        datetimeISO = date + " " + time

        date_obj = datetime.fromisoformat(raw_date_time[: len(raw_date_time) - 1])

        title = video.get("title").split(" ", 1)[1]
        video_URL = "" if video.get("titleUrl") == None else video.get("titleUrl")
        channel_name = (
            ""
            if video.get("subtitles") == None
            else video.get("subtitles")[0].get("name")
        )
        channel_url = (
            ""
            if video.get("subtitles") == None
            else video.get("subtitles")[0].get("url")
        )

        video_obj = YoutubeVideo(
            date_obj,
            datetimeISO,
            title,
            video_URL,
            channel_name,
            channel_url,
        )
        return video_obj

    def video_length_to_seconds(video_length_iso):
        video_length = video_length_iso[2:]

        # Get days
        if "D" in video_length:
            return "TOO LONG", -1

        # Get hours
        hours, video_length = DataModifier.interval_split_time(video_length, "H")

        # Get minutes
        mins, video_length = DataModifier.interval_split_time(video_length, "M")

        # Get seconds
        secs, video_length = DataModifier.interval_split_time(video_length, "S")

        video_length_str = f"{hours}:{mins}:{secs}"
        total_secs = (
            "0"
            if video_length_str == None
            else (int(hours) * 3600) + (int(mins) * 60) + (int(secs))
        )

        return video_length_str, total_secs

    def interval_split_time(video_length, split_by):
        split = video_length.split(split_by, 1)
        interval = "00"

        if (len(split)) == 2:
            interval = split[0]
            video_length = split[1]
            interval = "0" + interval if len(interval) == 1 else interval
        return interval, video_length

    def add_video_length(self, video_obj, video_extra_details):
        video_length_str, video_length_secs = self.video_length_to_seconds(
            self, video_extra_details.get("contentDetails").get("duration")
        )

        video_obj.set_video_length(video_length_str, video_length_secs)
        return video_obj

    def append_videos_id_to_query(self, watch_history) -> list[str]:
        vid_ids_to_query = [""]
        for video in watch_history:
            video_url = "" if video.get("titleUrl") == None else video.get("titleUrl")

            video_id = self.get_video_id(video_url)
            video_id = "" if video_id == None else video_id

            vid_ids_to_query.append(video_id)

        return vid_ids_to_query
