import sqlite3
import YoutubeVideo as YoutubeVideo
import time as time
from youtube_api import YoutubeApi
from data_modifier import DataModifier
import json
from pathlib import Path
import os
import uuid
from youtube_transcript_api import YouTubeTranscriptApi
from config import config
from database.DBHandler import DBHandler
import sys

# Get the absolute path of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Add the parent directory to sys.path
sys.path.append(os.path.join(script_dir, ".."))


class YoutubeStats:
    all_video_objects = []
    takeout = None
    takeoutId = None
    dbActions = None
    db_handler = None

    def __init__(self, takeout: json):
        self.takeout = takeout
        self.takeoutId = str(uuid.uuid4())
        self.dbActions = DatabaseActions()
        self.db_handler = DBHandler()

    def process_takeout(self, enhanced: bool = True, get_transcript: bool = False):
        print("Processing takeout...")
        self.add_takeout()
        if enhanced:
            self.update_rows_extra_info(get_transcript)

    def add_takeout(self):
        conn = self.db_handler.connect()
        count = 0
        for video in self.takeout:
            video_obj = DataModifier.clean_data(video)
            if not (video_obj.video_id):
                continue
            self.all_video_objects.append(video_obj)
            count += 1
            if count % 1000 == 0:
                self.dbActions.insert_many_records(
                    self.takeoutId, conn, self.all_video_objects
                )
                self.all_video_objects = []
                # print(f"Inserted batch {count // 1000}")

        conn.commit()
        conn.close()
        print(f"Inserted {count} videos to table")

    def update_rows_extra_info(self, get_transcript: bool = False):
        print("Getting additional video information")
        conn = self.db_handler.connect()
        select_cursor = conn.cursor()
        select_cursor.execute("BEGIN")

        # Create list of video IDs to query for additional information
        video_ids_to_query_list = DataModifier.append_videos_id_to_query(
            self, self.takeout
        )

        api_calls = 0
        limit = 50
        start_time_all = time.time()
        videos_processed = 0

        db_index = 1
        fifty_calls_time = time.time()
        0
        extra_video_details_for_all = []

        while len(video_ids_to_query_list) != 0:
            start_time_batch = time.time()

            ids_in_batch = video_ids_to_query_list[0:limit]
            video_ids_to_query_list = video_ids_to_query_list[limit:]
            ids_in_batch_str = ",".join(ids_in_batch)

            api_call_time_start = time.time()

            extra_video_details_for_batch = YoutubeApi.api_get_video_details(
                self, ids_in_batch_str
            ).get("items")

            api_call_time_end = time.time()
            api_calls += 1

            update_row_total_time = 0

            # Actually updated DB with new fields
            self.update_rows_with_new_fields(
                extra_video_details_for_batch, db_index, conn, get_transcript
            )

            end_time_batch = time.time()

            # ----------------------------------- debugging -----------------------------------
            # print(select_cursor.fetchall())
            # 50 api calls meaning ~~50*50 = 2500 videos. ~35560 videos in total. 35560/2500 = 14.22 batches
            # takes around 14 seconds per batch. 14*14 = 196 seconds. 196/60 = 3.27 minutes
            # for some reason logging says it takes about 3.5 seconds per batch so 50 batches -> 170 seconds

            if (api_calls) % 50 == 0:
                fifty_calls_time = time.time() - fifty_calls_time
                conn.commit()
                print("commited....")

                print(
                    f"Batch {api_calls % 50} done: {end_time_batch - start_time_batch} seconds"
                )
                print(f"video n: {db_index}")
                print(f"  api call time: {api_call_time_end - api_call_time_start} s")
                print(f"  update_row time: {update_row_total_time} s")
                print(f"fifty calls time: {fifty_calls_time} s")

        conn.commit()
        conn.close()
        # end_time_all = time.time()
        # print(
        #     f"Updated table with length - api calls: {api_calls} - Time: {end_time_all - start_time_all} / 60"
        # )

    def update_rows_with_new_fields(
        self, video_details_for_batch: list, db_index: int, conn, get_transcript: bool
    ):
        # Update corresponding rows in database table with additional information
        for i in range(len(video_details_for_batch)):
            video_details = video_details_for_batch[i]

            video_id = video_details.get("id")
            duration = video_details.get("contentDetails").get("duration")
            description = video_details.get("snippet").get("description")
            categoryId = video_details.get("snippet").get("categoryId")
            tags = repr(video_details.get("snippet").get("tags"))
            transcript = self.get_video_transcript(video_id) if get_transcript else None

            (
                video_length_str,
                video_length_secs,
            ) = DataModifier.video_length_to_seconds(duration)

            # update_row_time_start = time.time()

            self.dbActions.update_row(
                conn,
                video_length_str,
                video_length_secs,
                description,
                categoryId,
                tags,
                transcript,
                video_id,
            )

            # update_row_time_end = time.time()
            # update_row_total_time += update_row_time_end - update_row_time_start

            db_index += 1

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

    # Update corresponding row in database table with additional information
    # Todo: USE AN INDEX TO SIGNIFICANTLY SPEED IT UP
    def update_row(
        self,
        conn,
        video_length_str,
        video_length_secs,
        description,
        categoryId,
        tags,
        transcript,
        video_id,
    ):
        with conn.cursor() as select_cursor:
            select_cursor.execute(
                """UPDATE watch_history_dev_takeout_id
                SET
                video_length_str = %s,
                video_length_secs = %s,
                video_description = %s,
                category_id = %s,
                tags = %s,
                transcript = %s
                WHERE
                video_id = %s
                """,
                (
                    video_length_str,
                    video_length_secs,
                    description,
                    categoryId,
                    tags,
                    transcript,
                    video_id,
                ),
            )
            conn.commit()

    def insert_many_records(self, takeoutId, conn, video_objs):
        # print(f"Num of records: {len(video_objs)}")
        # Prepare data for insertion
        data = [
            (
                video_obj.get_video_id(),
                takeoutId,
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
            )
            for video_obj in video_objs
        ]

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
                    video_length_secs
                )
                VALUES {values_str}
                ON CONFLICT (video_id) DO NOTHING"""
            c.execute(query, data)
            conn.commit()
        # print("Inserted all records into database table")

    # def insert_into_table(self, takeoutId, conn, video_obj):
    #     # Insert video data object into database table
    #     with conn.cursor() as c:
    #         c.execute(
    #             """INSERT INTO watch_history_dev_takeout_id(
    #                 video_id,
    #                 takeout_id,
    #                 date_time_iso,
    #                 date_,
    #                 time_,
    #                 year_date,
    #                 month_date,
    #                 day_date,
    #                 hour_time,
    #                 day_of_week,
    #                 title,
    #                 video_URL,
    #                 channel_name,
    #                 channel_url,
    #                 video_status,
    #                 is_available,
    #                 video_length_str,
    #                 video_length_secs
    #                 )
    #             VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    #             ON CONFLICT (video_id) DO NOTHING""",
    #             (
    #                 video_obj.get_video_id(),
    #                 takeoutId,
    #                 video_obj.get_watch_date_time_iso(),
    #                 video_obj.get_watch_date(),
    #                 video_obj.get_watch_time(),
    #                 video_obj.get_watch_year(),
    #                 video_obj.get_watch_month(),
    #                 video_obj.get_watch_day(),
    #                 video_obj.get_watch_hour(),
    #                 video_obj.get_watch_weekday(),
    #                 video_obj.get_title(),
    #                 video_obj.get_video_URL(),
    #                 video_obj.get_channel_name(),
    #                 video_obj.get_channel_url(),
    #                 video_obj.get_video_status(),
    #                 video_obj.get_is_available(),
    #                 video_obj.get_video_length_str(),
    #                 video_obj.get_video_length_secs(),
    #             ),
    #         )
    #         conn.commit()


# def youtube_main(self):
#     dbLocation = "C:/Users/Gordak/Documents/Nick/Projects/Coding/youtube-stats/Backend/src/SQLite/YoutubeStats.sqlite"

#     DatabaseActions.setup_db(dbLocation, "")


if __name__ == "__main__":
    db_actions = DatabaseActions()
    db_actions.setup_db()
