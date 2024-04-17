"""This module contains functions for georeferencing images and generating map tiles.
"""

import os 
import io 
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
    dataset.gcps = (gcps, crs)

    overview_levels = [2, 4, 8, 16] #needed for generating the map tiles
    dataset.build_overviews(overview_levels, Resampling.nearest)
    dataset.update_tags(ns='rio_overview', resampling='nearest') 
    dataset.close()

    removeFile(filename) 
    return path

def reGeoreferencedImageTiff(innFilePath, points: PointList, crs: str = defaultCrs)->str:
    """Function to re-georeference a Gtiff image with a list of points and a crs
    
    Args:
        innFilePath(str): The path to the image file
        points(PointList): The list of points
        crs(str): The crs of the image
    
    Returns:
        str: The path to the georeferenced file
    """

    if not os.path.isfile(innFilePath):
        raise Exception("File not found")
    with rio.open(innFilePath, "r") as file:
        if file.count == 0:
            raise Exception("File has no data")
    
    gcps = createGcps(points) 
    filename = getUniqeFileName('.tiff') 

    with open(filename, "wb") as file:
        file.write(open(innFilePath, "rb").read())

    dataset = rio.open(filename, "r+") 
    transform = from_gcps(gcps) #Affine transformation returned from the GCPs
    dataset.transform = transform 
    dataset.crs = CRS.from_string(crs) 

    overview_levels = [2, 4, 8, 16] #needed for generating the map tiles
    dataset.build_overviews(overview_levels, Resampling.nearest) 
    dataset.update_tags(ns='rio_overview', resampling='nearest')
    dataset.close()
    return filename

def getCornerCoordinates(tiff_path):
    """Get the corner coordinates (longitude, latitude) of a georeferenced TIFF.

    Args:
        tiff_path: Path to the georeferenced TIFF file.

    Returns:
        [top left, top right, bottom right, bottom left]: A list of corner coordinates in the order.
    """

    with rio.open(tiff_path) as dataset:
        bounds = dataset.bounds

        top_left = (bounds.left, bounds.top)
        top_right = (bounds.right, bounds.top)
        bottom_right = (bounds.right, bounds.bottom)
        bottom_left = (bounds.left, bounds.bottom)

        return [top_left, top_right, bottom_right, bottom_left]

async def generateTile(tiff_path, x: int, y: int, z: int):
    """Generate a tile image from a georeferenced TIFF file.

    Args:
        tiff_path (str): Path to the georeferenced TIFF file.
        x (int): X coordinate of the tile.
        y (int): Y coordinate of the tile.
        z (int): Zoom level of the tile.

    Raises:
        e: Unhandled exception from rio-tiler.

    Returns:
        Respone: A FastAPI Response object containing the tile image as PNG bytes.
    """

    blanke_tile = Image.new('RGBA', (256, 256), (255, 255, 255, 0))
    bytes_io = io.BytesIO()
    blanke_tile.save(bytes_io, format='PNG')
    blank_tile_bytes = bytes_io.getvalue()

    MAX_ZOOM = 5
    if z < MAX_ZOOM:
        return Response(content=blank_tile_bytes, media_type="image/png")
    try:
        with Reader(tiff_path) as src:
                tile, mask = src.tile(x, y, z) 
                tile = np.moveaxis(tile, 0, -1)  
                mask = np.expand_dims(mask, axis=-1)  
                data = np.concatenate((tile, mask), axis=-1)
                
                img = Image.fromarray(data, 'RGBA')
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)
        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    except TileOutsideBounds:
        return Response(content=blank_tile_bytes, media_type="image/png")
    except Exception as e:
        print(e)
        raise e
