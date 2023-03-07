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


@app.post("/upload")
async def process_upload(file: UploadFile = File(...)):
    contents = await file.read()
    print("Processing takeout...")
    processing_service = Processing(contents)
    processing_service.youtube_main()

    return {"takeout": "File processed successfully"}


@app.get("/plots/all")
async def get_all_plots():
    plots_service = Analysis()
    plots = plots_service.get_all_plots()
    return JSONResponse(content=plots)


if __name__ == "__main__":
    print("Starting API")
    uvicorn.run(app, host="0.0.0.0", port=8000)
    # get_info_db()
