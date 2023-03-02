import os
import subprocess
from data_modifier import DataModifier
from youtube_api import YoutubeApi


class YoutubeToMp3:
    watch_history_takeout = YoutubeApi.get_watch_history()
    video_ids_to_query_list = DataModifier.append_videos_id_to_query(DataModifier, watch_history_takeout)

    def __init__(self, watch_history_takeout, video_ids_to_query_list):
        self.watch_history_takeout = watch_history_takeout
        self.video_ids_to_query_list = video_ids_to_query_list

    def download_all_audios(self):
    # loop through video_ids_to_query_list where each item is a VIDEO_ID and replace the id's in this string https://www.youtube.com/watch?v=VIDEO_ID, then call download_mp3() with the new string
        for i, video_id in enumerate(self.video_ids_to_query_list):
            if video_id == '':
                continue

            if i == 2:
                break
            
            self.download_mp3(video_id)

    # create a method called download_mp3() that takes a string as an argument and downloads the mp3 file by calling this command: youtube-dl --extract-audio --audio-format mp3 {video_url}
    # and download the result into a folder called "extracted_mp3" with the filename being the video_id
    def download_mp3(video_id):
        video_url = "https://www.youtube.com/watch?v=" + video_id
        folder_name = "extracted_mp3"

        # Create folder if it doesn't exist
        if not os.path.exists(folder_name):
            os.makedirs(folder_name)

        # Download the mp3 file
        path = os.getcwd()
        file_name = path + "/" + folder_name + "/" + video_id + ".mp3"
        subprocess.run(["yt-dlp", "--extract-audio", "--audio-format", "mp3", "-o", file_name, video_url])


    def main():
        YoutubeToMp3(YoutubeToMp3.watch_history_takeout, YoutubeToMp3.video_ids_to_query_list)
        YoutubeToMp3.download_all_audios(YoutubeToMp3)

if __name__ == "__main__":
    YoutubeToMp3.main()


#  youtube-dl --extract-audio --audio-format mp3 https://www.youtube.com/watch?v=shzT7EFnXbw