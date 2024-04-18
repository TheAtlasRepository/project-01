from typing import List
from .point import Point
from pydantic import BaseModel

class PointList( BaseModel):
    """PointList model

    Attributes:
        points (List[Point]): The list of points
    """
    points: List[Point] = []
    
    def __init__(self, **data):
        super().__init__(**data)
        self.points = data.get('points') if data.get('points') is not None else []
