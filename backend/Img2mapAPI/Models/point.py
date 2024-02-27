from pydantic import BaseModel
from typing import Union


class Point(BaseModel):
     lat: float
     lng: float
     col: int
     row: int
     error: Union[None, float] = None
     id: Union[int,None] = None
     name: str

