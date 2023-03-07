import sqlite3
import YoutubeVideo as YoutubeVideo
import time as time
from youtube_api import YoutubeApi
from data_modifier import DataModifier
import json
from pathlib import Path
import os


class YoutubeStats:
    target_table = "watch_history_dev"
    dbLocation = "SQLite/YoutubeStats.sqlite"
    all_video_objects = []
    takeout = None

    def __init__(self, takeout: json):
        self.takeout = takeout

    def youtube_main(self):
        # watch_history_takeout = YoutubeApi.get_watch_history()
        # self.setup_db(self.dbLocation, self.target_table)

        # Insert watch history data into database table
        self.insert_takeout_to_db(self.takeout, self.dbLocation, self.target_table)

        # Add additional information to database table
        # self.insert_extra_info_to_db(self, watch_history_takeout)

    def insert_takeout_to_db(self, watch_history, dbLocation, target_table):
        conn = sqlite3.connect(dbLocation)
        c = conn.cursor()
        count = 0
        for video in watch_history:
            video_obj = DataModifier.clean_data(video)
            self.all_video_objects.append(video_obj)
            count += 1

        # Insert video data objects into database table
        for video_obj in self.all_video_objects:
            self.insert_into_table(self, c, video_obj, target_table)

        print(f"number of videos in takeout: {count}")
        conn.commit()
        conn.close()
        print(f"Written to table")

    def insert_extra_info_to_db(self, watch_history_takeout):
        print("inserting extra info to db...")
        conn = sqlite3.connect(self.dbLocation)
        select_cursor = conn.cursor()
        select_cursor.execute("BEGIN")

        # Create list of video IDs to query for additional information
        video_ids_to_query_list = DataModifier.append_videos_id_to_query(
            self, watch_history_takeout
        )

        # make tuple list (watch_id, length) ?

        # UPDATE watch_history_dev SET video_length_str = "LENGTH" WHERE watch_id = 1
        api_calls = 0
        limit = 50
        start_time_all = time.time()

        db_index = 1
        while len(video_ids_to_query_list) != 0:
            start_time_batch = time.time()

            ids_in_batch = video_ids_to_query_list[0:limit]
            video_ids_to_query_list = video_ids_to_query_list[limit:]
            ids_in_batch_str = ",".join(ids_in_batch)

            api_call_time_start = time.time()

            video_details_for_batch = YoutubeApi.api_get_video_details(
                self, ids_in_batch_str
            ).get("items")

            api_call_time_end = time.time()

            api_calls += 1

            id_index = 0
            update_row_total_time = 0

            # Update corresponding rows in database table with additional information
            for i in range(len(video_details_for_batch)):
                video_details = video_details_for_batch[i]

                video_id = video_details.get("id")
                duration = video_details.get("contentDetails").get("duration")
                description = video_details.get("snippet").get("description")
                categoryId = video_details.get("snippet").get("categoryId")
                tags = repr(video_details.get("snippet").get("tags"))

                (
                    video_length_str,
                    video_length_secs,
                ) = DataModifier.video_length_to_seconds(duration)

                update_row_time_start = time.time()

                self.update_row(
                    self,
                    select_cursor,
                    conn,
                    db_index,
                    video_length_str,
                    video_length_secs,
                    description,
                    categoryId,
                    tags,
                    video_id,
                )

                update_row_time_end = time.time()
                update_row_total_time += update_row_time_end - update_row_time_start

                db_index += 1

            end_time_batch = time.time()

            # print(select_cursor.fetchall())

            if (api_calls) % 50 == 0:
                conn.commit()
                print("commited....")

                print(
                    f"Batch {api_calls} done: {end_time_batch - start_time_batch} seconds"
                )
                print(f"  api call time: {api_call_time_end - api_call_time_start} s")
                print(f"  update_row time: {update_row_total_time} s")

        conn.commit()
        conn.close()
        end_time_all = time.time()
        print(
            f"Updated table with length - api calls: {api_calls} - Time: {end_time_all - start_time_all}"
        )

    def insert_into_table(self, c, video_obj, target_table):
        # Insert video data object into database table
        c.execute(
            """INSERT or IGNORE INTO watch_history_dev2(
                video_id,
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
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) """,
            (
                video_obj.get_video_id(),
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
            ),
        )

    # Update corresponding row in database table with additional information
    # Todo: USE AN INDEX TO SIGNIFICANTLY SPEED IT UP
    def update_row(
        self,
        select_cursor,
        conn,
        target_watch_id,
        video_length_str,
        video_length_secs,
        description,
        categoryId,
        tags,
        video_id,
    ):
        select_cursor.execute(
            """UPDATE watch_history_dev2
        SET
        video_length_str = ?,
        video_length_secs = ?,
        video_description = ?,
        category_id = ?,
        tags = ?
        WHERE
        video_id = ? 
        """,
            (
                video_length_str,
                video_length_secs,
                description,
                categoryId,
                tags,
                video_id,
            ),
        )

    def setup_db(dbLocation, table_name):
        conn = sqlite3.connect(dbLocation)
        c = conn.cursor()

        c.execute("""DROP TABLE watch_history_dev;""")
        # Create table
        c.execute(
            """CREATE TABLE watch_history_dev(
                video_id TEXT PRIMARY KEY,
                user_id TEXT,
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
                tags TEXT
            )
            """
        )

        c.execute("""CREATE INDEX idx_video_id ON watch_history_dev2(video_id);""")

        conn.commit()
        conn.close()


def youtube_main():
    YoutubeStats.youtube_main(YoutubeStats)


# if __name__ == "__main__":
# youtube_main()
# get_info_db()
