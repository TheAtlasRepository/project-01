""" This module contains the functions to handle the project data.
"""
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
from .core.FileHelper import removeFile
import datetime

class ProjectHandler:
    """This class contains functions to handle the project. 

    By using the functions in this class, the project data can be created, updated, deleted and fetched. 
    This class also contains functions to handle the points of a project and the image and georeferenced files of a project.

    Attributes:
        _FileStorage (FileStorage): The file storage object
        _StorageHandler (StorageHandler): The storage handler object

    Functions:
        createProject(project: Project) -> int: Create a project and save it to storage
        updateProject(projectId: int, project: Project) -> bool: Update a project
        deleteProject(projectId: int) -> None: Delete a project
        getProject(projectId: int) -> Project: Get a project by id
        projectExists(projectId: int) -> bool: Check if a project exists
        getProjectPoints(projectId: int) -> List[Point]: Get all points of a project
        getPoint(projectId: int, pointId: int, byDBID:bool = False) -> Point: Get a point of a project by id
        removeAllProjectPoints(projectId: int) -> bool: Remove all points from a project
        removePoint(projectId: int, pointId: int) -> bool: Remove a point from a project
        addPoint(projectId: int, point: Point) -> int: Add a point to a project
        updatePoint(projectId: int, pointId: int, point: Point) -> bool: Update a point of a project
        validatepoints(points: List[Point]) -> bool: Validate the points
        getImageFile(projectId: int) -> bytes: Get the image file of a project
        getImageFilePath(projectId: int) -> str: Get the image file path of a project
        saveImageFile(projectId: int, file: tempfile, fileType: str) -> None: Save the image file of a project
        removeImageFile(projectId: int) -> None: Remove the image file of a project
        getGeoreferencedFile(projectId: int) -> bytes: Get the georeferenced file of a project
        getGeoreferencedFilePath(projectId: int) -> str: Get the georeferenced file path of a project
        saveGeoreferencedFile(projectId: int, file: bytes, fileType: str) -> None: Save the georeferenced file of a project
        removeGeoreferencedFile(projectId: int) -> None: Remove the georeferenced file of a project
        georefPNGImage(projectId: int, crs: str = None) -> None: Georeference the image of a project
        getImageCoordinates(projectId: int) -> List: Get the corner coordinates of the image of a project
    """

    _FileStorage: FileStorage = None
    _StorageHandler: StorageHandler = None

    def __init__(self, FileS: FileStorage, SHandler: StorageHandler):
        self._FileStorage = FileS
        self._StorageHandler = SHandler
    
    ### Projects
    async def createProject(self, project: Project) -> int:
        """Create a project and save it to storage

        Args:
            project (Project): The project object to create

        Returns:
            int: The id of the created project object
        """

        project.id = None
        project.imageFilePath = ""
        project.georeferencedFilePath = ""
        project.selfdestructtime = None #TODO: add self destruct time logic
        project.created = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        project.lastModified = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        project.points = None
        ID = await self._StorageHandler.saveInStorage(project, "project")
        return ID
    
    async def updateProject(self, projectId: int, project: Project) -> bool:
        """Update a project

        Args:
            projectId (int): The id of the project to update
            project (Project): The updated project object

        Returns:
            bool: True if the project was updated successfully, False otherwise
        """

        fetchedProject: dict = await self._StorageHandler.fetchOne(projectId, "project")
        if fetchedProject is None:
            raise Exception("Project not found")
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

        project.selfdestructtime = None #TODO: add self destruct time logic
        innProject: dict = dict(project)
        fetchedProjectDict: dict = dict(fetchedProject)
        specialFields = ["id", "created", "lastModified", "points"]
        for key in fetchedProjectDict:
            if key in innProject:
                if key == "points":
                    if project.points is not None or project.points != [] :
                        #TODO: fiks the error on updatePoints, removed for now, just cant update points atm
                        #  await self.updatePoints(projectId, project.points.points)
                        pass
                elif key not in specialFields:
                    if fetchedProjectDict[key] != innProject[key]:
                        fetchedProjectDict[key] = innProject[key]
        fetchedProject: Project = Project.model_construct(None, **fetchedProjectDict)
        try:
            await self._StorageHandler.update(projectId, fetchedProject, "project")
        except:
            return False
        return True
 
    async def deleteProject(self, projectId: int) -> None:
        """Delete a project

        Args:
            projectId (int): The id of the project to delete
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        if project is None: raise Exception("Project not found")
        if project["imageFilePath"] != "": await self._FileStorage.removeFile(project["imageFilePath"])
        if project["georeferencedFilePath"] != "": await self._FileStorage.removeFile(project["georeferencedFilePath"])

        points = await self._StorageHandler.fetch("point", {"projectId": projectId})
        for point in points:
            await self._StorageHandler.remove(point["id"], "point")
        await self._StorageHandler.remove(projectId, "project")
    
    async def getProject(self, projectId: int) -> Project:
        """Get a project by id

        Args:
            projectId (int): The id of the project to get

        Returns:
            Project: The project object with the given id if it exists.
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        project : Project = Project.model_construct(None, **project)
        if project is None: raise Exception("Project not found")
        try:
            points = await self.getProjectPoints(projectId)
        except:
            points = []

        pointList = PointList()
        for point in points:
            pointList.points.append(point)

        project.points = pointList
        return project
    
    async def projectExists(self, projectId: int) -> bool:
        """Check if a project exists

        Args:
            projectId (int): The id of the project to check

        Returns:
            bool: True if the project exists, False otherwise
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        if project is None or project == {}:
            return False
        return True

    ### Points

    async def getProjectPoints(self, projectId: int) -> List[Point]:
        """Get all points of a project

        Args:
            projectId (int): The id of the project, which points to get

        Returns:
            List[Point]: List of points (Point objects) of the project
        """
        
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        params: dict = {"projectId": projectId}
        Points = await self._StorageHandler.fetch("point", params)

        if Points is None: raise Exception("No points found")
        list: List[Point] = [Point.model_construct(None ,**point) for point in Points]
        if len(list) == 0: raise Exception("points is empty")
        return list
    
    async def getPoint(self, projectId: int, pointId: int, byDBID:bool = False) -> Point:
        """Get a point of a project by id

        Args:
            projectId (int): The id of the project, which the point belongs to
            pointId (int): The id of the point to get
            byDBID (bool, optional): Set true if point id is the ID in database. Defaults to False.

        Returns:
            Point: The point object with the given id if it exists.
        """

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
        """Remove all points from a project

        Args:
            projectId (int): The id of the project, which points to remove

        Returns:
            bool: True if the points were removed successfully, False otherwise
        """

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
        """Remove a point from a project

        Args:
            projectId (int): The id of the project, which the point belongs to
            pointId (int): The id of the point to remove (Idproj)

        Returns:
            bool: True if the point was removed successfully, False otherwise
        """

        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        params: dict = {"projectId": projectId, "Idproj": pointId}
        points = await self._StorageHandler.fetch("point", params)
        if points is not None and points != []:
            await self._StorageHandler.remove(points[0]["id"], "point")
            return True
        raise Exception("Point not found")

    async def addPoint(self, projectId: int, point: Point) -> int:
        """Add a point to a project

        Args:
            projectId (int): The id of the project, which the point belongs to
            point (Point): The point object to add

        Returns:
            (int, int): First the id of the point in the project and second the id of the point in the database
        """
         
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        list: List[Point] = []
        list.append(point)
        if self.validatepoints(list) == False: 
            raise Exception("Invalid point")
        point.projectId = projectId
        point.id = None
        point.error = None
        points = await self._StorageHandler.fetch("point", {"projectId": projectId}) #format: List[dict] [{pointdict},{pointdict},{pointdict}]
        if points is None or points == []:
            point.Idproj = 1
        else:
            point.Idproj = 1
            ids = [p["Idproj"] for p in points]  # List of IDs taken from the database
            while point.Idproj in ids:
                point.Idproj += 1
        
        dbid = await self._StorageHandler.saveInStorage(point, "point", "id")
        if dbid is None:
            raise Exception("Failed to save point")
        return (point.Idproj, dbid)

    async def updatePoint(self, projectId: int, pointId: int, point: Point) -> bool:
        """Update a point of a project

        Args:
            projectId (int): The id of the project, which the point belongs to
            pointId (int): The id of the point to update
            point (Point): The updated point object

        Returns:
            bool: True if the point was updated successfully, False otherwise
        """
        
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        if self.validatepoints([point]) == False:
            raise Exception("Invalid point")
        
        params: dict = {"projectId": projectId, "Idproj": pointId}
        fetchedPointDict = await self._StorageHandler.fetch("point", params)
        if fetchedPointDict is None:
            raise Exception("Point not found")
        fetchedPointDict = fetchedPointDict[0]
        updatedPoint: Point = Point.model_construct(None, **fetchedPointDict)
        #Tranfering values
        updatedPoint.lat = point.lat
        updatedPoint.lng = point.lng
        updatedPoint.col = point.col
        updatedPoint.row = point.row
        updatedPoint.error = point.error
        updatedPoint.name = point.name
        updatedPoint.description = point.description

        newpoint : Point = updatedPoint
        dbid = fetchedPointDict["id"]
        await self._StorageHandler.update(dbid, newpoint, "point")
        return True

    def validatepoints(self, points: List[Point]) -> bool:
        """Validate the points

        Args:
            points (List[Point]): The list of points to validate

        Returns:
            bool: True if the points are valid, False otherwise
        """
        
        for point in points:
            if isinstance(point, Point) == False:
                try:
                    point = Point.model_construct(None, **point)
                    if point is None:
                        raise Exception("Invalid point object")
                except:
                    raise Exception("Invalid point object")
            if hasattr(point, "lat") == False or hasattr(point, "lng") == False or hasattr(point, "col") == False or hasattr(point, "row") == False:
                raise Exception("Failed to validate points attributes")
                #return False #TODO: check if this is the correct way to handle this
            if point.lat is None or point.lng is None or point.col is None or point.row is None:
                return False
            
        return True
    
    ### Files
    async def getImageFile(self, projectId: int) -> bytes:
        """Get the image file of a project

        Args:
            projectId (int): The id of the project, which the image belongs to

        Returns:
            bytes: The image file in bytes of the project
        """
        
        project = await self._StorageHandler.fetchOne(projectId, "project")
        filePath = project["imageFilePath"]
        file = await self._FileStorage.get(filePath)
        if file is None:
            raise Exception("File not found")
        return file
    
    async def getImageFilePath(self, projectId: int) -> str:
        """Get the image file path of a project

        Args:
            projectId (int): The id of the project, which the image belongs to

        Returns:
            str: The image file path of the project
        """
        
        project = await self._StorageHandler.fetchOne(projectId, "project")
        return project["imageFilePath"]
    
    async def saveImageFile(self, projectId: int, file: tempfile, fileType: str) -> None:
        """Save the image file of a project

        Args:
            projectId (int): The id of the project, which the image belongs to
            file (tempfile): The image file to save
            fileType (str): The type of the file
        """
        
        if await self.projectExists(projectId) == False:
            raise Exception("Project not found")
        if fileType.find("png") == -1:
            raise Exception(status_code=415, description="Invalid file type")
        
        project = await self._StorageHandler.fetchOne(projectId, "project")

        if "imageFilePath" in project and project["imageFilePath"]:
            await self._FileStorage.removeFile(project["imageFilePath"])

        filePath = await self._FileStorage.saveFile(file, ".png")
        project["imageFilePath"] = filePath
        await self._StorageHandler.update(projectId, project, "project")

    async def removeImageFile(self, projectId: int) -> None:
        """Remove the image file of a project

        Args:
            projectId (int): The id of the project, which the image belongs to
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        await self._FileStorage.remove(project["imageFilePath"])
        project["imageFilePath"] = ""
        await self._StorageHandler.update(projectId, project, "project")
    
    async def getGeoreferencedFile(self, projectId: int) -> bytes:
        """Get the georeferenced file of a project

        Args:
            projectId (int): The id of the project, which the georeferenced file belongs to

        Returns:
            bytes: The georeferenced file in bytes of the project
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        filePath = project["georeferencedFilePath"]
        file = await self._FileStorage.readFile(filePath)
        if file is None:
            raise Exception("File not found")
        return file

    async def getGeoreferencedFilePath(self, projectId: int) -> str:
        """Get the georeferenced file path of a project

        Args:
            projectId (int): The id of the project, which the georeferenced file belongs to

        Returns:
            str: The georeferenced file path of the project
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        return project["georeferencedFilePath"]
          
    async def saveGeoreferencedFile(self, projectId: int, file: bytes, fileType: str) -> None:
        """Save the georeferenced file of a project

        Args:
            projectId (int): The id of the project, which the georeferenced file belongs to
            file (bytes): The georeferenced file to save
            fileType (str): The type of the file
        """

        if fileType.find("tiff") == -1:
            raise Exception("Invalid file type")
        
        project = await self._StorageHandler.fetchOne(projectId, "project")

        if "georeferencedFilePath" in project and project["georeferencedFilePath"]:
            await self.removeGeoreferencedFile(projectId)

        filePath = await self._FileStorage.saveFile(file, ".tiff")

        project["georeferencedFilePath"] = filePath
        await self._StorageHandler.update(projectId, project, "project")

    async def removeGeoreferencedFile(self, projectId: int) -> None:
        """Remove the georeferenced file of a project

        Args:
            projectId (int): The id of the project, which the georeferenced file belongs to
        """

        project = await self._StorageHandler.fetchOne(projectId, "project")
        await self._FileStorage.removeFile(project["georeferencedFilePath"])
        project["georeferencedFilePath"] = ""
        await self._StorageHandler.update(projectId, project, "project")
    
    ### Georeferencing
    async def georefPNGImage(self, projectId: int, crs: str = None) -> None:
        """Georeference the image of a project

        Args:
            projectId (int): The id of the project, which the image belongs to
            crs (str, optional): Cordinate refrence system. Defaults to None.
        """

        #get the project and read the image file
        project = await self.getProject(projectId)
        imageBytes = await self._FileStorage.readFile(project.imageFilePath)

        #write the image bytes to a temporary image file
        with tempfile.NamedTemporaryFile(delete=False) as temp_image:
            temp_image.write(imageBytes)
            temp_image_path = temp_image.name

        #get the points of the project and georeference the image
        points : PointList = project.points
        temp_georeferenced_image = None
        if crs is None:
            temp_georeferenced_image = georef.InitialGeoreferencePngImage(temp_image_path, points) #goreference the image, return the path to the georeferenced file
        else:
            temp_georeferenced_image = georef.InitialGeoreferencePngImage(temp_image_path, points, crs) #goreference the image, return the path to the georeferenced file

        #we are done with the temporary image file, remove it
        removeFile(temp_image_path)

        # if for some reason the image could not be georeferenced, raise an exception
        if temp_georeferenced_image is None:
            raise Exception("Image could not be georeferenced")
        
        #get the bytes of the georeferenced image, remove the temporary file and save the bytes to storage
        with open(temp_georeferenced_image, 'rb') as file:
            georeferenced_image_bytes = file.read()
        removeFile(temp_georeferenced_image)
        await self.saveGeoreferencedFile(projectId, georeferenced_image_bytes, "tiff")

    async def getImageCoordinates(self, projectId: int):
        """Get the corner coordinates of the image of a project

        Arguments:
            projectId (int): The id of the project

        Returns:
            [west, north, east south]: A list of corner coordinates in the order
        """

        # get the project and read the image file
        project = await self.getProject(projectId)
        image = project.georeferencedFilePath
        image_bytes = await self._FileStorage.readFile(image)
        coordinates = None

        # create a temporary file and get the image coordinates, then remove the temporary file
        with tempfile.NamedTemporaryFile(delete=False) as temp:
            temp.write(image_bytes)
            temp_path = temp.name
            temp.close()
            coordinates = georef.getImageCoordinates(temp_path)
            removeFile(temp_path)

        # if the coordinates could not be found, raise an exception, otherwise return the coordinates
        if coordinates is None:
            raise Exception("Coordinates not found")
        return coordinates
 