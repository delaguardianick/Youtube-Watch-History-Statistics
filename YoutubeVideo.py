class YoutubeVideo:
    video_status = None
    is_available = None

    def __init__(self,
                 watch_date_time, watch_date_time_iso, title, video_URL, channel_name, channel_url):
        self.watch_date_time = watch_date_time
        self.watch_date_time_iso = watch_date_time_iso
        self.title = title
        self.video_URL = video_URL
        self.channel_name = channel_name
        self.channel_url = channel_url

        self.derive_attributes()

    def get_watch_date_time_iso(self):
        return self.watch_date_time_iso

    def get_watch_date_time(self):
        return self.watch_date_time

    def get_watch_date(self):
        return str(self.watch_date_time.date())

    def get_watch_time(self):
        return str(self.watch_date_time.time())

    def get_watch_weekday(self):
        return self.watch_date_time.weekday()

    def get_watch_year(self):
        return self.watch_date_time.year

    def get_watch_day(self):
        return self.watch_date_time.day

    def get_watch_month(self):
        return self.watch_date_time.month

    def get_watch_hour(self):
        return self.watch_date_time.hour

    def get_title(self):
        return self.title

    def get_video_URL(self):
        return self.video_URL

    def get_channel_name(self):
        return self.channel_name

    def get_channel_url(self):
        return self.channel_url

    def get_video_status(self):
        return self.video_status

    def get_is_available(self):
        return self.is_available

    def derive_attributes(self):
        self.set_video_status()
        self.set_is_available()

    def set_video_status(self):
        if (self.title.__eq__("a video that has been removed")):
            self.video_status = "Removed"
        elif (self.title.find("https://www.youtube.com/watch") != -1):
            self.video_status = "Unavailable"
        else:
            self.video_status = "Available"

    def set_is_available(self):
        self.is_available = self.video_status == "Available"
