import time

# import youtube_api as youtube_api
from Youtube_Analysis_Service import PlotsService as Analysis
from youtube_init import YoutubeStats as Processing

# from matplotlib.figure import Figure
from fastapi import FastAPI, File, UploadFile
import matplotlib.pyplot as plt
import base64
import io
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from pydantic import BaseSettings

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


class Settings(BaseSettings):
    processing_service: Processing = None


settings = Settings()


@app.post("/upload")
async def process_upload(file: UploadFile = File(...)):
    contents = await file.read()
    print("Processing takeout...")
    settings.processing_service = Processing(json.loads(contents))
    settings.processing_service.insert_takeout_to_db()
    return {"takeout": "Basic takeout uploaded successfully"}


@app.get("/upload/advanced")
async def process_upload():
    print("Fetching extra information about the videos...")
    settings.processing_service.insert_extra_info_to_db()
    return {"takeout": "Extra info added to db"}


@app.get("/plots/all")
async def get_all_plots():
    plots_service = Analysis()
    plots_service.fetch_watch_history()
    plots = plots_service.get_all_plots()
    return JSONResponse(content=plots)


if __name__ == "__main__":
    print("Starting API")
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # get_info_db()
