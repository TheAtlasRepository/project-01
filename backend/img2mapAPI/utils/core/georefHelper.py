"""This module contains functions for georeferencing images and generating map tiles.
"""

import os 
import io 
import tempfile
import warnings
import numpy as np
import rasterio as rio 
from rasterio.transform import from_gcps 
from rasterio.control import GroundControlPoint as GCP 
from rasterio.crs import CRS 
from rasterio.enums import Resampling 
from fastapi.responses import Response 
from rio_tiler.io import Reader 
from rio_tiler.errors import TileOutsideBounds 
from PIL import Image 

#internal imports
from ..models import PointList 
from .FileHelper import getUniqeFileName, removeFile 

warnings.filterwarnings("ignore", category=rio.errors.NotGeoreferencedWarning) #ignore the not georeferenced warning

defaultCrs = 'EPSG:4326'

def createGcps(PointList : PointList):
    """Create Rasterio GCPs from a list of points

    Args:
        PointList (PointList): The list of points

    Raises:
        Exception: Not enough points to create a transform
        Exception: Points don't have Idproj

    Returns:
        List[rasterio.control.GroundControlPoint]: The list of GCPs
    """

    if len(PointList.points) < 3:
        raise Exception("Not enough points to create a transform")
    if not PointList.points[0].Idproj:
        raise Exception("Points don't have Idproj")

    gcps = []  

    for point in PointList.points:
        description = f"Point {point.Idproj} at ({point.lat}, {point.lng})"

        if point.error:
            description += f" with error {point.error}"
        if point.name:
            description += f" with name {point.name}"
        if point.description:
            description += f" with description {point.description}"

        gcps.append(
            GCP(
                row=point.row,
                col=point.col,
                x=point.lng,
                y=point.lat,
                id=point.Idproj,
                info=description
            )
        )
    return gcps

def InitialGeoreferencePngImage(tempFilePath, points: PointList, crs: str = defaultCrs)->str:
    """Georeference a PNG image with a list of points and a crs

    Args:
        tempFilePath(str): The path to the temporary file
        points(PointList): The list of points
        crs(str, optional): The crs of the image
    
    Returns:
        str: The path to the georeferenced file
    """ 

    gcps = createGcps(points) 

    filename = getUniqeFileName('.png')
    with open(filename, "wb") as file:
        file.write(open(tempFilePath, "rb").read())
    
    dataset = rio.open(tempFilePath, "r", driver="PNG")
    bands = [1, 2, 3] # I assume that you have only 3 band i.e. no alpha channel in your PNG
    data = dataset.read(bands)
    
    kwargs = {
        "driver": "GTiff",
        "width": data.shape[2], 
        "height": data.shape[1],
        "count": len(bands), 
        "dtype": data.dtype, 
        "nodata": 0,
    }
    
    path = getUniqeFileName('.tiff') 

    produced_file = rio.open(path, "w+", **kwargs)
    produced_file.write(data, indexes=bands)
    produced_file.close()
   
    dataset = rio.open(path, "r+") 
    transform = from_gcps(gcps) #Affine transformation returned from the GCPs
    dataset.transform = transform 
    dataset.crs = CRS.from_string(crs) 

    #TODO: dataset.gcps this breaks getting the bounds of the image
    # dataset.gcps = (gcps, crs) 

    overview_levels = [2, 4, 8, 16] #needed for generating the map tiles
    dataset.build_overviews(overview_levels, Resampling.nearest)
    dataset.update_tags(ns='rio_overview', resampling='nearest') 
    dataset.close()

    removeFile(filename) 
    return path

def getImageCoordinates(tiff_path):
    """
    Get the Image coordinates (longitude, latitude) of a georeferenced TIFF.

    Args:
        tiff_path: Path to the georeferenced TIFF file.

    Returns:
        [west, north, east south]: A list of corner coordinates in the order.
    """

    with rio.open(tiff_path) as dataset:
        bounds = dataset.bounds

        # get west, south, east, north coordinates
        west = bounds.left
        south = bounds.bottom
        east = bounds.right
        north = bounds.top

        return [west, north, east, south]



async def generateTile(tiff_bytes: bytes, x: int, y: int, z: int):
    """Generate a tile image from a georeferenced TIFF file.

    Args:
        tiff_bytes (bytes): TIFF file as bytes.
        x (int): column index of the tile.
        y (int): row index of the tile.
        z (int): Zoom level of the tile.

    Raises:
        e: Unhandled exception from rio-tiler.

    Returns:
        bytes: the tile image as bytes.
    """

    blank_tile = Image.new('RGBA', (256, 256), (255, 255, 255, 0))
    bytes_io = io.BytesIO()
    blank_tile.save(bytes_io, format='PNG')
    blank_tile_bytes = bytes_io.getvalue()

    temp_path = None

    MAX_ZOOM = 5
    if z < MAX_ZOOM:
        return (blank_tile_bytes, temp_path)
    try:
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(tiff_bytes)
            temp_path = temp.name
        with Reader(temp_path) as src:
                tile, mask = src.tile(x, y, z) 
                tile = np.moveaxis(tile, 0, -1)  
                mask = np.expand_dims(mask, axis=-1)  
                data = np.concatenate((tile, mask), axis=-1)
                
                img = Image.fromarray(data, 'RGBA')
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)

        return (img_byte_arr.getvalue(), temp_path)
    except TileOutsideBounds:
        return (blank_tile_bytes, temp_path)
    except Exception as e:
        print(e)
        raise e
