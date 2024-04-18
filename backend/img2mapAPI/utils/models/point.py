from typing import Union, Optional
from pydantic import BaseModel

class Point(BaseModel):
     """Point model

     Attributes:
           lat (float): The latitude of the point
           lng (float): The longitude of the point
           col (int): The column of the point
           row (int): The row of the point
           error (Union[None, float]): The error of the point
           id (Union[int,None]): The id of the point in the database
           name (Optional[str]): The name of the point
           description (Optional[str]): The description of the point
           projectId (Optional[int]): The id of the project
           Idproj (Union[int,None]): The id of the point in the project
     """
     lat: float
     lng: float
     col: int
     row: int
     error: Union[None, float] = None
     id: Union[int,None] = None # id of the point in the database
     name: Optional[str] = None
     description: Optional[str] = None
     projectId: Optional[int] = None
     Idproj: Union[int,None] = None # id of the point in the project
     
     def __init__(self, **data):
          super().__init__(**data)
          self.lat = data.get('lat') if data.get('lat') is not None else 0
          self.lng = data.get('lng') if data.get('lng') is not None else 0
          self.col = data.get('col') if data.get('col') is not None else 0
          self.row = data.get('row') if data.get('row') is not None else 0
          self.error = data.get('error') if data.get('error') is not None else None
          self.id = data.get('id') if data.get('id') is not None else None
          self.name = data.get('name') if data.get('name') is not None else None
          self.description = data.get('description') if data.get('description') is not None else None
          self.projectId = data.get('projectId') if data.get('projectId') is not None else None
          self.Idproj = data.get('Idproj') if data.get('Idproj') is not None else None

     
     