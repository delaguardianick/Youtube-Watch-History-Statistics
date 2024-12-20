from contextlib import asynccontextmanager
from Youtube_Analysis_Service import PlotsService as Analysis
from youtube_init import YoutubeStats as Processing
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from pydantic.v1 import BaseSettings

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
        # Process file and return takeout_id
        contents = await file.read()
        s.processing_service = Processing(json.loads(contents))
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

if __name__ == "__main__":
    print("Starting API")
    uvicorn.run(app, host="0.0.0.0", port=8000)
