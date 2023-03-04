import time
# import youtube_api as youtube_api
from Youtube_Analysis_Service import Plots
# from matplotlib.figure import Figure
from fastapi import FastAPI
import matplotlib.pyplot as plt
import base64
import io
from fastapi.responses import StreamingResponse
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Hello World"}


@app.get('/yt-plot')
def get_youtube_plot():
    plot = Plots.watch_time_weekday()
    # return 'render_template('yt-plot.html', plot=plot)'
    return {"GGOTEEMMM<3": "GGOTEEMMM3"}


# http://localhost:8000/plot
@app.get("/plot")
async def get_plot():
    plot = Plots.watch_time_weekday()

    # Render the plot as an image
    fig = plot.get_figure()
    canvas = FigureCanvas(fig)
    png_output = io.BytesIO()
    canvas.print_png(png_output)

    # Return the image as a response
    png_output.seek(0)
    return StreamingResponse(png_output, media_type="image/png")

if __name__ == "__main__":
    print("Starting API")
    # get_info_db()