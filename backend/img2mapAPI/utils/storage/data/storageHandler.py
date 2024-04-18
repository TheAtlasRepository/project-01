""" This module contains the abstract base class for moving data to and from the storage/Database
"""

from abc import ABC, abstractmethod
from typing import List, Union
from pydantic import BaseModel

class StorageHandler(ABC):
    """This class is the abstract base class for moving data to and from the storage/Database.

    The class is intended to be inherited by classes that implement the storage/DB connection and overide data manipulation functions in this class.
    Intended use as a singleton class. The class is a singleton class.
    
    Abstarct functions:
        connect: Connect to the storage
        saveInStorage: Save data to storage
        remove: Remove data from storage
        update: Update data in storage
        fetchOne: Fetch one data from storage
        fetch: Fetch data from storage
        fetchAll: Fetch all data from storage
    """

    _instance = None

    #abstract methods
    @abstractmethod
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
        pass

    @abstractmethod
    async def saveInStorage(self, data: BaseModel, type: str, pkName:str = 'id')->int:
        """Save data to storage

        Args:
            data (BaseModel): The data to be saved
            type (str): The type of the data / the table name / the model class name
            pkName (str, optional): the fieldname for the Primary Key in database/storage. Defaults to 'id'.

        Returns:
            int: The id of the saved data from the storage
        """
        pass

    @abstractmethod
    async def remove(self, id: int, type: str)->None:
        """Remove data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name
        """
        pass

    @abstractmethod
    async def update(self, id: int, data: BaseModel, type: str)->None:
        """Update data in storage

        Args:
            id (int): The id of the data
            data (BaseModel): The data to be updated
            type (str): The type of the data / the table name / the model class name
        """
        pass
    
    @abstractmethod
    async def fetchOne(self, id: int, type: str) -> Union[None, dict]:
        """Fetch one "Row" of data from storage

        Args:
            id (int): The id of the data
            type (str): The type of the data / the table name / the model class name

        Returns:
            Union[None, dict]: The data fetched from the storage. None if no data is found or an error occured.
        """
        pass

    @abstractmethod
    async def fetch(self, type: str, params: dict = {})->Union[None ,List[dict], dict]:
        """Fetch data from storage

        Args:
            type (str): The type of the data / the table name / the model class name
            params (dict, optional): dict of additional fields [Key] to search and the value to match by [value] . Defaults to {}.

        Returns:
            Union[None ,List[dict], dict]: _description_
        """
        pass

    @abstractmethod
    async def fetchAll(self, type: str)->Union[None, List[dict]]:
        """Fetch all data from storage

        Args:
            type (str): The type of the data / the table name / the model class name

        Returns:
            Union[None, List[dict]]: The data fetched from the storage. None if no data is found or an error occured.
        """
        pass