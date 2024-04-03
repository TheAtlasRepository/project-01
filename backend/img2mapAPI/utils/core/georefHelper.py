import os #importing os for file operations
import warnings
import rasterio as rio #importing rasterio for georeferencing
from rasterio.transform import from_gcps #importing from_gcps to create a transform from GCPs
from rasterio.control import GroundControlPoint as GCP 
from rasterio.crs import CRS #importing CRS for the default crs
from rasterio.enums import Resampling #importing Resampling for the overview levels
from ..models import PointList #importing the pointList model
from .FileHelper import getUniqeFileName, removeFile #importing the getUniqeFileName and removeFile functions from FileHelper

from fastapi.responses import Response #importing Response for the tile generation
import io #importing io for byte operations
from rio_tiler.io import Reader #importing the rio_tiler reader
from rio_tiler.errors import TileOutsideBounds #Error returned by rio_tiler when the requested tile is outside the bounds
import numpy as np #importing numpy for array operations
from PIL import Image #importing PIL for image operations

warnings.filterwarnings("ignore", category=rio.errors.NotGeoreferencedWarning) #ignore the not georeferenced warning
defaultCrs = 'EPSG:4326'

def createGcps(PointList : PointList):
    """Create Rasterio GCPs from a list of points"""
    if len(PointList.points) < 3:
        raise Exception("Not enough points to create a transform")

    # Check if points have Idproj
    if not PointList.points[0].Idproj:
        raise Exception("Points don't have Idproj")

    gcps = []  # Create the GCPs list

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
    """
    # Georeference a PNG image with a list of points and a crs
    **Arguments:**
        tempFilePath {str} -- The path to the temporary file
        points {PointList} -- The list of points
        crs {str} -- The crs of the image
    **Returns:**
        str -- The path to the georeferenced file
    """
    gcps = createGcps(points) #creating the GCPs

    #create png file in the temp folder
    filename = getUniqeFileName('.png')
    with open(filename, "wb") as file:
        file.write(open(tempFilePath, "rb").read())
    
    #Read the png file
    dataset = rio.open(tempFilePath, "r", driver="PNG")
    bands = [1, 2, 3] # I assume that you have only 3 band i.e. no alpha channel in your PNG
    data = dataset.read(bands)
    
    # set the output image kwargs
    kwargs = {
        "driver": "GTiff",
        "width": data.shape[2], 
        "height": data.shape[1],
        "count": len(bands), 
        "dtype": data.dtype, 
        "nodata": 0,
    }
    
    path = getUniqeFileName('.tiff') #filepath for the new file

    #writing the data to the new file
    produced_file = rio.open(path, "w+", **kwargs)
    produced_file.write(data, indexes=bands)
    produced_file.close()
   
    #transforming the file to a georeferenced file
    dataset = rio.open(path, "r+") #open the new file
    transform = from_gcps(gcps) #create the transform
    dataset.transform = transform #set the transform
    dataset.crs = CRS.from_string(crs) #set the crs

    #define overview levels
    #is needed for generating the map tiles
    overview_levels = [2, 4, 8, 16]
    dataset.build_overviews(overview_levels, Resampling.nearest) #build the overviews
    #update tags
    dataset.update_tags(ns='rio_overview', resampling='nearest') #update the tags

    #close the file
    dataset.close()

    removeFile(filename) #removing the temporary file
    return path

def reGeoreferencedImageTiff(innFilePath, points: PointList, crs: str = defaultCrs)->str:
    """
    Function to re-georeference a Gtiff image with a list of points and a crs
    Arguments:
        innFilePath {str} -- The path to the image file
        points {PointList} -- The list of points
        crs {str} -- The crs of the image
    Returns:
        str -- The path to the georeferenced file
    """
    #safety checks
    if not os.path.isfile(innFilePath):
        raise Exception("File not found")
    with rio.open(innFilePath, "r") as file:
        if file.count == 0:
            raise Exception("File has no data")
    
    gcps = createGcps(points) #creating the GCPs
    filename = getUniqeFileName('.tiff') #creating a working file

    #copy the file to the temp folder
    with open(filename, "wb") as file:
        file.write(open(innFilePath, "rb").read())

    #open the georeferenced file and geo-reference it
    dataset = rio.open(filename, "r+") 
    transform = from_gcps(gcps) #create the transform
    dataset.transform = transform #set the transform
    dataset.crs = CRS.from_string(crs) #set the crs

    #define overview levels
    #is needed for generating the map tiles
    overview_levels = [2, 4, 8, 16]
    dataset.build_overviews(overview_levels, Resampling.nearest) #build the overviews
    #update tags
    dataset.update_tags(ns='rio_overview', resampling='nearest') #update the tags
    dataset.close() #close the file

    return filename

def getCornerCoordinates(tiff_path):
    """
    Get the corner coordinates (longitude, latitude) of a georeferenced TIFF.

    Parameters:
    - tiff_path: Path to the georeferenced TIFF file.

    Returns:
    - A list of corner coordinates in the order: [top left, top right, bottom right, bottom left].
    """
    with rio.open(tiff_path) as dataset:
        # Get the bounds of the image
        bounds = dataset.bounds

        # Calculate corner coordinates based on the bounds
        top_left = (bounds.left, bounds.top)
        top_right = (bounds.right, bounds.top)
        bottom_right = (bounds.right, bounds.bottom)
        bottom_left = (bounds.left, bounds.bottom)

        return [top_left, top_right, bottom_right, bottom_left]

blanke_tile = Image.new('RGBA', (256, 256), (255, 255, 255, 0))
bytes_io = io.BytesIO()
blanke_tile.save(bytes_io, format='PNG')
blank_tile_bytes = bytes_io.getvalue()

async def generateTile(tiff_path, x: int, y: int, z: int):
    try:
        with Reader(tiff_path) as src:
                tile, mask = src.tile(x, y, z)
                
                # Correct the shapes
                tile = np.moveaxis(tile, 0, -1)  # Move bands to the last axis to get shape (height, width, 3)
                mask = np.expand_dims(mask, axis=-1)  # Add an axis to mask to get shape (height, width, 1)

                # Stack tile and mask arrays along the last axis
                data = np.concatenate((tile, mask), axis=-1)
                
                # Convert numpy array to PIL Image
                img = Image.fromarray(data, 'RGBA')

                # Convert PIL Image to bytes
                img_byte_arr = io.BytesIO()
                img.save(img_byte_arr, format='PNG')
                img_byte_arr.seek(0)

        return Response(content=img_byte_arr.getvalue(), media_type="image/png")
    except TileOutsideBounds:
        return Response(content=blank_tile_bytes, media_type="image/png")
    except Exception as e:
        print(e)
        raise e

