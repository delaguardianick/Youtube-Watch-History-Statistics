import YoutubeVideo as YoutubeVideo
import time as time
from api.youtube_api import YoutubeApi
from data_modifier import DataModifier
import json
import os
import uuid
from youtube_transcript_api import YouTubeTranscriptApi
from config import config
from database.DBHandler import DBHandler
import sys
from datetime import datetime, timedelta

# Get the absolute path of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Add the parent directory to sys.path
sys.path.append(os.path.join(script_dir, ".."))


class YoutubeStats:
    takeout = None
    takeout_id = None
    db_actions = None
    db_handler = None

    def __init__(self, takeout: json):
        self.takeout = takeout
        self.takeout_id = str(uuid.uuid4())
        self.db_actions = DatabaseActions()
        self.db_handler = DBHandler()
        self.data_modifier = DataModifier()
        self.youtube_api = YoutubeApi()

    def process_takeout(self, enhanced: bool = True, transcript_flag: bool = False):
        print("Processing takeout...")
        all_videos_dict, (first_video_date, last_video_date) = self.takeout_to_objects(
            self.takeout
        )

        time_enhance_s = time.time()
        if enhanced:
            all_videos_dict = self.enhance_video_data(all_videos_dict, transcript_flag)

        self.db_actions.insert_many_records(
            self.takeout_id, list(all_videos_dict.values())
        )

        print(
            f"Total time for {len(all_videos_dict)} records: {format(time.time() - time_enhance_s, '.1f')}"
        )

        return self.takeout_id

    def takeout_to_objects(self, takeout: json) -> list:
        all_videos = []
        first_video_date = None
        last_video_date = None

        for i, video in enumerate(takeout):
            video_obj: YoutubeVideo = self.data_modifier.clean_data(video)
            if i == 0:
                first_video_date = datetime.fromisoformat(video_obj.get_watch_date())

            curr_video_date = datetime.fromisoformat(video_obj.get_watch_date())
            if self._is_more_than_12_months_apart(first_video_date, curr_video_date):
                last_video_date = curr_video_date
                break

            if video_obj.video_id:
                all_videos.append(video_obj)

        # Create a dictionary with video_id as key and video object as value
        all_videos_dict = {video.get_video_id(): video for video in all_videos}

        return all_videos_dict, (first_video_date, last_video_date)

    def _is_more_than_12_months_apart(self, date1: datetime, date2: datetime) -> bool:
        # Calculate the time difference between the two dates
        time_difference = abs(date1 - date2)

        # Check if the time difference is greater than 12 months (365 days)
        if time_difference > timedelta(days=365):
            return True
        else:
            return False

    def enhance_video_data(
        self, all_videos_dict: dict[str, any], transcript_flag: bool = False
    ) -> dict[str, any]:
        print("Getting additional video information")

        all_video_ids = list(all_videos_dict.keys())

        time_enhance_s = time.time()
        batch_size = 49
        for i in range(0, len(all_video_ids), batch_size):
            batch_videos_ids = all_video_ids[i : i + batch_size]

            extra_info_for_batch = (
                self.youtube_api.api_get_video_details(batch_videos_ids)
            ).get("items")

            # Update video objects with the information from the API response
            all_videos_dict = self.update_videos_with_api_info(
                extra_info_for_batch, all_videos_dict, transcript_flag
            )

        print(f"API calls took {format(time.time() - time_enhance_s, '.1f')}")
        return all_videos_dict

    def update_videos_with_api_info(
        self,
        video_details_for_batch: list,
        all_videos_dict: dict,
        transcript_flag: bool = False,
    ) -> dict[str, any]:
        # Update corresponding rows in database table with additional information
        for video_details in video_details_for_batch:
            video_id = video_details.get("id")
            duration = video_details.get("contentDetails").get("duration")
            transcript = (
                self.get_video_transcript(video_id) if transcript_flag else None
            )
            (
                video_length_str,
                video_length_secs,
            ) = self.data_modifier.video_length_to_seconds(duration)

            video: YoutubeVideo = all_videos_dict[video_id]
            video.set_duration(duration)
            video.set_description(video_details.get("snippet").get("description"))
            video.set_category_id(video_details.get("snippet").get("categoryId"))
            video.set_tags(repr(video_details.get("snippet").get("tags")))
            video.set_transcript(transcript)
            video.set_video_length(video_length_str, video_length_secs)
            all_videos_dict[video_id] = video

        return all_videos_dict

    def get_video_transcript(self, video_id: str):
        transcript = ""
        try:
            transcriptJson = YouTubeTranscriptApi.get_transcript(video_id)
            transcript = self._transcript_scrape_text(transcriptJson)
        except:
            print("video transcript not found id: " + video_id)

        return transcript

    def _transcript_scrape_text(self, transcriptJson: list):
        transcript = ""
        for item in transcriptJson:
            transcript += item["text"] + " "
        return transcript.strip()


class DatabaseActions:
    db_handler = None

    def __init__(self):
        self.db_handler = DBHandler()

    def setup_db(self):
        conn = self.db_handler.connect()
        c = conn.cursor()

        c.execute("""DROP TABLE watch_history_dev_takeout_id;""")
        # Create table
        c.execute(
            """CREATE TABLE watch_history_dev_takeout_id(
                video_id TEXT PRIMARY KEY,
                takeout_id TEXT,
                date_time_iso TEXT,
                date_ TEXT,
                time_ TEXT,
                year_date INTEGER,
                month_date INTEGER,
                day_date INTEGER,
                hour_time INTEGER,
                day_of_week INTEGER,
                title TEXT,
                video_URL TEXT,
                channel_name TEXT,
                channel_url TEXT,
                video_status TEXT,
                is_available BOOLEAN,
                video_length_str TEXT,
                video_length_secs TEXT,
                video_description TEXT,
                category_id INTEGER,
                tags TEXT,
                transcript TEXT
            )
            """
        )

        c.execute(
            """CREATE INDEX idx_video_id ON watch_history_dev_takeout_id(video_id);"""
        )

        conn.commit()
        conn.close()
        print("Database setup")

    def insert_many_records(self, takeout_id: str, video_objs: list):
        # Prepare data for insertion
        data = [
            (
                video_obj.get_video_id(),
                takeout_id,
                video_obj.get_watch_date_time_iso(),
                video_obj.get_watch_date(),
                video_obj.get_watch_time(),
                video_obj.get_watch_year(),
                video_obj.get_watch_month(),
                video_obj.get_watch_day(),
                video_obj.get_watch_hour(),
                video_obj.get_watch_weekday(),
                video_obj.get_title(),
                video_obj.get_video_URL(),
                video_obj.get_channel_name(),
                video_obj.get_channel_url(),
                video_obj.get_video_status(),
                video_obj.get_is_available(),
                video_obj.get_video_length_str(),
                video_obj.get_video_length_secs(),
                video_obj.get_description(),
                video_obj.get_category_id(),
                video_obj.get_tags(),
                video_obj.get_transcript(),
            )
            for video_obj in video_objs
        ]

        conn = self.db_handler.connect()

        batch_size = 5000
        insert_time_s = time.time()
        for i in range(0, len(data), batch_size):
            # Insert data into the database table using multi-row insert syntax
            with conn.cursor() as c:
                values_str = ",".join(["%s"] * len(data))
                query = f"""INSERT INTO watch_history_dev_takeout_id(
                        video_id,
                        takeout_id,
                        date_time_iso,
                        date_,
                        time_,
                        year_date,
                        month_date,
                        day_date,
                        hour_time,
                        day_of_week,
                        title,
                        video_URL,
                        channel_name,
                        channel_url,
                        video_status,
                        is_available,
                        video_length_str,
                        video_length_secs,
                        video_description,
                        category_id,
                        tags,
                        transcript
                    )
                    VALUES {values_str}
                    ON CONFLICT (video_id) DO NOTHING"""
                c.execute(query, data)
            conn.commit()
        conn.close()
        print(
            f"Inserted all records into database table in {format(time.time() - insert_time_s, '.1f')}"
        )


if __name__ == "__main__":
    db_actions = DatabaseActions()
    db_actions.setup_db()
