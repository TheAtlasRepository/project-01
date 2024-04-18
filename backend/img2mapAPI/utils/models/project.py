from typing import Optional, Union
from pydantic import BaseModel
from .pointList import PointList
import datetime

class Project(BaseModel):
    """Project model

    Attributes:
        id (int): The id of the project
        name (str): The name of the project
        description (Optional[str]): The description of the project
        points (Union[PointList, None]): The list of points
        crs (Union[str, None]): The crs of the project
        imageFilePath (Union[str, None]): The path to the image file
        georeferencedFilePath (Union[str, None]): The path to the georeferenced file
        selfdestructtime (Union[str, None]): The self destruct time of the project
        created (Union[str, None]): The creation time of the project
        lastModified (Union[str, None]): The last modification time of the project
    """
    id: int = None
    name: str
    description: Optional[str] = None
    points: Union[PointList, None] = None
    crs: Union[str, None] = None
    imageFilePath: Union[str, None] = None
    georeferencedFilePath: Union[str, None] = None
    selfdestructtime: Union[str, None] = None
    created: Union[str, None] = None
    lastModified: Union[str, None] = None
    
    def __init__(self, **data):
        super().__init__(**data)
        self.points = data.get('points') if data.get('points') is not None else PointList()
        self.imageFilePath = data.get('imageFilePath') if data.get('imageFilePath') is not None else None
        self.georeferencedFilePath = data.get('georeferencedFilePath') if data.get('georeferencedFilePath') is not None else None
        self.crs = data.get('crs') if data.get('crs') is not None else None
        self.selfdestructtime = data.get('selfdestructtime') if data.get('selfdestructtime') is not None else None
        self.created = data.get('created') if data.get('created') is not None else datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.lastModified = data.get('lastModified') if data.get('lastModified') is not None else datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.id = data.get('id') if data.get('id') is not None else None
        self.name = data.get('name') if data.get('name') is not None else ''
        self.description = data.get('description') if data.get('description') is not None else None
            
    