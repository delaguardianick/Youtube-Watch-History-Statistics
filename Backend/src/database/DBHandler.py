import psycopg2
from config import config
import os
from sqlalchemy import create_engine


class DBHandler:
    def connect_sqlalchemy(self):
        """Create an SQLAlchemy engine connected to the PostgreSQL database"""
        try:
            # Get the absolute path of the current script
            script_dir = os.path.dirname(os.path.abspath(__file__))

            # Construct the file path for database.ini
            file_path = os.path.join(script_dir, "database.ini")

            # Read connection parameters
            params = config(file_path)

            # Construct the connection URL
            db_url = f"postgresql://{params['user']}:{
                params['password']}@{params['host']}:{params['port']}/{params['database']}"

            # Create an SQLAlchemy engine
            print("Connecting to the PostgreSQL database using SQLAlchemy...")
            engine = create_engine(db_url)

            return engine

        except Exception as error:
            print(f"Could not connect to PostgreSQL database! : {error}")
