import json
import requests
import os


class YoutubeApi:
    def api_get_video_details(self, video_ids_to_query) -> json:
        api_key = YoutubeApi.get_api_key()
        request_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={video_ids_to_query}&key={api_key}"
        video_details = requests.get(request_url).json()

        return video_details

    def get_api_key():
        # Construct the path to the API key file
        api_key_file = "youtube_api_key.txt"
        file_path = os.path.dirname(os.path.abspath(__file__)) + "\\" + api_key_file

        # Read the API key from the file
        try:
            with open(file_path, "r") as f:
                api_key = f.read().strip()
                return api_key
        except FileNotFoundError:
            print("Error: youtube_api_key.txt not found.")
            return None
