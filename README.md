# WIP - Youtube Stats Plus
###### Analyze your youtube statistics.


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
- Youtube API:
  - paste `youtube_api_key.txt` file inside `\Backend\src\api`

## Running the Project:

- In one terminal: Run the web server
  - Activate virtual environment
    - `.\venv\Scripts\activate`
  - `cd \Web\youtube-stats`
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


### MVP (updated 4/27/2023)
![image](https://user-images.githubusercontent.com/52568848/234989496-0c6cb714-83a0-4818-b209-5bb53bec03cc.png)
