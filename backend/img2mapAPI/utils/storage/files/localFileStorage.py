import os
import shutil
import tempfile
from .fileStorage import FileStorage
from ...core.FileHelper import clearTmpFolder
from fastapi import UploadFile

_tempPath = "./temp"
if not os.path.exists(_tempPath):
    os.makedirs(_tempPath)

# Clear files in the temp folder
clearTmpFolder()

#File storage using the local file system
class LocalFileStorage(FileStorage):
    #temp folder should be in main script folder
    _instance = None
    tempPath = _tempPath
    tempFolder = tempfile.mkdtemp(dir=_tempPath)
   
    async def saveFile(self, data: tempfile , suffix: str) -> str:
        #save the file
        #create a temp file that will be deleted when the function ends
        with tempfile.NamedTemporaryFile(dir=self.tempFolder, suffix=suffix, delete=False) as file:
            file.write(data)
            path = file.name
        return path
    async def removeFile(self, path: str):
        #remove the file
        os.remove(path)
    async def readFile(self, path: str)->bytes:
        #open the file
        with open(path, "rb") as file:
            data = file.read()
        return data
    async def fileExists(self, path: str)->bool:
        #check if the file exists
        return os.path.isfile(path)
    
    async def saveFileFromPath(self, path: str, suffix: str)->str:
        #copy the file to the temp folder
        with open(path, "rb") as file:
            data = file.read()
        return await self.saveFile(data, suffix)

    @staticmethod
    def getInstance():
        if LocalFileStorage._instance is None:
            LocalFileStorage._instance = LocalFileStorage()
        return LocalFileStorage._instance
    
    def __del__(self):
        #remove the temp folder
        try:
            os.rmdir(self.tempFolder)
        except:
            #use shutil to remove the folder if it is not empty
            shutil.rmtree(self.tempFolder)

    def __exit__(self, exc_type, exc_value, traceback):
        #remove the temp folder
        os.rmdir(self.tempFolder)
        #remove the temp folder if it is empty
        if len(os.listdir(self.tempPath)) == 0:
            os.rmdir(self.tempPath)
  
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance