from contextlib import asynccontextmanager
from Youtube_Analysis_Service import PlotsService as Analysis
from youtube_init import YoutubeStats as Processing
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import pandas as pd
from pydantic.v1 import BaseSettings
from html_takeout_parser import parse_html_takeout
from analytics.wrapped_service import WrappedService
from analytics.deep_dive_service import DeepDiveService
from models.analytics_models import WrappedResponse, DeepDiveResponse, DateRange

origins = [
    "http://localhost",
    "http://localhost:8000",
    "https://yt-watch-history-stats-production.up.railway.app/",
    "https://fastapi-production-0dec.up.railway.app/",
    "https://o413082.ingest.sentry.io/api/6520676/envelope/?sentry_key=84bf6d1a437a48ea822d66c72bc407ca&sentry_version=7&sentry_client=sentry.javascript.nextjs%2F7.41.0",
    "*",
]


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    global s
    s = Settings()
    s.analysis_service = Analysis()
    yield
    # Clean up if needed


app = FastAPI(lifespan=app_lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
plots = None


class Settings(BaseSettings):
    processing_service: Processing = None
    analysis_service: Analysis = None


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.post("/upload")
async def process_upload(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename or ""
        print(f"Upload received: {filename} ({len(contents)} bytes)")

        content_str = contents.decode("utf-8")
        is_html = filename.endswith((".html", ".htm")) or content_str.strip().startswith("<")

        if is_html:
            takeout_data = parse_html_takeout(content_str)
            print(f"Parsed {len(takeout_data)} entries from HTML takeout")
        else:
            takeout_data = json.loads(content_str)

        s.processing_service = Processing(takeout_data)
        takeout_id = s.processing_service.process_takeout(
            enhanced=True, transcript_flag=False
        )
        return {"message": "Takeout uploaded successfully", "takeout_id": takeout_id}
    except Exception as e:
        print(f"Failed to process upload {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to process upload {e}")


@app.get("/plots/all")
async def get_all_plots():
    try:
        s.analysis_service = Analysis()
        s.analysis_service.fetch_watch_history()
        plots = s.analysis_service.get_all_plots()
        return JSONResponse(content=json.loads(plots))
    except Exception as e:
        print(f"Failed to retrieve plots: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve plots: {e}")


@app.get("/stats")
async def get_takeout_stats():
    try:
        s.analysis_service.fetch_watch_history()
        df_stats = s.analysis_service.get_df_stats()
        return JSONResponse(content=json.loads(df_stats))
    except Exception as e:
        print(f"Failed to retrieve statistics: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve statistics: {e}")

@app.get("/analytics/wrapped", response_model=WrappedResponse)
async def get_wrapped_analytics():
    try:
        analysis = Analysis()
        analysis.fetch_watch_history()
        df = analysis.filtered_watch_history_df

        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="No watch history data found")

        service = WrappedService(df)

        start_date = df["watch_date"].min()
        end_date = df["watch_date"].max()

        return WrappedResponse(
            date_range=DateRange(
                start=str(start_date.date()) if pd.notna(start_date) else "",
                end=str(end_date.date()) if pd.notna(end_date) else "",
            ),
            overview=service.compute_overview(),
            watch_personality=service.compute_watch_personality(),
            top_creators=service.compute_top_creators(),
            genre_journey=service.compute_genre_journey(),
            binges=service.compute_binges(),
            shorts=service.compute_shorts(),
            graveyard=service.compute_graveyard(),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Failed to compute wrapped analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compute wrapped analytics: {e}")


@app.get("/analytics/deep-dive", response_model=DeepDiveResponse)
async def get_deep_dive_analytics():
    try:
        analysis = Analysis()
        analysis.fetch_watch_history()
        df = analysis.watch_history_df  # all-time, not filtered

        if df is None or df.empty:
            raise HTTPException(status_code=404, detail="No watch history data found")

        df["video_length_secs"] = pd.to_numeric(df["video_length_secs"], errors="coerce").fillna(0).astype(int)

        service = DeepDiveService(df)

        return DeepDiveResponse(
            activity_heatmap=service.compute_activity_heatmap(),
            hourly_weekday_heatmap=service.compute_hourly_weekday_heatmap(),
            watch_trends=service.compute_watch_trends(),
            duration_distribution=service.compute_duration_distribution(),
            tag_cloud=service.compute_tag_cloud(),
            channel_diversity=service.compute_channel_diversity(),
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Failed to compute deep-dive analytics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compute deep-dive analytics: {e}")


if __name__ == "__main__":
    print("Starting API")
    uvicorn.run(app, host="0.0.0.0", port=8000)
