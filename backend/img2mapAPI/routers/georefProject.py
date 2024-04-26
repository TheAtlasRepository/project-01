""" This module contains the API Router with endpoints for the georeferencing project

The module contains the following endpoints:
    - Create a project
    - Update a project
    - Delete a project
    - Get a project
    - Add a point to a project
    - Update a point in a project
    - Delete all points from a project
    - Delete a point from a project
    - Get all points of a project
    - Get a point in a project by id
    - Upload an image to a project
    - Get the image of a project by id
    - Georeference the image of a project by id
    - Get the georeferenced image of a project by id
    - Get the bounding coordinates of the image of a project by id
"""

import os
import io
from typing import List
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, Response, StreamingResponse
#internal imports:
from ..utils.models.point import Point
from ..utils.models.project import Project
from ..utils.projectHandler import ProjectHandler
from ..utils.core.georefHelper import generateTile
from ..utils.core.FileHelper import removeFile
from ..utils.storage.files.fileStorage import FileStorage
from ..utils.storage.files.localFileStorage import LocalFileStorage
from ..utils.storage.files.s3FileStorage import S3FileStorage
from ..utils.storage.data.storageHandler import StorageHandler
from ..utils.storage.data.sqliteLocalStorage import SQLiteStorage
from ..utils.storage.data.postgresSqlHandler import PostgresSqlHandler

router = APIRouter(
    prefix="/project",
    tags=["Georeferencing Project"],
)

#createing the connection url for the database based on localhost
database_url = None
dnsString = None

_StorageHandler: StorageHandler = SQLiteStorage('georefProjects.sqlite3') #need to be a .sqlite3 file

# DATABASE_URL is the default environment variable for Heroku Postgres
if 'DATABASE_URL' in os.environ:
    database_url = os.environ['DATABASE_URL']
    dnsString = database_url
    _StorageHandler: StorageHandler = PostgresSqlHandler(dnsString)
    print("Using PostgresSQL database")
else:
    print("Using SQLite database")
#TODO: Add a dependency class to handle errors and return the correct status code

# Default to local file storage
_Filestorage: FileStorage = LocalFileStorage()

# Decide which file storage to use based on environment variable
if os.environ['STORAGE_TYPE'] == 'aws':
    _Filestorage: FileStorage = S3FileStorage(os.environ['AWS_BUCKET_NAME'], os.environ['AWS_REGION_NAME'], os.environ['AWS_ACCESS_KEY_ID'], os.environ['AWS_SECRET_ACCESS_KEY'])
    print("Using AWS S3 file storage")
elif os.environ['STORAGE_TYPE'] == 'bucketeer-s3':
    _Filestorage: FileStorage = S3FileStorage(os.environ['BUCKETEER_BUCKET_NAME'],os.environ['BUCKETEER_AWS_REGION'],os.environ['BUCKETEER_AWS_ACCESS_KEY_ID'],os.environ['BUCKETEER_AWS_SECRET_ACCESS_KEY'])
    print("Using AWS S3 file storage through Bucketeer")
elif os.environ['STORAGE_TYPE'] == 'local':
    #This seems a bit redundant, but it is to explicitly state that local storage has been chosen
    print("Using local file storage")
else:
    print("Defaulting to using local file storage")

_projectHandler = ProjectHandler(_Filestorage, _StorageHandler)



@router.post("/")
async def createProject(project: Project):
    """Create a new project and return the id of the project
    - only the name is required, the rest of the attributes are optional
    """
    try:
        id = await _projectHandler.createProject(project)
        return {"id": id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Project could not be created: {str(e)}')

@router.put("/{projectId}")
async def updateProject(projectId: int, project: Project):
    """Update the project details and return the id of the project"""
    try:
        if await _projectHandler.updateProject(projectId, project): return {"ProjectID": projectId}
        else: raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{projectId}")
async def deleteProject(projectId: int, backgroundTasks: BackgroundTasks):
    """Delete a project and return a message if the project was deleted successfully"""
    try:
        backgroundTasks.add_task(_projectHandler.deleteProject, projectId)
        backgroundTasks.is_async = True
        return Response(content="Deletion request of project accepted", status_code=202, media_type="text/plain", background=backgroundTasks)
    except Exception as e:
        if e.status_code == 500:
            raise HTTPException(status_code=500, detail=str(e))
        pass

@router.get("/{projectId}")
async def getProject(projectId: int):
    """Get a project by id"""
    try:
        project = await _projectHandler.getProject(projectId)
        return project
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{projectId}/point")
async def addPoint(projectId: int, innpoint: Point):
    """ Add a point to a project and return the id of the project, id of the point, and id of the point in relation to the project"""
    try:
        (PointID, Dbid) = await _projectHandler.addPoint(projectId, innpoint)
        return {"Project":{"id": projectId},"Point":{"id": Dbid,"inProjectId": PointID}}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/{projectId}/point/{pointId}")
async def updatePoint(projectId: int, pointId: int, point: Point):
    """ Update a point in a project and returns ids of the project and the point to show that the point was updated"""
    try:
        if await _projectHandler.updatePoint(projectId, pointId, point):
            return {"Project":{"id": projectId},"Point":{"id": pointId}}
        else:
            raise HTTPException(status_code=404, detail="Point not found")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{projectId}/point")
async def deletePoints(projectId: int, backgroundTasks: BackgroundTasks):
    """Delete all points from a project and return success message if the deletion was successful"""
    try:
        backgroundTasks.add_task(_projectHandler.removeAllProjectPoints, projectId)
        return Response(content="Deletion request of points accepted", status_code=202, media_type="text/plain", background=backgroundTasks)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{projectId}/point/{pointId}")
async def deletePoint(projectId: int, pointId: int, backgroundTasks: BackgroundTasks):
    """ Delete a point from a project returns action status if the deletion was successful"""
    try:
        backgroundTasks.add_task(_projectHandler.removePoint, projectId, pointId)
        return Response(content="Deletion request of point accepted", status_code=202, media_type="text/plain", background=backgroundTasks)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{projectId}/point")
async def getPoints(projectId: int):
    """ Get all points of a project by project id"""
    try:
        points: List[Point] = await _projectHandler.getProjectPoints(projectId)
        return points
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{projectId}/point/{pointId}")
async def getPoint(projectId: int, pointId: int):
    """ Get a point in a project by project ID and point ID related to the project, returns the point if found"""
    try:
        point = await _projectHandler.getPoint(projectId, pointId)
        return point
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/{projectId}/image")
async def uploadImage(projectId: int, file: UploadFile = File(...)):
    """ Upload an image to a project by project id, returns a message if the image was uploaded successfully"""
    try:
        tempFile = await file.read()
        await _projectHandler.saveImageFile(projectId, tempFile, file.content_type)
        return {"status": "Image uploaded"}
    except Exception as e:
        #check if e has a status code attribute
        if hasattr(e, "status_code"):
            raise HTTPException(status_code=e.status_code, detail=str(e))
        else:
            raise HTTPException(status_code=500, detail=str(e))

@router.get("/{projectId}/image")
async def getImage(projectId: int):
    """Get the image of a project by project id, returns the image file if found"""
    try:
        imagepath = await _projectHandler.getImageFilePath(projectId)
        mediaType = "image/png"
        return FileResponse(imagepath, media_type=mediaType)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/{projectId}/georef")
async def InitalgeorefImage(projectId: int, crs: str = None):
    """ Georeference the image of a project by project id, returns the georeferenced image file if found"""
    try:
        await _projectHandler.georefPNGImage(projectId, crs)
        imageBytes = await _projectHandler.getGeoreferencedFile(projectId)
        return StreamingResponse(io.BytesIO(imageBytes), media_type="image/tiff", headers={"Content-Disposition": "attachment; filename=georeferenced.tiff"})
        #return FileResponse(imagepath, media_type="image/tiff", filename="georeferenced.tiff")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{projectId}/image/geo")
async def getGeorefImage(projectId: int):
    """Get the georeferenced image of a project by id, returns the georeferenced image file if found"""
    try:
        imagepath = await _projectHandler.getGeoreferencedFilePath(projectId)
        return FileResponse(imagepath, media_type="image/tiff", filename="georeferenced.tiff")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

   
@router.get("/{projectId}/georef/coordinates")
async def getImageCoordinates(projectId: int):
    """ Get the image coordinates of the image of a project by id, returns the image coordinates if found in format [west, north, east, south]"""
    try:
        imageCoordinates = await _projectHandler.getImageCoordinates(projectId)
        return imageCoordinates
    except Exception as e:
        print(e)
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{projectId}/tiles/{z}/{x}/{y}.png")
async def getTile(projectId: int, z: int, x: int, y: int, backgroundTasks: BackgroundTasks):
    """ Retrieve a tile from the georeferenced image of a project by project id, zoom level, x, and y coordinates, returns the tile if found"""
    try:
        tiff_data = await _projectHandler.getGeoreferencedFile(projectId)
        (tile_bytes, temp_path) = await generateTile(tiff_data, x, y, z)
        backgroundTasks.add_task(removeFile, temp_path)
        return Response(content=tile_bytes, media_type="image/png")
    except Exception as e:
        # Handle unexpected errors
        return Response(status_code=500, content=f"An unexpected error occurred: {str(e)}")
