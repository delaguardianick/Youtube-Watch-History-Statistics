import time

# import youtube_api as youtube_api
from Youtube_Analysis_Service import PlotsService as Plots

# from matplotlib.figure import Figure
from fastapi import FastAPI
import matplotlib.pyplot as plt
import base64
import io
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
plots = None


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.get("/plots/all")
async def get_all_plots():
    plots_service = Plots()
    plots = plots_service.get_all_plots()
    return JSONResponse(content=plots)


if __name__ == "__main__":
    print("Starting API")
    # get_info_db()
