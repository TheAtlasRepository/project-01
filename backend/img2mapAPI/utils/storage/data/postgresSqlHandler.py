""" """
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

    conn = None

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
        return 0

    async def remove(self, id: int, type: str)->None:
        """Remove data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name
        """
        pass

    async def update(self, data: BaseModel, type: str, pkName:str = 'id')->None:
        """Update data in storage

        Args:
            data (BaseModel): The data to be updated
            type (str): The type of the data / the table name / the model class name
            pkName (str, optional): the fieldname for the Primary Key in database/storage. Defaults to 'id'.
        """
        pass

    async def fetchOne(self, id: int, type: str)->BaseModel:
        """Fetch one data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name

        Returns:
            BaseModel: The fetched data
        """
        return BaseModel
    
    @staticmethod
    def getInstance():
        """Get the instance of the class

        Returns:
            PostgresSqlHandler: The instance of the class
        """
        if PostgresSqlHandler._instance is None:
            PostgresSqlHandler._instance = PostgresSqlHandler()
        return PostgresSqlHandler._instance
    
    def __init__(self, database_url: str = None):
        """Constructor for the class
        """
        #first check if  the connection is healthy
        try:
            self.conn = self.connect(
                db=DATABASE,
                user=USER,
                password=PASSWORD,
                host=HOST,
                port=PORT
            )
        except Exception as e:

        pass
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PostgresSqlHandler, cls).__new__(cls)
            cls._instance.__init__()
        return cls._instance
