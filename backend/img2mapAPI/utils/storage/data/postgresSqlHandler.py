""" """
from typing import List, Union
import psycopg2
from pydantic import BaseModel 
from psycopg2 import sql
from img2mapAPI.utils.models.point import Point
from img2mapAPI.utils.models.project import Project
from img2mapAPI.utils.storage.data.storageHandler import StorageHandler as sh
from img2mapAPI.utils.core.helper.postgresSqlHelper import *

class PostgresSqlHandler(sh):
    """This class is the implementation of the storage handler for PostgresSql

    The class is intended to be inherited by classes that implement the storage/DB connection and overide data manipulation functions in this class.
    Intended use as a singleton class. The class is a singleton class.
    """

    _instance = None
    
    setupDone = False
    conn = None
    dnsString = None

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
        if self.dnsString is not None:
            conn = psycopg2.connect(self.dnsString, sslmode='require')
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
        
        if (self.setupDone == False): 
            await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.dnsString, sslmode='require')
        cur = conn.cursor()
        if type == 'project':
            try:
                cur.execute(
                    sql.SQL("INSERT INTO project (name, description, crs, imageFilePath, georeferencedFilePath, selfdestructtime, created, lastModified) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"),
                    (data.name, data.description, data.crs, data.imageFilePath, data.georeferencedFilePath, data.selfdestructtime, data.created, data.lastModified))
                conn.commit()
                id = cur.fetchone()[0]
                return id
            except Exception as e:
                print(e)
                pass
            finally:
                cur.close()
                conn.close()
        if type == 'point':
            try:
                cur.execute(
                    sql.SQL("INSERT INTO point (projectId, Idproj, lat, lng, row, col, error, name, description) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id"),
                    (data.projectId, data.Idproj, data.lat, data.lng, data.row, data.col, data.error, data.name, data.description))
                conn.commit()
                id = cur.fetchone()[0]
                return id
            except Exception as e:
                print(e)
                pass
            finally:
                cur.close()
                conn.close()
        return None

    async def remove(self, id: int, type: str)->None:
        """Remove data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name
        """

        if (self.setupDone == False): 
            await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.dnsString, sslmode='require')
        cur = conn.cursor()
        try:
            cur.execute(
                sql.SQL("DELETE FROM {table} WHERE id = %s").format(
                    table=sql.Identifier(type.lower())
                ),
                (id,)
            )
            conn.commit()
        except Exception as e:
            print(e)
            pass
        finally:
            cur.close()
            conn.close()
            print(f"Deleted {type} with id {id}") #Todo: log this

    async def update(self, id: int, data: BaseModel, type: str)->None:
        """Update data in storage

        Args:
            data (BaseModel): The data to be updated
            type (str): The type of the data / the table name / the model class name
            pkName (str, optional): the fieldname for the Primary Key in database/storage. Defaults to 'id'.
        """

        if (self.setupDone == False): 
            await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.dnsString, sslmode='require')
        cur = conn.cursor()
        if type == 'project':
            try:
                cur.execute(
                    sql.SQL("UPDATE project SET name = %s, description = %s, crs = %s, imageFilePath = %s, georeferencedFilePath = %s, selfdestructtime = %s, created = %s, lastModified = %s WHERE id = %s;"),
                    (data.name, data.description, data.crs, data.imageFilePath, data.georeferencedFilePath, data.selfdestructtime, data.created, data.lastModified, id)
                )
                print(f"Updated project with id {data.id}") #Todo: log this
                conn.commit()
            except Exception as e:
                print(e)
                pass
            finally:
                cur.close()
                conn.close()
        if type == 'point':
            try:
                cur.execute(
                    sql.SQL("UPDATE point SET projectId = %s, Idproj = %s, lat = %s, lng = %s, row = %s, col = %s, error = %s, name = %s, description = %s WHERE id = %s"),
                    (data.projectId, data.Idproj, data.lat, data.lng, data.row, data.col, data.error, data.name, data.description, id)
                )
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

        if (self.setupDone == False): 
            await self.setup() #make sure the database is setup
        conn = psycopg2.connect(self.dnsString, sslmode='require')
        cur = conn.cursor()
        try:
            cur.execute(
                sql.SQL("SELECT * FROM {type} WHERE {pk} = %s").format(
                    type=sql.Identifier(type.lower()),
                    pk=sql.Identifier("id")
                ),
                (id,)
            )
            data = cur.fetchone()
            #convert the data to a dictionary
            if data is not None:
                return self.convertSequenseToDict(data, type)
            return data
        except Exception as e:
            print(f"Fetch one produced: {e}") #Todo: log this
            raise e
    
    async def fetch(self, type: str, params: dict = {})->Union[None ,list, dict]:
        """Fetch data from storage

        Args:
            type (str): The type of the data / the table name / the model class name
            params (dict, optional): dict of additional fields [Key] to search and the value to match by [value] . Defaults to {}.

        Returns:
            list: The fetched data
        """

        if (self.setupDone == False):
            await self.setup()

        conn = psycopg2.connect(self.dnsString, sslmode='require')
        cur = conn.cursor()
        try:
            cur.execute(
                sql.SQL("SELECT * FROM {type} WHERE {params}").format(
                    type=sql.Identifier(type.lower()),
                    params=sql.SQL(' AND ').join(
                        sql.SQL("{key} = {value}").format(
                            key=sql.Identifier(k.lower()),
                            value=sql.Literal(v)
                        ) for k, v in params.items()
                    )
                ),
                params
            )
            test: str = '"select"'
            test.replace('"', ' ')
            data = cur.fetchall()
            if data is not None:
                return [self.convertSequenseToDict(row, type) for row in data]
            return data
        except Exception as e:
            print(e)
            raise e
    
    async def fetchAll(self, type: str) ->Union[None, list]:
        """Fetch all data from storage

        Args:
            type (str): The type of the data / the table name / the model class name

        Returns:
            None | List[dict]: The fetched data
        """

        if (self.setupDone == False): 
            await self.setup()
        conn = psycopg2.connect(self.dnsString, sslmode='require')
        cur = conn.cursor()
        try:
            cur.execute(
                sql.SQL("SELECT * FROM {type}"),
                (type.lower())
                )
            data = cur.fetchall()
            return data
        except Exception as e:
            print(e)
            raise e
        
    

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
        project_table: str = '''CREATE TABLE IF NOT EXISTS project (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR (80) NOT NULL,
                    description TEXT,
                    crs VARCHAR (25),
                    imageFilePath VARCHAR (255),
                    georeferencedFilePath VARCHAR (255),
                    selfdestructtime TIMESTAMPTZ,
                    created TIMESTAMPTZ,
                    lastModified TIMESTAMPTZ
                );
            '''
        try:
            await createTable(self.dnsString, project_table)
        except Exception as e:
            print(e)
            pass #Todo: handle exception

        points_table = '''CREATE TABLE IF NOT EXISTS point (
                    id SERIAL PRIMARY KEY,
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
            '''
        try:
            await createTable(self.dnsString, points_table)
        except Exception as e:
            print(e)
            pass #Todo: handle exception
    
    def convertSequenseToDict(self, row: tuple, type: str)->dict:
        """Convert a sequence to a dictionary

        Args:
            row (tuple): row from the database
            type (str): the type of the data / the table name / the model class name

        Returns:
            dict: the data as a dictionary
        """

        if type == 'project':
            return {
                'id': row[0],
                'name': row[1],
                'description': row[2],
                'points': [], #TODO: fix this, this is a duct tape solution
                'crs': row[3],
                'imageFilePath': row[4],
                'georeferencedFilePath': row[5],
                'selfdestructtime': row[6],
                'created': row[7],
                'lastModified': row[8]
            }
        if type == 'point':
            return {
                'id': row[0],
                'projectId': row[1],
                'Idproj': row[2],
                'lat': row[3],
                'lng': row[4],
                'row': row[5],
                'col': row[6],
                'error': row[7],
                'name': row[8],
                'description': row[9]
            }

    async def setup(self):
        """Setup the database

        """
        try:
            # await createDB(self.dnsString)
            await self.createModelTable()
            self.doneSetup = True
        except Exception as e:
            print(e)
            pass
    
    def __init__(self, dnsString: str):
        """Constructor for the class
        """
        self.dnsString = dnsString
        self.setupDone = False

    def __new__(cls, dnsString: str):
        if cls._instance is None:
            cls._instance = super(PostgresSqlHandler, cls).__new__(cls)
            cls._instance.__init__(dnsString=dnsString)
        return cls._instance
