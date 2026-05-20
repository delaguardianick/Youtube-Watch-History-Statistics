import json
import requests
import os
from concurrent.futures import ThreadPoolExecutor, as_completed


class YoutubeApi:
    def __init__(self):
        self.api_key = self._load_api_key()

    def api_get_video_details(self, video_ids_to_query) -> json:
        video_ids_to_query_str = ",".join(video_ids_to_query)
        request_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id={video_ids_to_query_str}&key={self.api_key}"
        video_details = requests.get(request_url).json()

        if video_details.get("items") == []:
            return {"items": []}

        return video_details

    def api_get_video_details_parallel(self, all_video_ids, batch_size=50, max_workers=10):
        """Fetch video details in parallel batches."""
        batches = [
            all_video_ids[i:i + batch_size]
            for i in range(0, len(all_video_ids), batch_size)
        ]
        all_items = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {
                executor.submit(self.api_get_video_details, batch): i
                for i, batch in enumerate(batches)
            }
            for future in as_completed(futures):
                try:
                    result = future.result()
                    items = result.get("items", [])
                    all_items.extend(items)
                except Exception as e:
                    print(f"Batch failed: {e}")

        return all_items

    def _load_api_key(self):
        api_key_file = "youtube_api_key.txt"
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), api_key_file)
        try:
            with open(file_path, "r") as f:
                return f.read().strip()
        except FileNotFoundError:
            print("Error: youtube_api_key.txt not found.")
            return None
