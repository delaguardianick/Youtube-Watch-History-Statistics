class YoutubeVideo:
    video_status = None
    is_available = None
    video_id = None
    video_length_str = None
    video_length_secs = None
    duration = None
    description = None
    category_id = None
    tags = None
    transcript = None
    video_length_str = None
    video_length_secs = None

    def __init__(
        self,
        watch_date_time,
        watch_date_time_iso,
        title,
        video_URL,
        channel_name,
        channel_url,
    ):
        self.watch_date_time = watch_date_time
        self.watch_date_time_iso = watch_date_time_iso
        self.title = title
        self.video_URL = video_URL
        self.channel_name = channel_name
        self.channel_url = channel_url

        self.derive_attributes()

    def derive_attributes(self):
        self.set_video_status()
        self.set_is_available()
        self.set_video_id()

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

    def set_video_status(self):
        if self.title.__eq__("a video that has been removed"):
            self.video_status = "Removed"
        elif self.title.find("https://www.youtube.com/watch") != -1:
            self.video_status = "Unavailable"
        else:
            self.video_status = "Available"

    def set_is_available(self):
        self.is_available = self.video_status == "Available"

    def set_video_id(self):
        split = self.video_URL.split("watch?v=", 1)
        self.video_id = split[1] if len(split) != 1 else None

    def get_video_id(self):
        return self.video_id

    def set_video_length(self, video_length_str, video_length_secs):
        self.video_length_str = video_length_str
        self.video_length_secs = video_length_secs

    def get_video_length_str(self):
        return self.video_length_str

    def get_video_length_secs(self):
        return self.video_length_secs

    def set_duration(self, duration):
        self.duration = duration

    def get_duration(self):
        return self.duration

    def set_description(self, description):
        self.description = description

    def get_description(self):
        return self.description

    def set_category_id(self, category_id):
        self.category_id = category_id

    def get_category_id(self):
        return self.category_id

    def set_tags(self, tags):
        self.tags = tags

    def get_tags(self):
        return self.tags

    def set_transcript(self, transcript):
        self.transcript = transcript

    def get_transcript(self):
        return self.transcript

    def get_video_length_str(self):
        return self.video_length_str

    def get_video_length_secs(self):
        return self.video_length_secs

    def set_video_length(self, video_length_str, video_length_secs):
        self.video_length_str = video_length_str
        self.video_length_secs = video_length_secs
