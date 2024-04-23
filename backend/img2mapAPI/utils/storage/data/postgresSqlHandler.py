""" """
from typing import List, Union
import psycopg2
from pydantic import BaseModel
from img2mapAPI.utils.storage.data.storageHandler import StorageHandler as sh
from img2mapAPI.utils.core.helper.postgresSqlHelper import *

class PostgresSqlHandler(sh):
    """This class is the implementation of the storage handler for PostgresSql

    The class is intended to be inherited by classes that implement the storage/DB connection and overide data manipulation functions in this class.
    Intended use as a singleton class. The class is a singleton class.
    """

    _instance = None
    
    doneSetup = False
    conn = None
    database_url = None

    async def connect(self, db: str, user: str, password: str, host: str, port: int)->any:
        """Connect to the storage

        Args:
            db (str): database name
            user (str): Db user profile name
            password (str): Db user password
            host (str): Db host
            port (int): Db port

        Returns:
            any: The connection object
        """
        if self.database_url is not None:
            conn = psycopg2.connect(self.database_url)
        else:
            conn = psycopg2.connect(dbname=db, user=user, password=password, host=host, port=port)
        return conn

    async def saveInStorage(self, data: BaseModel, type: str, pkName:str = 'id')->int:
        """Save data to storage

        Args:
            data (BaseModel): The data to be saved
            type (str): The type of the data / the table name / the model class name
            pkName (str, optional): the fieldname for the Primary Key in database/storage. Defaults to 'id'.

        Returns:
            int: The id of the saved data from the storage
        """
        
        if (self.setupDone == False): await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()
        returnid: int = 0
        if type == 'project':
            sql = f"INSERT INTO project
                (
                    name,
                    description,
                    crs,
                    imageFilePath,
                    georeferencedFilePath,
                    selfdestructtime,
                    created, 
                    lastModified
                ) VALUES (
                    '{data.name}',
                    '{data.description}', 
                    '{data.crs}', 
                    '{data.imageFilePath}', 
                    '{data.georeferencedFilePath}', 
                    '{data.selfdestructtime}', 
                    '{data.created}', 
                    '{data.lastModified}')"
            try:
                cur.execute(sql)
                conn.commit()
                returnid = cur.lastrowid
            except Exception as e:
                print(e)
                return 0
            finally:
                cur.close()
                conn.close()
        if type == 'point':
            sql = f"INSERT INTO point
                (
                    projectId,
                    Idproj,
                    lat,
                    lng,
                    row,
                    col,
                    error,
                    name,
                    description
                ) VALUES (
                    '{data.projectId}',
                    '{data.Idproj}',
                    '{data.lat}',
                    '{data.lng}',
                    '{data.row}',
                    '{data.col}',
                    '{data.error}',
                    '{data.name}',
                    '{data.description}')"
            try:
                cur.execute(sql)
                conn.commit()
                returnid = cur.lastrowid
            except Exception as e:
                print(e)
                return 0
            finally:
                cur.close()
                conn.close()
        return returnid

    async def remove(self, id: int, type: str)->None:
        """Remove data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name
        """

        if (self.setupDone == False): await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()
        try:
            sql = f"DELETE FROM {type.lower} WHERE id = {id}"
            cur.execute(sql)
            conn.commit()
        except Exception as e:
            print(e)
            pass
        finally:
            cur.close()
            conn.close()
            print(f"Deleted {type} with id {id}") #Todo: log this

    async def update(self, data: BaseModel, type: str, pkName:str = 'id')->None:
        """Update data in storage

        Args:
            data (BaseModel): The data to be updated
            type (str): The type of the data / the table name / the model class name
            pkName (str, optional): the fieldname for the Primary Key in database/storage. Defaults to 'id'.
        """

        if (self.setupDone == False): await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()
        if type == 'project':
            sql = f"UPDATE project SET
                name = '{data.name}',
                description = '{data.description}',
                crs = '{data.crs}',
                imageFilePath = '{data.imageFilePath}',
                georeferencedFilePath = '{data.georeferencedFilePath}',
                selfdestructtime = '{data.selfdestructtime}',
                lastModified = '{data.lastModified}'
                WHERE id = {data.id}"
            try:
                cur.execute(sql)
                conn.commit()
            except Exception as e:
                print(e)
                pass
            finally:
                cur.close()
                conn.close()
        if type == 'point':
            sql = f"UPDATE point SET
                projectId = '{data.projectId}',
                Idproj = '{data.Idproj}',
                lat = '{data.lat}',
                lng = '{data.lng}',
                row = '{data.row}',
                col = '{data.col}',
                error = '{data.error}',
                name = '{data.name}',
                description = '{data.description}'
                WHERE id = {data.id}"
            try:
                cur.execute(sql)
                conn.commit()
            except Exception as e:
                print(e)
                pass
            finally:
                cur.close()
                conn.close()

    async def fetchOne(self, id: int, type: str)->Union[None, dict]:
        """Fetch one data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name

        Returns:
            BaseModel: The fetched data
        """

        if (self.setupDone == False): await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()
        try:
            sql = f"SELECT * FROM {type} WHERE id = {id}"
            cur.execute(sql)
            data = cur.fetchone()
            return data._asdict()
        except Exception as e:
            print(e)
            pass
        finally:
            cur.close()
            conn.close()
    
    async def fetch(self, type: str, params: dict = {})->Union[None ,list, dict]:
        """Fetch data from storage

        Args:
            type (str): The type of the data / the table name / the model class name
            params (dict, optional): dict of additional fields [Key] to search and the value to match by [value] . Defaults to {}.

        Returns:
            list: The fetched data
        """

        if (self.setupDone == False): await self.setup()

        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()
        try:
            sql = f"SELECT * FROM {type}"
            if len(params) > 0:
                sql += " WHERE "
                for key, value in params.items():
                    sql += f"{key} = {value} AND "
                sql = sql[:-4] #remove the last AND
            cur.execute(sql)
            data = cur.fetchall()
            return data
        except Exception as e:
            print(e)
            pass
        finally:
            cur.close()
            conn.close()
        return None
    
    async def fetchAll(self, type: str) ->Union[None, list]:
        """Fetch all data from storage

        Args:
            type (str): The type of the data / the table name / the model class name

        Returns:
            None | List[dict]: The fetched data
        """

        if (self.setupDone == False): await self.setup()
        conn = psycopg2.connect(self.database_url)
        cur = conn.cursor()

        try:
            sql = f"SELECT * FROM {type}"
            cur.execute(sql)
            data = cur.fetchall()
            return data
        except Exception as e:
            print(e)
            pass
        finally:
            cur.close()
            conn.close()
        return None
    

    @staticmethod
    def getInstance():
        """Get the instance of the class

        Returns:
            PostgresSqlHandler: The instance of the class
        """
        if PostgresSqlHandler._instance is None:
            PostgresSqlHandler._instance = PostgresSqlHandler()
        return PostgresSqlHandler._instance
    


    async def createModelTable(self):
        """Create a tables for the project model & point model part of the database setup

        """
        #Crating table if not exists for project model
        project_table = """CREATE TABLE IF NOT EXISTS project(
                    id  int PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR (80) NOT NULL,
                    description TEXT,
                    crs VARCHAR (25),
                    imageFilePath VARCHAR (255),
                    georeferencedFilePath VARCHAR (255),
                    selfdestructtime TIMESTAMPTZ,
                    created TIMESTAMPTZ,
                    lastModified TIMESTAMPTZ
                );
            """
        try:
            await createTable(self.database_url, project_table)
        except Exception as e:
            print(e)
            pass #Todo: handle exception

        points_table = """CREATE TABLE IF NOT EXISTS point(
                    id INTEGER PRIMARY KEY,
                    projectId INTEGER,
                    Idproj INTEGER NOT NULL,
                    lat REAL NOT NULL,
                    lng REAL NOT NULL,
                    row INTEGER NOT NULL,
                    col INTEGER NOT NULL,
                    error REAL,
                    name VARCHAR (80),
                    description TEXT,
                    CONSTRAINT fk_project
                        FOREIGN KEY(projectId)
                            REFERENCES project(id) ON DELETE SET NULL
                );
            """
        try:
            await createTable(self.database_url, points_table)
        except Exception as e:
            print(e)
            pass #Todo: handle exception

    async def setup(self):
        """Setup the database

        """
        try:
            await createDB(self.database_url)
            await self.createModelTable()
            self.doneSetup = True
        except Exception as e:
            print(e)
            pass
    
    def __init__(self, database_url: str):
        """Constructor for the class
        """
        self.database_url = database_url

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PostgresSqlHandler, cls).__new__(cls)
            cls._instance.__init__()
        return cls._instance
