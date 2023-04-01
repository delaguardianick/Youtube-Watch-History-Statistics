import psycopg2
from config import config
import os


class DBHandler:
    def connect(self):
        """Connect to the PostgreSQL database server"""
        conn = None
        try:
            # Get the absolute path of the current script
            script_dir = os.path.dirname(os.path.abspath(__file__))

            # Construct the file path for private.json
            file_path = os.path.join(script_dir, "database.ini")

            # read connection parameters
            params = config(file_path)

            # connect to the PostgreSQL server
            print("Connecting to the PostgreSQL database...")
            conn = psycopg2.connect(**params)

            return conn

        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
