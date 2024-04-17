# This is the project handler file. It contains the functions to handle the project data.
# The functions in this file are used to create, update, delete and get projects and points.
# The project data is stored in a list in the router file.

# Importing the required modules
import tempfile
from typing import List
from img2mapAPI.utils.models import Project, Point
from img2mapAPI.utils.models.pointList import PointList
from .storage.files.fileStorage import FileStorage
from .storage.data.storageHandler import StorageHandler
from .core import georefHelper as georef
import datetime

class ProjectHandler:
    _FileStorage: FileStorage = None
    _StorageHandler: StorageHandler = None

    def __init__(self, FileS: FileStorage, SHandler: StorageHandler):
        self._FileStorage = FileS
        self._StorageHandler = SHandler
    
    # Function to create a project
    async def createProject(self, project: Project) -> int:
        #clear or set the needed fields
        project.id = None
        project.imageFilePath = ""
        project.georeferencedFilePath = ""
        project.selfdestructtime = None #TODO: add self destruct time logic
        project.created = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        project.lastModified = None
        project.points = None
        ID = await self._StorageHandler.saveInStorage(project, "project")
        return ID
    
    # Function to update a project
    async def updateProject(self, projectId: int, project: Project) -> bool:
        fetchedProject: dict = await self._StorageHandler.fetchOne(projectId, "project")
        if fetchedProject is None:
            raise Exception("Project not found")
        #check fields that are not allowed to be updated
        fetchedProject= Project.model_construct(_fields_set=None, **fetchedProject)
        project.id = projectId
        Created = None
        try:
            Created = fetchedProject.created
        except:
            raise Exception("fetchOne did not return a project object")
        try:
            project.created = Created
        except:
            raise Exception("api object did not return a project object")
        project.lastModified = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        #compare the fetched project with the updated project and update allowed fields, points and image files are sent to other functions to be handled
        innProject: dict = dict(project)
        fetchedProjectDict: dict = dict(fetchedProject)
        specialFields = ["id", "created", "lastModified", "points"]
        for key in fetchedProjectDict:
            if key in innProject:
                #check if key of points exists
                if key == "points":
                    if project.points is not None or project.points != [] :
                        #Todo: fiks the error on updatePoints, removed for now, just cant update points atm
                      #  await self.updatePoints(projectId, project.points.points)
                        pass
                #cheking special fields
                elif key not in specialFields:
                    if fetchedProjectDict[key] != innProject[key]:
                        fetchedProjectDict[key] = innProject[key]
        fetchedProject: Project = Project.model_construct(None, **fetchedProjectDict)
        #update the project in the storage
        await self._StorageHandler.update(projectId, fetchedProject, "project")
        return True
 
    # Function to delete a project
    async def deleteProject(self, projectId: int) -> None:
        #find the project and remove it
        project = await self._StorageHandler.fetchOne(projectId, "project")

        if project is None:
            raise Exception("Project not found")
        #remove the image and georeferenced files
        if project["imageFilePath"] != "":
            await self._FileStorage.removeFile(project["imageFilePath"])
        if project["georeferencedFilePath"] != "":
            await self._FileStorage.removeFile(project["georeferencedFilePath"])
        
        #delete project points
        points = await self._StorageHandler.fetch("point", {"projectId": projectId})
        for point in points:
            await self._StorageHandler.remove(point["id"], "point")
        #remove the project
        await self._StorageHandler.remove(projectId, "project")
    
    # Function to get a project by id
    async def getProject(self, projectId: int) -> Project:
        #Convert the data to a project object
        project = await self._StorageHandler.fetchOne(projectId, "project")
        project : Project = Project.model_construct(None, **project)
        if project is None:
            raise Exception("Project not found")
        #check for project points
        try:
            points = await self.getProjectPoints(projectId)
        except:
            points = []
        #make pointlist object and add the points to the project
        pointList = PointList()
        for point in points:
            pointList.points.append(point)
        project.points = pointList

        return project
    

    async def projectExists(self, projectId: int) -> bool:
        project = await self._StorageHandler.fetchOne(projectId, "project")
        if project is None or project == {}:
            return False
        return True

    ### Points

    async def getProjectPoints(self, projectId: int) -> List[Point]:
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        #Convert the data to a list of point objects
        params: dict = {"projectId": projectId}
        Points = await self._StorageHandler.fetch("point", params)
        if Points is None:
            raise Exception("No points found")
        list: List[Point] = [Point.model_construct(None ,**point) for point in Points]
        if len(list) == 0:
            raise Exception("points is empty")
        return list
    
    async def getPoint(self, projectId: int, pointId: int, byDBID:bool = False) -> Point:
        #Convert the data to a point object
        #search by Idproj
        if byDBID == True:
            point = await self._StorageHandler.fetchOne(pointId, "point")
            if point is None:
                raise Exception("Point not found")
            return Point.model_construct(None, **point)
        
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        point = None
        params: dict = {"Idproj": pointId, "projectId": projectId}
        points = await self._StorageHandler.fetch("point", params)
        if points is None or points == []:
            raise Exception("No points found")
        else:
            point = points[0]
            point = Point.model_construct(None, **point)
        if point is None:
            ret = str(points)
            raise Exception(f"Point not found: {ret}")
        return point

    async def removeAllProjectPoints(self, projectId: int) -> bool:
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        params: dict = {"projectId": projectId}
        points = await self._StorageHandler.fetch("point", params)
        if points is not None and points != []:
            for point in points:
                await self._StorageHandler.remove(point["id"], "point")
            return True
        raise Exception("No points found for this project")

    async def removePoint(self, projectId: int, pointId: int) -> bool:
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        params: dict = {"projectId": projectId, "Idproj": pointId}
        points = await self._StorageHandler.fetch("point", params)
        if points is not None and points != []:
            await self._StorageHandler.remove(points[0]["id"], "point")
            return True
        raise Exception("Point not found")

    async def addPoint(self, projectId: int, point: Point) -> int: 
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        list: List[Point] = []
        list.append(point)
        if self.validatepoints(list) == False: 
            raise Exception("Invalid point")
        #set the projectId of the point
        point.projectId = projectId
        point.id = None
        point.error = None
        #find the next idproj = 1
        points = await self._StorageHandler.fetch("point", {"projectId": projectId}) #format: List[dict] [{pointdict},{pointdict},{pointdict}]
        if points is None or points == []:
            point.Idproj = 1
        else:
            point.Idproj = 1
            ids = [p["Idproj"] for p in points]  # List of IDs taken from the database
            while point.Idproj in ids:
                point.Idproj += 1
        
        #save the point to storage
        dbid = await self._StorageHandler.saveInStorage(point, "point", "id")
        if dbid is None:
            raise Exception("Failed to save point")
        return (point.Idproj, dbid)

    async def updatePoint(self, projectId: int, pointId: int, point: Point) -> bool:
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        if self.validatepoints([point]) == False:
            raise Exception("Invalid point")
        
        #find the point and update it
        params: dict = {"projectId": projectId, "Idproj": pointId}
        fetchedPointDict = await self._StorageHandler.fetch("point", params)
        if fetchedPointDict is None:
            raise Exception("Point not found")
        fetchedPointDict = fetchedPointDict[0]
        #crate a point object
        updatedPoint: Point = Point.model_construct(None, **fetchedPointDict)
        #update data point object based on the new point object
        updatedPoint.lat = point.lat
        updatedPoint.lng = point.lng
        updatedPoint.col = point.col
        updatedPoint.row = point.row
        updatedPoint.error = point.error
        updatedPoint.name = point.name
        updatedPoint.description = point.description

        newpoint : Point = updatedPoint
        dbid = fetchedPointDict["id"]
        #update the point in the storage
        await self._StorageHandler.update(dbid, newpoint, "point")

        return True

    def validatepoints(self, points: List[Point]) -> bool:
        #check if the points are valid
        for point in points:
            #check if point is a point object
            if isinstance(point, Point) == False:
                try:
                    point = Point.model_construct(None, **point)
                    if point is None:
                        raise Exception("Invalid point object")
                except:
                    raise Exception("Invalid point object")
            #check if point has the required attributes
            if hasattr(point, "lat") == False or hasattr(point, "lng") == False or hasattr(point, "col") == False or hasattr(point, "row") == False:
                raise Exception("Failed to validate points attributes")
                #return False
            if point.lat is None or point.lng is None or point.col is None or point.row is None:
                return False
            
        return True
    
    ### Files
    async def getImageFile(self, projectId: int) -> bytes:
        #get the image file path
        project = await self._StorageHandler.fetchOne(projectId, "project")
        filePath = project["imageFilePath"]
        #get the image file
        file = await self._FileStorage.get(filePath)
        if file is None:
            raise Exception("File not found")
        return file
    
    async def getImageFilePath(self, projectId: int) -> str:
        project = await self._StorageHandler.fetchOne(projectId, "project")
        return project["imageFilePath"]
    
    async def saveImageFile(self, projectId: int, file: tempfile, fileType: str) -> None:
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        #only accept png
        if fileType.find("png") == -1:
            raise Exception(status_code=415, description="Invalid file type")
        
        #fetch the project
        project = await self._StorageHandler.fetchOne(projectId, "project")

        #check if the project already has an image file, and remove it
        if "imageFilePath" in project and project["imageFilePath"]:
            await self._FileStorage.removeFile(project["imageFilePath"])

        #save the new image file
        filePath = await self._FileStorage.saveFile(file, ".png")

        #update the project with the file path
        project["imageFilePath"] = filePath
        await self._StorageHandler.update(projectId, project, "project")

    async def removeImageFile(self, projectId: int) -> None:
        #remove the image file
        project = await self._StorageHandler.fetchOne(projectId, "project")
        await self._FileStorage.remove(project["imageFilePath"])
        #update the project with an empty file path
        project["imageFilePath"] = ""
        await self._StorageHandler.update(projectId, project, "project")
    
    async def getGeoreferencedFile(self, projectId: int) -> bytes:
        #get the georeferenced file path
        project = await self._StorageHandler.fetchOne(projectId, "project")
        filePath = project["georeferencedFilePath"]
        #get the georeferenced file
        file = await self._FileStorage.get(filePath)
        if file is None:
            raise Exception("File not found")
        return file

    async def getGeoreferencedFilePath(self, projectId: int) -> str:
        project = await self._StorageHandler.fetchOne(projectId, "project")
        return project["georeferencedFilePath"]
          
    async def saveGeoreferencedFile(self, projectId: int, file: bytes, fileType: str) -> None:
        #only accept tiff
        if fileType.find("tiff") == -1:
            raise Exception("Invalid file type")
        
        #fetch the project
        project = await self._StorageHandler.fetchOne(projectId, "project")

        #check if the project already has an image file, and remove it
        if "georeferencedFilePath" in project and project["georeferencedFilePath"]:
            await self.removeGeoreferencedFile(projectId)

        #save the georeferenced file
        filePath = await self._FileStorage.saveFile(file, ".tiff")

        #update the project with the file path
        project["georeferencedFilePath"] = filePath
        await self._StorageHandler.update(projectId, project, "project")

    async def removeGeoreferencedFile(self, projectId: int) -> None:
        #remove the georeferenced file
        project = await self._StorageHandler.fetchOne(projectId, "project")
        await self._FileStorage.removeFile(project["georeferencedFilePath"])
        #update the project with an empty file path
        project["georeferencedFilePath"] = ""
        await self._StorageHandler.update(projectId, project, "project")
    
    ### Georeferencing
 
    async def georefPNGImage(self, projectId: int, crs: str = None) -> None:
        #get the image file path
        project = await self.getProject(projectId)
        imageFilePath = project.imageFilePath
        points : PointList = project.points
        #georeference the image
        georeferencedImage = None
        if crs is None:
            georeferencedImage = georef.InitialGeoreferencePngImage(imageFilePath, points) #goreference the image, return the path to the georeferenced file
        else:
            georeferencedImage = georef.InitialGeoreferencePngImage(imageFilePath, points, crs) #goreference the image, return the path to the georeferenced file
        if georeferencedImage is None:
            raise Exception("Image could not be georeferenced")
        
        # Read the georeferenced image into bytes
        georeferencedImageBytes = await self._FileStorage.readFile(georeferencedImage)

        # Remove the temporary file
        await self._FileStorage.removeFile(georeferencedImage)

        # Save the georeferenced image
        await self.saveGeoreferencedFile(projectId, georeferencedImageBytes, "tiff")
      
    async def getCornerCoordinates(self, projectId: int):
        #get the image file path
        project = await self.getProject(projectId)
        imageFilePath = project.georeferencedFilePath
        #get the corner coordinates
        coordinates = georef.getCornerCoordinates(imageFilePath)
        if coordinates is None:
            raise Exception("Coordinates not found")
        return coordinates
    
#Functions documentation
#project functions
def createProject(project: Project) -> int:
    """Create a project and save it to storage
    return the id of the created project

    Args:
        project (Project): The project object to create

    Returns:
        int: The id of the created project object
    """
def updateProject(projectId: int, project: Project) -> bool:
    """Update a project

    Args:
        projectId (int): The id of the project to update
        project (Project): The updated project object

    Returns:
        bool: True if the project was updated successfully, False otherwise
    """
def deleteProject(projectId: int) -> None:
    """Delete a project

    Args:
        projectId (int): The id of the project to delete
    """
def getProject(projectId: int) -> Project:
    """Get a project by id

    Args:
        projectId (int): The id of the project to get

    Returns:
        Project: The project object with the given id if it exists.
    """
def projectExists(projectId: int) -> bool:
    """Check if a project exists

    Args:
        projectId (int): The id of the project to check

    Returns:
        bool: True if the project exists, False otherwise
    """
#points functions
def getProjectPoints(projectId: int) -> List[Point]:
    """Get all points of a project

    Args:
        projectId (int): The id of the project, which points to get

    Returns:
        List[Point]: List of points (Point objects) of the project
    """
def getPoint(projectId: int, pointId: int, byDBID:bool = False) -> Point:
    """Get a point of a project by id

    Args:
        projectId (int): The id of the project, which the point belongs to
        pointId (int): The id of the point to get
        byDBID (bool, optional): Set true if point id is the ID in database. Defaults to False.

    Returns:
        Point: The point object with the given id if it exists.
    """
def removeAllProjectPoints(projectId: int) -> bool:
    """Remove all points from a project

    Args:
        projectId (int): The id of the project, which points to remove

    Returns:
        bool: True if the points were removed successfully, False otherwise
    """
def removePoint(projectId: int, pointId: int) -> bool:
    """Remove a point from a project

    Args:
        projectId (int): The id of the project, which the point belongs to
        pointId (int): The id of the point to remove (Idproj)

    Returns:
        bool: True if the point was removed successfully, False otherwise
    """
def addPoint(projectId: int, point: Point) -> int:
    """Add a point to a project

    Args:
        projectId (int): The id of the project, which the point belongs to
        point (Point): The point object to add

    Returns:
        (int, int): First the id of the point in the project and second the id of the point in the database
    """
def updatePoint(projectId: int, pointId: int, point: Point) -> bool:
    """Update a point of a project

    Args:
        projectId (int): The id of the project, which the point belongs to
        pointId (int): The id of the point to update
        point (Point): The updated point object

    Returns:
        bool: True if the point was updated successfully, False otherwise
    """
def validatepoints(points: List[Point]) -> bool:
    """Validate the points

    Args:
        points (List[Point]): The list of points to validate

    Returns:
        bool: True if the points are valid, False otherwise
    """
#files functions
def getImageFile(projectId: int) -> bytes:
    """Get the image file of a project

    Args:
        projectId (int): The id of the project, which the image belongs to

    Returns:
        bytes: The image file in bytes of the project
    """
def getImageFilePath(projectId: int) -> str:
    """Get the image file path of a project

    Args:
        projectId (int): The id of the project, which the image belongs to

    Returns:
        str: The image file path of the project
    """
def saveImageFile(projectId: int, file: tempfile, fileType: str) -> None:
    """Save the image file of a project

    Args:
        projectId (int): The id of the project, which the image belongs to
        file (tempfile): The image file to save
        fileType (str): The type of the file
    """
def removeImageFile(projectId: int) -> None:
    """Remove the image file of a project

    Args:
        projectId (int): The id of the project, which the image belongs to
    """
def getGeoreferencedFile(projectId: int) -> bytes:
    """Get the georeferenced file of a project

    Args:
        projectId (int): The id of the project, which the georeferenced file belongs to

    Returns:
        bytes: The georeferenced file in bytes of the project
    """
def getGeoreferencedFilePath(projectId: int) -> str:
    """Get the georeferenced file path of a project

    Args:
        projectId (int): The id of the project, which the georeferenced file belongs to

    Returns:
        str: The georeferenced file path of the project
    """
def saveGeoreferencedFile(projectId: int, file: bytes, fileType: str) -> None:
    """Save the georeferenced file of a project

    Args:
        projectId (int): The id of the project, which the georeferenced file belongs to
        file (bytes): The georeferenced file to save
        fileType (str): The type of the file
    """
def removeGeoreferencedFile(projectId: int) -> None:
    """Remove the georeferenced file of a project

    Args:
        projectId (int): The id of the project, which the georeferenced file belongs to
    """
#georeferencing functions
def georefPNGImage(projectId: int, crs: str = None) -> None:
    """Georeference the image of a project

    Args:
        projectId (int): The id of the project, which the image belongs to
        crs (str, optional): Cordinate refrence system. Defaults to None.
    """
def getCornerCoordinates(projectId: int):
    """Get the corner coordinates of the image of a project

    Args:
        projectId (int): The id of the project, which the image belongs to
    """