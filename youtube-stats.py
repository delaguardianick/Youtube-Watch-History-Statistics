from ast import main
import sqlite3
import json
import datetime
import YoutubeVideo as YoutubeVideo


class YoutubeStats:
    def main(self):
        watch_history = self.get_watch_history()
        dbLocation = "SQLite/YoutubeStats.sqlite"
        self.setup_db(dbLocation)
        self.save_history_to_db(self, watch_history, dbLocation)

    def get_watch_history():
        path = r"C:\Users\Gordak\Documents\Nick\Personal\Data\Takeout\YouTube and YouTube Music\history"
        file = "\watch-history.json"

        f = open(path + file, encoding="utf8")
        watchHistory = json.load(f)
        return watchHistory

    def save_history_to_db(self, watch_history, dbLocation):
        watch_history = self.get_watch_history()
        self.write_to_db(self, watch_history, dbLocation)

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

    def write_to_db(self, watch_history, dbLocation):
        conn = sqlite3.connect(dbLocation)
        c = conn.cursor()
        for video in watch_history:
            videoObj = self.clean_data(video)

            c.execute("""INSERT INTO watch_history(
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
                    is_available
                    )
                VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) """,
                      (
                          videoObj.get_watch_date_time_iso(),
                          videoObj.get_watch_date(),
                          videoObj.get_watch_time(),
                          videoObj.get_watch_year(),
                          videoObj.get_watch_month(),
                          videoObj.get_watch_day(),
                          videoObj.get_watch_hour(),
                          videoObj.get_watch_weekday(),
                          videoObj.get_title(),
                          videoObj.get_video_URL(),
                          videoObj.get_channel_name(),
                          videoObj.get_channel_url(),
                          videoObj.get_video_status(),
                          videoObj.get_is_available(),
                      )
                      )
        conn.commit()
        conn.close()
        print("Written to table")

    def setup_db(dbLocation):
        conn = sqlite3.connect(dbLocation)
        c = conn.cursor()

        c.execute("""DROP TABLE watch_history;""")
        # Create table
        c.execute("""CREATE TABLE watch_history(
            watch_id INTEGER PRIMARY KEY,
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
            is_available BOOLEAN
        )
        """)
        conn.commit()
        conn.close()


def main():
    YoutubeStats.main(YoutubeStats)


if __name__ == "__main__":
    main()
