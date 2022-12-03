import sqlite3
import json
import datetime
import YoutubeVideo as YoutubeVideo
import requests
import time as time


class YoutubeStats:
    table_to_write_to = "watch_history_no_length"
    dbLocation = "SQLite/YoutubeStats.sqlite"
    all_video_objects = []

    def youtube_main(self):
        watch_history_takeout = self.get_watch_history()

        # self.setup_db(self.dbLocation)
        # self.insert_takeout_to_db(self, watch_history_takeout, self.dbLocation)

        self.insert_extra_info_to_db(self, watch_history_takeout)

    def get_watch_history():
        path = r"C:\Users\Gordak\Documents\Nick\Personal\Data\Takeout\YouTube and YouTube Music\history"
        file = "\watch-history.json"

        f = open(path + file, encoding="utf8")
        watchHistory = json.load(f)
        return watchHistory

    def clean_data(video):
        raw_date_time = video.get("time")
        date = raw_date_time[:10]
        time = raw_date_time[11:len(raw_date_time)-1]
        datetimeISO = date + " " + time

        date_obj = datetime.datetime.fromisoformat(
            raw_date_time[:len(raw_date_time)-1])

        title = video.get("title").split(" ", 1)[1]
        video_URL = "" if video.get(
            "titleUrl") == None else video.get("titleUrl")
        channel_name = "" if video.get(
            "subtitles") == None else video.get("subtitles")[0].get("name")
        channel_url = "" if video.get(
            "subtitles") == None else video.get("subtitles")[0].get("url")

        video_obj = YoutubeVideo.YoutubeVideo(
            date_obj, datetimeISO, title, video_URL, channel_name, channel_url)
        return video_obj

    def insert_takeout_to_db(self, watch_history, dbLocation):
        conn = sqlite3.connect(dbLocation)
        c = conn.cursor()
        batch_size = 1000
        batch_num = 1
        count = 0
        limit = 49
        # video_ids_to_query_list = self.append_videos_id_to_query(
        # watch_history)

        # limit_count = 0
        # video_details_for_batch = None

        for video in watch_history:
            # if (count % limit == 0):
            #     ids_in_batch = video_ids_to_query_list[count: count+limit + 1]
            #     ids_in_batch_str = ",".join(ids_in_batch)

            #     video_details_for_batch = self.api_get_video_details(
            #         self, ids_in_batch_str)

            # video_extra_details = video_details_for_batch.get("items")[
            # count % limit]
            video_obj = self.clean_data(video)

            # if video_obj.get_video_id() != (video_extra_details.get("id")):
            #     print(
            #         f"{video_obj.get_video_id()} != {video_extra_details.get('id')}")
            #     # continue

            # video_obj = self.extra_info_db(
            #     self, video_obj, video_extra_details)

            # print(video_obj.get_video_length_str())

            self.all_video_objects.append(video_obj)

            # if (count % batch_size == 0):
            #     conn.commit()
            #     print(f"commited batch num {batch_num}")
            #     batch_num += 1

            # limit_count += 1
            count += 1

        # for video_obj in self.all_video_objects:
            # add length to video_obj

        for video_obj in self.all_video_objects:
            self.insert_into_table(self, c, video_obj)

        print(f"number of videos in takeout: {count}")
        conn.commit()
        conn.close()
        print("Written to table")

    def api_get_video_details(self, video_ids_to_query):
        api_key = self.get_api_key()
        request_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={video_ids_to_query}&key={api_key}"
        video_details = requests.get(request_url).json()

        return video_details

    def append_videos_id_to_query(self, watch_history):
        vid_ids_to_query = []
        for video in watch_history:

            video_url = "" if video.get(
                "titleUrl") == None else video.get("titleUrl")

            video_id = self.get_video_id(video_url)
            if (video_id == None):
                continue

            vid_ids_to_query.append(video_id)

        return vid_ids_to_query

    def get_video_id(video_url):
        split = video_url.split("watch?v=", 1)
        video_id = split[1] if len(split) != 1 else None
        return video_id

    def insert_into_table(self, c, video_obj):
        c.execute("""INSERT INTO watch_history_dev(
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
            VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) """,
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
                      video_obj.get_video_length_secs()
                  )
                  )

    def setup_db(dbLocation):
        conn = sqlite3.connect(dbLocation)
        c = conn.cursor()

        c.execute("""DROP TABLE watch_history_dev;""")
        # Create table
        c.execute("""CREATE TABLE watch_history_dev(
            watch_id INTEGER PRIMARY KEY,
            video_id TEXT,
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
            video_length_secs TEXT
        )
        """)
        conn.commit()
        conn.close()

    def extra_info_db(self, video_obj, video_extra_details):
        video_obj = self.add_video_length(self, video_obj, video_extra_details)
        return video_obj

    def add_video_length(self, video_obj, video_extra_details):
        video_length_str, video_length_secs = self.video_length_to_seconds(self,
                                                                           video_extra_details.get("contentDetails").get("duration"))

        video_obj.set_video_length(
            video_length_str, video_length_secs)
        return video_obj

    def get_api_key():
        api_key = "AIzaSyCQS1F5f156XRloC3ubBTR6YOO0GcHDO58"
        return api_key

    def video_length_to_seconds(self, video_length_iso):
        video_length = video_length_iso[2:]

        # Get days
        if ("D" in video_length):
            return "TOO LONG", -1

        # Get hours
        hours, video_length = self.interval_split_time(video_length, "H")

        # Get minutes
        mins, video_length = self.interval_split_time(video_length, "M")

        # Get seconds
        secs, video_length = self.interval_split_time(video_length, "S")

        video_length_str = f"{hours}:{mins}:{secs}"
        total_secs = (int(hours) * 3600) + (int(mins) * 60) + (int(secs))

        return video_length_str, total_secs

    def interval_split_time(video_length, split_by):
        split = video_length.split(split_by, 1)
        interval = "00"

        if (len(split)) == 2:
            interval = split[0]
            video_length = split[1]
            interval = "0" + interval if len(interval) == 1 else interval
        return interval, video_length

    def insert_extra_info_to_db(self, watch_history_takeout):
        conn = sqlite3.connect(self.dbLocation)
        select_cursor = conn.cursor()

        video_ids_to_query_list = self.append_videos_id_to_query(self,
                                                                 watch_history_takeout)

        # make tuple list (watch_id, length) ?

        # UPDATE watch_history_dev SET video_length_str = "LENGTH" WHERE watch_id = 1
        api_calls = 0
        limit = 50
        start_time_all = time.time()
        while (len(video_ids_to_query_list) != 0):
            start_time_batch = time.time()
            pre_for_loop_time_start = time.time()

            ids_in_batch = video_ids_to_query_list[0: limit]
            video_ids_to_query_list = video_ids_to_query_list[limit:]
            ids_in_batch_str = ",".join(ids_in_batch)

            video_details_for_batch = self.api_get_video_details(
                self, ids_in_batch_str).get("items")
            api_calls += 1

            pre_for_loop_time_end = time.time()
            print(
                f"  PRE for loop time: {pre_for_loop_time_end - pre_for_loop_time_start} s")

            for_loop_time_start = time.time()
            for video_details in video_details_for_batch:
                video_id = video_details.get("id")
                duration = video_details.get("contentDetails").get("duration")

                video_length_to_seconds_time_start = time.time()
                video_length_str, video_length_seconds = self.video_length_to_seconds(
                    self, duration)
                video_length_to_seconds_time_end = time.time()
                # print(f"    for loop time: {video_length_to_seconds_time_end - video_length_to_seconds_time_start} s")

                self.update_row(self, select_cursor, conn,
                                video_length_str, video_id)

            for_loop_time_end = time.time()
            print(
                f"  for loop time: {for_loop_time_end - for_loop_time_start} s")

            end_time_batch = time.time()
            print(
                f"Batch {api_calls} done: {end_time_batch - start_time_batch} seconds")

        conn.close()
        end_time_all = time.time()
        print(
            f"Updated table with length - api calls: {api_calls} - Time: {end_time_all - start_time_all}")

    # Todo: make more general?

    def update_row(self, select_cursor, conn, new_vid_length, watch_id_to_update):

        select_cursor.execute("""UPDATE watch_history_dev
        SET
        video_length_str = ?
        WHERE
        video_id = ?
        """, (new_vid_length, watch_id_to_update)
        )

        conn.commit()


def youtube_main():
    YoutubeStats.youtube_main(YoutubeStats)
    # YoutubeStats.insert_extra_info_to_db(YoutubeStats)


# def get_info_db():
#     YoutubeStats.extra_info_db(YoutubeStats)

if __name__ == "__main__":
    youtube_main()
    # get_info_db()
