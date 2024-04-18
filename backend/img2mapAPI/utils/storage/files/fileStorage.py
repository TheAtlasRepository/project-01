#Abstract class for file storage
from abc import ABC, abstractmethod
import tempfile

class FileStorage(ABC):
    """ This class is the abstract base class for file storage.

    The class is intended to be inherited by classes that implement the file storage and override file manipulation functions in this class.
    Intended use as a singleton class. The class is a singleton class.

    Abstarct functions:
        saveFile: Save a file to storage
        removeFile: Remove a file from storage
        readFile: Read a file from storage
        fileExists: Check if a file exists in storage
        saveFileFromPath: Save a file to storage from a path 
    """

    _instance = None

    @abstractmethod
    async def saveFile(self, data: tempfile, suffix: str)->str:
        """Save a file to storageSolution

        Args:
            data (tempfile): The file data
            suffix (str): The file suffix / (file extension) / file type

        Returns:
            str: The path to the saved file / identifier for the saved file / uuid for the saved file
        """
        pass
    
    @abstractmethod
    async def removeFile(self, path: str):
        """Remove a file from storage

        Args:
            path (str): The path to the file / identifier for the file / uuid for the file
        """
        pass

    @abstractmethod
    async def readFile(self, path: str)->bytes:
        """Read a file from storage

        Args:
            path (str): The path to the file / identifier for the file / uuid for the file

        Returns:
            bytes: The file data
        """
        pass

    @abstractmethod
    async def fileExists(self, path: str)->bool:
        """Check if a file exists in storage

        Args:
            path (str): The path to the file / identifier for the file / uuid for the file

        Returns:
            bool: True if the file exists, False if the file does not exist
        """
        pass
    
    @abstractmethod
    async def saveFileFromPath(self, path: str, suffix: str)->str:
        """Save a file to storage from a path

        Args:
            path (str): The path to the file to be saved
            suffix (str): The file suffix / (file extension) / file type

        Returns:
            str: The path to the saved file / identifier for the saved file / uuid for the saved file
        """
        pass
