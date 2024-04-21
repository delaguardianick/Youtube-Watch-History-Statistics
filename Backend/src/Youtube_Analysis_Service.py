import datetime
import sqlite3
import io
import base64
from dateutil import parser
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
from datetime import timedelta
from YoutubeVideo import YoutubeVideo
from database.DBHandler import DBHandler
import json
import numpy as np


class Plot:
    def __init__(self, plot_name, plot_url, plot_json):
        self.plot_name = plot_name
        self.plot_url = plot_url
        self.plot_json = plot_json

    def __repr__(self):
        return f"Plot({self.plot_name}, {self.plot_url, {self.plot_json}})"


class PlotsService:
    watch_history_df = None
    filtered_watch_history_df = None
    date_ranges = None
    # TODO: Change this to the takeout_id you want to analyze (watch out w sql injection)
    takeout_id_to_query = "54cd1e4b-9fde-433f-be9d-2a7142b3e369"

    def __init__(self):
        self.db_handler = DBHandler()

    def fetch_watch_history(self, local=False):
        sql_query = """
            SELECT
                tv.watch_date,
                v.*
            FROM
                (SELECT * FROM "TakeoutVideos" WHERE takeout_id = %s) AS tv
            LEFT JOIN
                "Videos" AS v
            ON
                tv.video_id = v.video_id;
            """

        if local:
            self.watch_history_df: pd.DataFrame = pd.read_sql_query(
                sql_query,
                sqlite3.connect(
                    "your/local/path.sqlite"
                ),
            )
        else:
            engine = self.db_handler.connect_sqlalchemy()
            self.watch_history_df: pd.DataFrame = pd.read_sql_query(
                sql_query,
                con=engine,
                params=(self.takeout_id_to_query,)
            )

        self.filtered_watch_history_df, self.date_ranges = self.analyze_data(
            self.watch_history_df)

        return self.watch_history_df

    def analyze_data(self, w_history_df: pd.DataFrame) -> tuple:
        # filter df by year range and get ranges

        # allVideos: list[YoutubeVideo] = self.data_frame_to_videos(w_history_df)

        dates_in_range = self.__get_last_12_months_dates(w_history_df)
        w_history_df = self.__filter_df_year_range(
            w_history_df, dates_in_range[0])
        date_ranges = self.__calculate_time_difference(dates_in_range)

        # Change string to int
        w_history_df = w_history_df[w_history_df["video_length_secs"].notnull()].copy(
        )
        w_history_df["video_length_secs"] = w_history_df["video_length_secs"].astype(
            int)

        return w_history_df, date_ranges

    def get_df_stats(self) -> dict:
        df = self.filtered_watch_history_df
        stats = {}
        stats["start_date"] = df["date_"].min()
        stats["end_date"] = df["date_"].max()

        stats["watch_time_in_hours"] = round(
            df["video_length_secs"].sum() / 3600, 1)
        stats["videos_watched"] = df.shape[0]
        stats["most_viewed_month"] = self._most_viewed_month(df)
        stats["fav_creator_by_videos"] = self._fav_creator_by_videos(df)
        stats["short_video_count"] = self.count_shorts_watched(df)

        return json.dumps(stats, default=self.default_serialization)

    def count_shorts_watched(self, df):
        # Ensure 'date_' is in datetime format
        df['date_'] = pd.to_datetime(df['date_'])
        current_date = pd.Timestamp.now()

        # Filter videos from the last year and videos under 60 seconds
        filtered_df = df[(df['date_'] >= current_date -
                          pd.DateOffset(years=1)) & (df['video_length_secs'] <= 60)]

        # Count the number of shorts
        number_of_short_videos = filtered_df.shape[0]

        # Sum the total seconds of all short videos watched
        # This will be in seconds
        total_duration_in_hours = filtered_df['video_length_secs'].sum() / 3600

        return number_of_short_videos, total_duration_in_hours

    def _most_viewed_month(self, df) -> tuple:
        df['date_'] = pd.to_datetime(df['date_'])
        df['month'] = df['date_'].dt.month

        # Group by month and sum video lengths, then convert to hours
        monthly_hours = df.groupby("month")["video_length_secs"].sum() / 3600

        # Map month number to month name using a custom month mapping
        month_mapping = self.get_mappings("months")
        monthly_hours.index = monthly_hours.index.map(
            lambda x: month_mapping[x])

        # Find the month with the maximum hours watched
        most_watched_month = monthly_hours.idxmax()
        most_watched_month_count = round(monthly_hours.max(), 1)

        return (most_watched_month, most_watched_month_count)

    def _fav_creator_by_videos(self, df) -> tuple:
        # Filter out rows where 'channel_name' is empty or any other invalid data you might have
        valid_df = df[df['channel_name'].str.strip() != '']

        # Group by 'channel_name' and aggregate both count and sum of video lengths
        channel_aggregates = valid_df.groupby("channel_name").agg(
            # Count of videos per channel
            video_count=('channel_name', 'size'),
            # Sum of video lengths per channel
            total_video_length=('video_length_secs', 'sum')
        )

        # Check if the resulting DataFrame is empty after filtering
        if channel_aggregates.empty:
            return ("No valid data", 0, 0)

        # Find the channel with the maximum number of videos
        most_viewed_channel = channel_aggregates['video_count'].idxmax()
        most_viewed_channel_count = channel_aggregates.loc[most_viewed_channel, 'video_count']
        total_length = channel_aggregates.loc[most_viewed_channel,
                                              'total_video_length']

        # Converts seconds to hours and rounds to two decimals
        total_length_in_hours = round(total_length / 3600, 2)

        return (most_viewed_channel, most_viewed_channel_count, total_length_in_hours)

    def get_all_plots(self):
        wh_df, date_ranges = self.filtered_watch_history_df, self.date_ranges

        plots = {
            "weekly_avg": self.plot_weekly_avg(wh_df, date_ranges),
            "hourly_avg": self.plot_hour_avg(wh_df, date_ranges),
            "monthly_avg": self.plot_monthly_avg(wh_df, date_ranges),
            "daily_avg": self.plot_daily_avg(wh_df, date_ranges),
            "top_channels": self.plot_top_viewed_channels(wh_df),
            "top_genres": self.plot_top_genres(wh_df),
        }

        return json.dumps(plots, default=self.default_serialization)

    def __filter_df_year_range(self, wh_df, beginning_date):
        wh_df["date_timestamp"] = pd.to_datetime(wh_df["date_"])
        filtered_df = wh_df.loc[wh_df["date_timestamp"] >= beginning_date]
        return filtered_df
        # return watch_history_df[
        #     (year_range[0] <= watch_history_df.year_date)
        #     & (watch_history_df.year_date <= year_range[1])
        # ]

    def __get_last_12_months_dates(self, wh_df):
        last_video_in_range = parser.parse(
            wh_df["watch_date"].iloc[0].date().isoformat())
        twelve_months_timedelta = timedelta(days=365)
        first_video_in_range = last_video_in_range - twelve_months_timedelta
        return (first_video_in_range, last_video_in_range)

    def plot_weekly_avg(self, wh_df, date_ranges):
        wh_df['watch_date'] = pd.to_datetime(
            wh_df['watch_date'], errors='coerce')
        wh_df['day_of_week'] = wh_df['watch_date'].dt.dayofweek

        weekdays_count_df = wh_df[["video_length_secs", "day_of_week"]]
        weekdays_count_df = weekdays_count_df.groupby(
            "day_of_week").sum().reset_index()
        # Data manipulation. total secs for a sunday into hours watched on average on a sunday
        weekdays_count_df["hours_watched_avg"] = weekdays_count_df[
            "video_length_secs"
        ].apply(lambda x: x / (60 * 60 * date_ranges.get("weeks")))

        # label mapping
        weekdays_map = self.get_mappings("weekdays")
        weekdays_count_df["day_of_week"] = weekdays_count_df["day_of_week"].map(
            weekdays_map
        )

        title = f"Average Hours Watched per Weekday in the last {
            date_ranges.get('days')} days"

        chart_data = self.plots_to_json(
            weekdays_count_df,
            "day_of_week",
            "hours_watched_avg",
            title,
        )

        plot = {
            "plot_id": "weekly_avg",
            "title": title,
            "chart_data": chart_data,
        }

        return plot

    def plot_daily_avg(self, wh_df, date_ranges):
        # Ensure 'watch_date' is in datetime format
        wh_df['watch_date'] = pd.to_datetime(
            wh_df['watch_date'], errors='coerce')

        # Extract the year and day of the year from 'watch_date'
        wh_df['day_of_year'] = wh_df['watch_date'].dt.dayofyear
        wh_df['year'] = wh_df['watch_date'].dt.year

        # Group data by day of the year and sum the video lengths
        days_count_df = wh_df.groupby(["day_of_year", "year"])[
            "video_length_secs"].sum().reset_index()

        # Calculate the average hours watched per day
        days_count_df["hours_watched_avg"] = days_count_df["video_length_secs"] / 3600

        # Convert 'day_of_year' and 'year' back to actual date, ensuring types are correct
        days_count_df['date'] = days_count_df.apply(
            lambda row: (pd.Timestamp(year=int(row['year']), month=1, day=1) +
                         pd.Timedelta(days=int(row['day_of_year']) - 1)).strftime('%b %dth, %Y'),
            axis=1)

        title = f"Average Hours Watched per Day in the Last {
            date_ranges.get('days')} Days"

        # Prepare the data for plotting
        chart_data = self.plots_to_json(
            days_count_df,
            "date",  # Use actual date for x-axis
            "hours_watched_avg",
            title
        )

        # Assemble the plot dictionary
        plot = {
            "plot_id": "daily_avg",
            "title": title,
            "chart_data": chart_data
        }

        return plot

    def plot_hour_avg(self, wh_df, date_ranges):
        wh_df['watch_date'] = pd.to_datetime(
            wh_df['watch_date'], errors='coerce')
        wh_df['hour_time'] = wh_df['watch_date'].dt.hour

        videos_by_hour = wh_df[["video_length_secs", "hour_time"]]
        videos_by_hour = videos_by_hour.groupby(
            "hour_time").sum().reset_index()
        videos_by_hour["minutes_watched_avg"] = videos_by_hour[
            "video_length_secs"
        ].apply(lambda x: x / (60 * date_ranges.get("days")))

        hour_time_map = self.get_mappings("hours")
        videos_by_hour["hour_time"] = videos_by_hour["hour_time"].map(
            hour_time_map)

        title = "Average / Hour"

        chart_data = self.plots_to_json(
            videos_by_hour,
            "hour_time",
            "minutes_watched_avg",
            f"Average Minutes Watched per Hour in the last {
                date_ranges.get('days')} days",
        )

        plot = {
            "plot_id": "hourly_avg",
            "title": title,
            "chart_data": chart_data
        }

        return plot

    def plot_monthly_avg(self, wh_df, date_ranges):
        # Convert watch_date to datetime
        wh_df['watch_date'] = pd.to_datetime(
            wh_df['watch_date'], errors='coerce')
        # Extract month and year from watch_date
        wh_df['month'] = wh_df['watch_date'].dt.month
        wh_df['year'] = wh_df['watch_date'].dt.year

        # Group by year and month and sum the seconds watched
        monthly_data = wh_df.groupby(['year', 'month'])[
            'video_length_secs'].sum().reset_index()

        # Calculate the number of days in each month-year group
        monthly_data['days_in_month'] = wh_df.groupby(
            ['year', 'month'])['watch_date'].transform(lambda x: x.dt.day.nunique())

        # Calculate total hours per month
        monthly_data['total_hours'] = monthly_data['video_length_secs'] / 3600

        # Calculate average hours per day
        monthly_data['avg_hours_per_day'] = monthly_data['total_hours'] / \
            monthly_data['days_in_month']

        # Mapping month numbers to month names
        months_map = self.get_mappings("months")
        monthly_data['month'] = monthly_data['month'].map(months_map)

        # Preparing data for the plot
        chart_data = self.plots_to_json(
            monthly_data,
            'month',
            'avg_hours_per_day',
            'Average Hours Watched per Day, each Month'
        )

        # Build the plot dictionary
        plot = {
            "plot_id": "monthly_avg",
            'title': f'Average Daily Hours Watched per Month in the last {date_ranges.get("days")} days',
            'chart_data': chart_data,
        }

        return plot

    def plot_top_viewed_channels(self, wh_df):
        channels_count_df = wh_df[["channel_name", "video_length_secs"]]
        channels_agg_df = (
            channels_count_df.groupby("channel_name")
            .agg({"video_length_secs": ["count", "sum"]})
            .reset_index()
        )

        # Flatten the MultiIndex columns
        channels_agg_df.columns = [
            "_".join(col).strip() if isinstance(col, tuple) else col for col in channels_agg_df.columns.values
        ]

        # Rename the columns for clarity
        channels_agg_df.rename(
            columns={
                "channel_name_": "channel_name",
                "video_length_secs_count": "video_count",
                "video_length_secs_sum": "total_seconds",
            },
            inplace=True,
        )

        # Convert total seconds for a channel into hours watched
        channels_agg_df["hours_watched"] = channels_agg_df["total_seconds"].apply(
            lambda x: x / 3600
        )

        # Sort the DataFrame by total hours watched in descending order and select the top 10 most viewed channels
        top_channels_agg_df = channels_agg_df.sort_values(
            by="hours_watched", ascending=False
        ).head(10)

        # Prepare data for plotting (adapted to a JSON serializable format)
        chart_data = self.plots_to_json(
            top_channels_agg_df,
            "channel_name",
            "hours_watched",
            "Top 10 Most Viewed Channels"
        )

        # Structure for ApexCharts or similar
        plot = {
            "plot_id": "top_channels",
            "title": "Top 10 Most Viewed Channels",
            "chart_data": chart_data
        }

        return plot

    def plot_top_genres(self, wh_df):
        # Filter dataframe and group by desired index
        genres_count_df = wh_df[["category_id", "video_length_secs"]]
        genres_count_df = genres_count_df.groupby(
            "category_id").sum().reset_index()

        # Convert total seconds for a genre into hours watched
        genres_count_df["hours_watched"] = genres_count_df["video_length_secs"].apply(
            lambda x: x / 3600
        )

        # Map the genre names to the category_id
        genres_count_df["genre"] = genres_count_df["category_id"].map(
            self.get_mappings("genres")
        )

        # Sort the DataFrame by total hours watched in descending order and select the top 7 most watched genres
        top_genres_count_df = genres_count_df.sort_values(
            by="hours_watched", ascending=False
        ).head(7)

        # Prepare data for plotting (adapted to a JSON serializable format)
        chart_data = self.plots_to_json(
            top_genres_count_df,
            "genre",
            "hours_watched",
            "Top 7 Most Watched Genres"
        )

        # Structure for ApexCharts or similar
        plot = {
            "plot_id": "top_genres",
            "title": "Top 7 Most Watched Genres",
            "chart_data": chart_data
        }

        return plot

    def plot_top_videos(self, wh_df):
        # Group the DataFrame by video title and channel and count the occurrences
        top_videos_df = wh_df[["title", "channel_name"]]
        top_videos_df = (
            top_videos_df.groupby(["title", "channel_name"])
            .size()
            .reset_index(name="watch_count")
        )

        # Sort the DataFrame by watch count in descending order and select the top 10 most-watched videos
        top_videos_df = top_videos_df.sort_values(
            by="watch_count", ascending=False
        ).head(10)

        # Combine video title and channel name into a single column
        top_videos_df["video_and_channel"] = (
            top_videos_df["title"] + " (" + top_videos_df["channel_name"] + ")"
        )

        # Create the vertical bar graph
        with sns.axes_style("darkgrid"):
            fig, ax = plt.subplots()
            ax.bar(
                top_videos_df["video_and_channel"],
                top_videos_df["watch_count"],
                color="dodgerblue",
                alpha=0.6,
            )
            ax.set_xlabel("Video title and channel")
            ax.set_ylabel("Number of times watched")
            ax.set_title("Top 10 Most-Watched Videos")
            ax.grid(True)

            # Rotate the X-axis labels to avoid overlapping
            plt.xticks(rotation=45, ha="right")

        return Plot("top_videos", self.__get_plot_url(ax), None)

    # Get weeks diff between date first and last video in df
    def __calculate_time_difference(self, date_range):
        difference = date_range[1] - date_range[0]
        date_ranges = {
            "start_date": date_range[0].strftime("%b %dst, %Y"),
            "end_date": date_range[1].strftime("%b %dst, %Y"),
            "start_year": date_range[0].year,
            "end_year": date_range[1].year,
            "years": difference.days // 365,
            "weeks": difference.days // 7,
            "days": difference.days,
            "hours": difference.days * 24,
            "minutes": difference.days * 60,
        }
        return date_ranges

    def get_mappings(self, mapping):
        # Create a mapping dictionary for the genre names based on category_id
        genre_map = {
            2: "Autos & Vehicles",
            1: "Film & Animation",
            10: "Music",
            15: "Pets & Animals",
            17: "Sports",
            18: "Short Movies",
            19: "Travel & Events",
            20: "Gaming",
            21: "Videoblogging",
            22: "People & Blogs",
            23: "Comedy",
            24: "Entertainment",
            25: "News & Politics",
            26: "Howto & Style",
            27: "Education",
            28: "Science & Technology",
            29: "Nonprofits & Activism",
            30: "Movies",
            31: "Anime/Animation",
            32: "Action/Adventure",
            33: "Classics",
            34: "Comedy",
            35: "Documentary",
            36: "Drama",
            37: "Family",
            38: "Foreign",
            39: "Horror",
            40: "Sci-Fi/Fantasy",
            41: "Thriller",
            42: "Shorts",
            43: "Shows",
            44: "Trailers",
        }
        months_map = {
            1: "January",
            2: "February",
            3: "March",
            4: "April",
            5: "May",
            6: "June",
            7: "July",
            8: "August",
            9: "September",
            10: "October",
            11: "November",
            12: "December",
        }
        weekdays_map = {
            0: "Mon",
            1: "Tues",
            2: "Wed",
            3: "Thurs",
            4: "Fri",
            5: "Sat",
            6: "Sun",
        }
        hour_time_map = {
            0: "12PM",
            1: "1AM",
            2: "2AM",
            3: "3AM",
            4: "4AM",
            5: "5AM",
            6: "6AM",
            7: "7AM",
            8: "8AM",
            9: "9AM",
            10: "10AM",
            11: "11AM",
            12: "12AM",
            13: "1PM",
            14: "2PM",
            15: "3PM",
            16: "4PM",
            17: "5PM",
            18: "6PM",
            19: "7PM",
            20: "8PM",
            21: "9PM",
            22: "10PM",
            23: "11PM",
        }

        match mapping:
            case "genres":
                return genre_map
            case "months":
                return months_map
            case "weekdays":
                return weekdays_map
            case "hours":
                return hour_time_map

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

    def plots_to_json(self, df, x: str, y: str, title: str):  # Create JSON object
        chart_data = {
            "categories": list(df[x]),
            "series": [
                {
                    "name": title,
                    "data": list(df[y]),
                }
            ],
        }

        return chart_data

    # function to convert np.int64 to int
    def default_serialization(self, obj):
        if isinstance(obj, np.int64):
            return int(obj)
        elif isinstance(obj, pd.Timestamp):
            return obj.isoformat()  # Convert Timestamp to ISO format string
        elif isinstance(obj, (datetime.date, datetime.datetime)):
            return obj.isoformat()  # Handle datetime objects similarly
        raise TypeError
