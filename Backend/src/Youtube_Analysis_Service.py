import sqlite3
import io
import base64
from dateutil import parser
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns


class PlotsService:
    watch_history_df = None

    # Get datestats from watch history
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
        plots["hourly_avg"] = self.plot_avg_per_hour(wh_df, date_ranges)
        plots["monthly_avg"] = self.plot_monthly_avg(wh_df, date_ranges)
        plots["top_channels"] = self.plot_top_viewed_channels(wh_df, date_ranges)
        plots["top_genres"] = self.plot_top_genres(wh_df, date_ranges)
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

        with sns.axes_style("darkgrid"):
            fig, ax = plt.subplots()
            ax.plot(
                weekdays_count_df["day_of_week"],
                weekdays_count_df["hours_watched_avg"],
                color="dodgerblue",
                marker="o",
                linestyle="-",
            )
            ax.set_title("Avg Watch Time / Weekday")
            ax.set_xlabel("Weekdays")
            ax.set_ylabel("Hours watched on average")
            ax.legend(
                [
                    f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}"
                ],
                loc="upper left",
            )
            ax.grid(True)

        return self.__get_plot_url(ax)

    def plot_avg_per_hour(self, wh_df, date_ranges):
        videos_by_hour = wh_df[["video_length_secs", "hour_time"]]
        videos_by_hour = videos_by_hour.groupby("hour_time").sum().reset_index()
        videos_by_hour["minutes_watched_avg"] = videos_by_hour[
            "video_length_secs"
        ].apply(lambda x: x / (60 * date_ranges.get("days")))

        with sns.axes_style("darkgrid"):
            fig, ax = plt.subplots()
            ax.plot(
                videos_by_hour["hour_time"],
                videos_by_hour["minutes_watched_avg"],
                color="dodgerblue",
                marker="o",
                linestyle="-",
            )
            ax.set_title("Avg Watch Time / Hour")
            ax.set_xlabel("Hour")
            ax.set_ylabel("Hours watched on average")
            ax.legend(
                [
                    f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}"
                ],
                loc="upper left",
            )
            ax.grid(True)

        return self.__get_plot_url(ax)

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

    def plot_top_viewed_channels(self, wh_df, date_ranges):
        # Filter dataframe and group by desired index
        channels_count_df = wh_df[["channel_name", "video_length_secs"]]
        channels_agg_df = (
            channels_count_df.groupby("channel_name")
            .agg({"video_length_secs": ["count", "sum"]})
            .reset_index()
        )

        # Flatten the MultiIndex columns
        channels_agg_df.columns = [
            "_".join(col).strip() for col in channels_agg_df.columns.values
        ]

        # Rename the columns
        channels_agg_df.rename(
            columns={
                "channel_name_": "channel_name",
                "video_length_secs_count": "video_count",
                "video_length_secs_sum": "video_length_secs",
            },
            inplace=True,
        )

        # Data manipulation. total secs for a channel into hours watched
        channels_agg_df["hours_watched"] = channels_agg_df["video_length_secs"].apply(
            lambda x: x / (60 * 60)
        )

        # Sort the DataFrame by total hours watched in descending order and select the top 10 most viewed channels
        top_channels_agg_df = channels_agg_df.sort_values(
            by="hours_watched", ascending=False
        ).head(10)

        # Plot the bar graph with two y-axes
        fig, ax1 = plt.subplots()

        # Plot total number of videos watched
        bar_plot = ax1.bar(
            top_channels_agg_df["channel_name"],
            top_channels_agg_df["video_count"],
            label="Total videos watched",
            alpha=0.6,
        )
        ax1.set_xlabel("Channels")
        ax1.set_ylabel("Total videos watched")
        ax1.tick_params(axis="y")

        # Rotate the x-axis labels
        ax1.set_xticklabels(
            top_channels_agg_df["channel_name"], rotation=45, ha="right"
        )

        # Create a second y-axis for the total hours watched
        ax2 = ax1.twinx()
        (line_plot,) = ax2.plot(
            top_channels_agg_df["channel_name"],
            top_channels_agg_df["hours_watched"],
            "r",
            label="Total hours watched",
            marker="o",
        )
        ax2.set_ylabel("Total hours watched")
        ax2.tick_params(axis="y")

        # Add title and legend
        plt.title("Top 10 Most Viewed Channels")
        fig.legend(
            [bar_plot, line_plot],
            ["Total videos watched", line_plot.get_label()],
            loc="lower right",
            title=f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}",
        )

        # Show the plot
        plt.tight_layout()
        # plt.show()

        return self.__get_plot_url(ax1)

    def plot_top_genres(self, wh_df, date_ranges):
        # Filter dataframe and group by desired index
        genres_count_df = wh_df[["category_id", "video_length_secs"]]
        genres_count_df = genres_count_df.groupby("category_id").sum().reset_index()

        # Data manipulation. total secs for a genre into hours watched
        genres_count_df["hours_watched"] = genres_count_df["video_length_secs"].apply(
            lambda x: x / (60 * 60)
        )

        # Map the genre names to the category_id
        genres_count_df["genre"] = genres_count_df["category_id"].map(
            self.get_genre_mapping()
        )

        # Sort the DataFrame by total hours watched in descending order and select the top 10 most watched genres
        top_genres_count_df = genres_count_df.sort_values(
            by="hours_watched", ascending=False
        ).head(10)

        # Group the DataFrame by category_id and channel_name to get the count of videos for each channel in each genre
        channel_genre_count = (
            wh_df.groupby(["category_id", "channel_name"])
            .size()
            .reset_index(name="video_count")
        )

        # Find the top channel for each genre
        top_channel_per_genre = channel_genre_count.loc[
            channel_genre_count.groupby("category_id")["video_count"].idxmax()
        ]

        # Merge the top channel information with the top genres DataFrame
        top_genres_channels_df = pd.merge(
            top_genres_count_df,
            top_channel_per_genre[["category_id", "channel_name"]],
            on="category_id",
            how="inner",
        )

        # Sort the DataFrame by total hours watched in descending order and select the top 10 most watched genres
        top_genres_channels_df = top_genres_channels_df.sort_values(
            by="hours_watched", ascending=False
        ).head(10)

        # Add the top channel information to the genre label
        top_genres_channels_df["genre_with_top_channel"] = (
            top_genres_channels_df["genre"]
            + " ("
            + top_genres_channels_df["channel_name"]
            + ")"
        )

        # Plot the bar graph
        fig, ax = plt.subplots(figsize=(12, 6))  # Adjust the figure size

        # Custom bar colors and edge colors
        colors = plt.cm.tab10.colors
        bar_plot = ax.bar(
            top_genres_channels_df["genre_with_top_channel"],
            top_genres_channels_df["hours_watched"],
            color=colors,
            edgecolor="black",
            alpha=0.7,
        )

        # Create a list of newline-separated labels that include both the genre and the top channel
        newline_labels = [
            f"{genre}\n({channel})"
            for genre, channel in zip(
                top_genres_channels_df["genre"], top_genres_channels_df["channel_name"]
            )
        ]

        # Set x-axis labels and custom style
        ax.set_xticks(top_genres_channels_df["genre_with_top_channel"].index)
        ax.set_xticklabels(newline_labels, rotation=45, ha="right")

        # Set y-axis labels
        ax.set_ylabel("Total hours watched")

        # Add title and legend
        plt.title("Top 10 Most Watched Genres with Top Channel")
        ax.legend(
            [bar_plot],
            [f"Range: {date_ranges.get('start_year')} - {date_ranges.get('end_year')}"],
        )

        # Show the plot
        plt.tight_layout()

        return self.__get_plot_url(ax)

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

    def get_genre_mapping(self):
        # Create a mapping dictionary for the genre names based on category_id
        return {
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
