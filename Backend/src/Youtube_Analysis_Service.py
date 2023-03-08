import sqlite3
import io
import base64
from dateutil import parser
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import matplotlib.pyplot as plt
import pandas as pd


class PlotsService:
    watch_history_df = None

    def get_df_stats(self):
        stats = {}
        stats["start_date"] = self.watch_history_df["date_"].min()
        stats["end_date"] = self.watch_history_df["date_"].max()

        return stats

    def fetch_watch_history(self):
        self.watch_history_df = pd.read_sql_query(
            "SELECT * from watch_history_dev_takeout_id WHERE is_available = 1",
            sqlite3.connect(
                "C:/Users/Gordak/Documents/Nick/Projects/Coding/youtube-stats/Backend/src/SQLite/YoutubeStats.sqlite"
            ),
        )

    def get_all_plots(self):
        wh_df, date_ranges = self.analyze_data()
        plots = {}
        plots["weekly_avg"] = self.plot_weekly_avg(wh_df, date_ranges)
        plots["hourly_avg"] = self.plot_hourly_avg(wh_df, date_ranges)
        plots["monthly_avg"] = self.plot_monthly_avg(wh_df, date_ranges)
        return plots  # {"plot_name" : "plot_url"}

    def __filter_df_year_range(self, watch_history_df, year_range):
        return watch_history_df[
            (year_range[0] <= watch_history_df.year_date)
            & (watch_history_df.year_date <= year_range[1])
        ]

    def analyze_data(self):
        # filter df by year range and get ranges
        year_range = (2016, 2021)
        wh_df = self.__filter_df_year_range(self.watch_history_df, year_range)
        date_ranges = self.__calculate_time_difference(year_range)

        # Get total video count
        # video_count_in_df = len(wh_df.watch_id)

        # Change string to int
        wh_df = wh_df[wh_df["video_length_secs"].notnull()].copy()
        wh_df["video_length_secs"] = wh_df["video_length_secs"].astype(int)

        return wh_df, date_ranges

    def plot_weekly_avg(self, wh_df, date_ranges):
        # Filter dataframe and group by desired index
        weekdays_count_df = wh_df[["video_length_secs", "day_of_week"]]
        weekdays_count_df = weekdays_count_df.groupby("day_of_week").sum().reset_index()
        # Data manipulation. total secs for a sunday into hours watched on average on a sunday
        weekdays_count_df["hours_watched_avg"] = weekdays_count_df[
            "video_length_secs"
        ].apply(lambda x: x / (60 * 60 * date_ranges.get("weeks")))

        # label mapping
        weekdays_map = {
            0: "Mon",
            1: "Tues",
            2: "Wed",
            3: "Thurs",
            4: "Fri",
            5: "Sat",
            6: "Sun",
        }
        weekdays_count_df["day_of_week"] = weekdays_count_df["day_of_week"].map(
            weekdays_map
        )

        plot = weekdays_count_df.plot(
            x="day_of_week",
            y="hours_watched_avg",
            title="Avg Watch Time / Weekday",
            xlabel="Weekdays",
            ylabel="Hours watched on average",
        ).legend(
            [f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}"]
        )

        return self.__get_plot_url(plot)

    def plot_hourly_avg(self, wh_df, date_ranges):
        videos_by_hour = wh_df[["video_length_secs", "hour_time"]]
        videos_by_hour = videos_by_hour.groupby("hour_time").sum().reset_index()
        videos_by_hour["minutes_watched_avg"] = videos_by_hour[
            "video_length_secs"
        ].apply(lambda x: x / (60 * date_ranges.get("days")))

        plot = videos_by_hour.plot(
            x="hour_time",
            y="minutes_watched_avg",
            title="Avg Watch Time / Hour",
            xlabel="Hour",
            ylabel="Minutes watched on average",
        ).legend(
            [f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}"]
        )

        return self.__get_plot_url(plot)

    def plot_monthly_avg(self, wh_df, date_ranges):
        videos_by_month = wh_df[["video_length_secs", "month_date"]]
        videos_by_month = videos_by_month.groupby("month_date").sum().reset_index()
        videos_by_month["hours_watched_avg"] = videos_by_month[
            "video_length_secs"
        ].apply(lambda x: x / (60 * 60 * date_ranges.get("years") * 12))

        plot = videos_by_month.plot(
            x="month_date",
            y="hours_watched_avg",
            title="Daily avg Watch Time / Month",
            xlabel="Month",
            ylabel="Hours watched on average",
        ).legend(
            [f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}"]
        )

        return self.__get_plot_url(plot)

    # Get weeks diff between date first and last video in df
    def __calculate_time_difference(self, year_range):
        last_video_date = parser.parse(self.watch_history_df["date_time_iso"].iloc[0])
        first_video_date = parser.parse(self.watch_history_df["date_time_iso"].iloc[-1])
        difference = last_video_date - first_video_date
        date_ranges = {
            "start_year": year_range[0],
            "end_year": year_range[1],
            "years": difference.days // 365,
            "weeks": difference.days // 7,
            "days": difference.days,
            "hours": difference.days * 24,
            "minutes": difference.days * 60,
        }
        return date_ranges

    def __get_plot_url(self, plot):
        # Render the plot as an image
        fig = plot.get_figure()
        canvas = FigureCanvas(fig)
        png_output = io.BytesIO()
        canvas.print_png(png_output)

        # Convert the binary data to a base64-encoded string
        png_output.seek(0)
        png_base64 = base64.b64encode(png_output.getvalue()).decode("utf-8")
        plt.close(fig)
        return f"data:image/png;base64,{png_base64}"
