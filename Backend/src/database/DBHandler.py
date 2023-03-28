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

            # create a cursor
            cur = conn.cursor()

            # execute a statement
            print("PostgreSQL database version:")
            cur.execute("SELECT version()")

            # display the PostgreSQL database server version
            db_version = cur.fetchone()
            print(db_version)

            # close the communication with the PostgreSQL
            cur.close()
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
        finally:
            if conn is not None:
                conn.close()
                print("Database connection closed.")


if __name__ == "__main__":
    db_handler = DBHandler()
    db_handler.connect()
