import os
import shutil
import tempfile
from .fileStorage import FileStorage
from ...core.FileHelper import clearTmpFolder

_tempPath = "./temp"
if not os.path.exists(_tempPath):
    os.makedirs(_tempPath)

clearTmpFolder()


class LocalFileStorage(FileStorage):
    """ This class is the file storage implementation for local storage.

    The class implements the file manipulation functions in the abstract base class FileStorage

    Functions:
        saveFile: Save a file to local storage
        removeFile: Remove a file from local storage
        readFile: Read a file from local storage
        fileExists: Check if a file exists in local storage
        saveFileFromPath: Save a file to local storage from a path
        getInstance: Get the instance of the class

    Attributes:
        tempPath: The path to the temp folder
        tempFolder: The path to the temp folder 
    """

    _instance = None
    tempPath = _tempPath
    tempFolder = tempfile.mkdtemp(dir=_tempPath)
   
    async def saveFile(self, data: tempfile , suffix: str) -> str:
        with tempfile.NamedTemporaryFile(dir=self.tempFolder, suffix=suffix, delete=False) as file:
            file.write(data)
            path = file.name
        return path
    
    async def removeFile(self, path: str):
        os.remove(path)
    
    async def readFile(self, path: str)->bytes:
        with open(path, "rb") as file:
            data = file.read()
        return data
    
    async def fileExists(self, path: str)->bool:
        return os.path.isfile(path)
    
    async def saveFileFromPath(self, path: str, suffix: str)->str:
        with open(path, "rb") as file:
            data = file.read()
        return await self.saveFile(data, suffix)

    @staticmethod
    def getInstance():
        """Get the instance of the class
        """
        
        if LocalFileStorage._instance is None:
            LocalFileStorage._instance = LocalFileStorage()
        return LocalFileStorage._instance
    
    def __del__(self):
        try:
            os.rmdir(self.tempFolder)
        except:
            shutil.rmtree(self.tempFolder)

    def __exit__(self, exc_type, exc_value, traceback):
        os.rmdir(self.tempFolder)
        if len(os.listdir(self.tempPath)) == 0:
            os.rmdir(self.tempPath)
  
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance