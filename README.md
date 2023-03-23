# WIP - Youtube Stats Plus
###### Analyze your youtube statistics.

### MVP3 
![image](https://user-images.githubusercontent.com/52568848/227387764-eba443fa-f6cd-461d-99e4-0f6ffb470bdc.png)

#### Dependencies
- Virtual Environment
  - Create a new virtual env
    - create new folder `venv` under `\Backend` 
    - `python -m venv /path/to/new/virtual/environment`
  - Activate virtual env:
    - `.\env\Scripts\activate`
- `pip install -r requirements.txt`

#### Start react app
- `cd .\Web\youtube-stats`

- `npm start`
  
#### Fast API
- `cd \Backend\src`

- `uvicorn api-fast:app --reload`

#### Data analysis - Jupyter notebook
- `cd \Backend\src`
- `jupyter notebook .`
- Open file `Youtube_Analysis.ipynb` 


Setting up apache superset
https://superset.apache.org/docs/installation/installing-superset-using-docker-compose/ 
