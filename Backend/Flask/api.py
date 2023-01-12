import time
from flask import Flask
# import youtube_api as youtube_api
from Youtube_Analysis_Service import yt_service

app = Flask(__name__)


@app.route('/time')
def get_current_time():
    return {'time': time.time()}


@app.route('/youtube-plot')
def get_youtube_plot():
    return youtube_analysis.watch_time_weekday()
