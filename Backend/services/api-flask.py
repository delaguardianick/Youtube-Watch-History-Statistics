# import time
# from flask import Flask, render_template
# # import youtube_api as youtube_api
# from Youtube_Analysis_Service import Plots
# # from matplotlib.figure import Figure
# import base64
# from io import BytesIO
# import plotly.express as px
# from flask import render_template

# app = Flask(__name__)

# @app.route('/time')
# def get_current_time():
#     return {'time': time.time()}


# # @app.route('/yt-plot')
# # def get_youtube_plot():
# #     plot = Plots.watch_time_weekday()
# #     return render_template('yt-plot.html', plot=plot)


# # @app.route('/yt-plot')
# # def get_youtube_plot():
# #     # Call the watch_time_weekday function to get the plot
# #     plot = YT_Service.watch_time_weekday()

# #     # Create a new matplotlib figure and axis
# #     fig = Figure()
# #     ax = fig.add_subplot(1, 1, 1)

# #     # Plot the data on the axis
# #     plot.plot(ax=ax)

# #     # Render the plot as an image and convert to a base64-encoded string
# #     output = io.BytesIO()
# #     FigureCanvas(fig).print_png(output)
# #     response = make_response(output.getvalue())
# #     response.mimetype = 'image/png'
# #     response.headers['Content-Disposition'] = 'attachment; filename=plot.png'
# #     return response

# # @app.route('/yt-plot', methods=['GET'])
# # def get_youtube_plot():
# #     # Call the watch_time_weekday function to get the plot
# #     plot = YT_Service.watch_time_weekday()

# #     # Create the plot using Plotly.js
# #     fig = px.bar(plot, x='day_of_week', y='hours_watched_avg',
# #                  labels={'hours_watched_avg': 'Hours Watched on Average'})

# #     # Render the plot as HTML and return it to the client
# #     plot_html = fig.to_html(full_html=False)
# #     return render_template('plot.html', plot_html=plot_html)


# @app.route("/test")
# def hello():
#     # Generate the figure **without using pyplot**.
#     fig = Figure()
#     ax = fig.subplots()
#     ax.plot([1, 2])
#     # Save it to a temporary buffer.
#     buf = BytesIO()
#     fig.savefig(buf, format="png")
#     # Embed the result in the html output.
#     data = base64.b64encode(buf.getbuffer()).decode("ascii")
#     return f"<img src='data:image/png;base64,{data}'/>"
