# Youtube Stats
#### Analyze your youtube statistics.

### Description
Youtube gives very rudamentary statistics about a user's watch time and viewer trends, their efforts are focused more on statistics for creators.
The end goal of this project is to give a Yotube viewer full control and details into their own watching habits, perhaps exploring global trends on youtube and how videos are watched.

Given a Google Takeout (https://takeout.google.com/settings/takeout), it will analyze your watch history and display a data dashboard.
Input: `watch_history.json` file inside the Google Takeout. Can be found in `Takeout\YouTube and YouTube Music\history` inside the takeout file.

The python script then takes every video and queries the Youtube API for extra information. All of that is then stored in a PostgreSQL DB organized like the schema below.
The data is analyzed with pandas, and through FastAPI, we send the information to an Angular app which displays the plots and relevant information.

## Installation
- Run `git clone https://github.com/delaguardianick/YT-Watch-History-Stats.git` in desired folder
- `cd YT-Watch-History-Stats` (go into cloned project)
#### Virtual Environment:
- Create virtual environment:
  - `mkdir venv` (create folder `venv`)
  - `python -m venv venv` (install virtual environemnt inside `venv` folder)
- Run virtual environment:
  - `.\venv\Scripts\activate` (this activates the virtual environment. `deactivate` to exit)
  - All requirements are installed only inside this container and not available globally on your machine

#### Installing dependencies:
- Backend:
  - `pip install -r requirements.txt`
- Frontend:
  - `cd \Web\youtube-stats`
  - `npm install`
- Database:
  - paste `database.ini` file inside `\Backend\src\database` folder
  - then run `youtube_init.py` and it should create the table for the records
- Youtube API:
  - paste `youtube_api_key.txt` file inside `\Backend\src\api`

## Running the Project:

- In one terminal: Run the web server
  - Activate virtual environment
    - `.\venv\Scripts\activate`
  - `cd Web\youtube-stats-angular\youtube-stats-v2`
  - `npm start`
  - `http://localhost:3000/` should open, if not paste URL in browser
- In another terminal: run the API server
  - `cd \Backend\src`
  - `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
  - For debugging of the backend, run the main.py file inside vscode in debugger mode, this will start the server and allow breakpoints to be placed in the python code
- Open project in desired IDE
  - `code .` if using VScode
  - Keep both terminals open
    - Web changes refresh automatically
    - Backend changes require restart of API server


## Notes:
- On uploading a takeout, it takes around a minute to process
	- 70% of that time is making API calls to youtube to get the extra info for the videos
- Youtube doesn't allow you to find out what % of the video you have watched, so these stats assume you've watched the whole video
	- Real time statistics are probably slightly lower than the displayed.

### 2024/03/31
WIP DB Schema to support multiple users

![Schema](https://github.com/delaguardianick/YT-Watch-History-Stats/assets/52568848/7b3ebaf7-e6ae-4682-b7f7-7a1d758d4805)


### 2024/03/17 
#buildinpublic
Updates can be followed here: https://twitter.com/nickdlgg 

Todo: 
- Improve MVP UI theme https://demos.creative-tim.com/black-dashboard-react/#/documentation/tutorial
    - Interactive chart.js graphs 
- Change DB table to a composite key of takeoutId-videoId
    Currently a new user's upload would overwrite existing records if same video.
    Since video data is not personalized, we could actually keep a unique record of each uploaded video, and in another table keep track of which user watched which userID. Would reduce video table size if there are many repeating videos.
- Google takeout is not as much of a bottleneck. User can request only youtube -> only videos -> only watch history. Is instant and lighweight


### MVP (updated 4/8/2024)
![image](https://github.com/user-attachments/assets/b3acc1c7-5600-4047-9575-1beb555cd4e3)
