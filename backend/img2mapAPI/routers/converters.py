""" This module contains the API router with endpoints for file conversion. 

The module contains the following endpoints:
    - Convert a .pdf file to a .png file
    - Convert an image to a .png file
    - Crop a .png file
"""

from fastapi import APIRouter, BackgroundTasks, File, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse
#internal imports
from ..utils.core.ImageHelper import pdf2png, isImageSupported
from ..utils.core.ImageHelper import image2png as imageToPng
from ..utils.core.ImageHelper import cropPng as cropApng
from ..utils.core.FileHelper import removeFile as delFile

#API router for file conversion
router = APIRouter()

@router.post('/pdf2png')
async def pdfPage2png(background_tasks: BackgroundTasks, page_number: int = 1, file: UploadFile = File(...)):
    """ **Converts a .pdf file to a .png file of given page _default=1_.** """
    #failsafe checks
    if file.content_type != 'application/pdf':
        raise HTTPException(status_code=415, detail='File must be a .pdf file')
    if page_number < 0:
        raise HTTPException(status_code=411, detail='Body content must be at least 1 page')
    if page_number > 100:
        raise HTTPException(status_code=413, detail='Page number must be less than 100')
    
    try:
        (NewImageFile, image_name) = await pdf2png(file, page_number)
        background_tasks.add_task(delFile, NewImageFile) #create a background task to remove the temporary file
        return FileResponse(NewImageFile, media_type='image/png', filename=image_name, background=background_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
@router.post('/image2png')
async def image2png(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """ **Converts an image to a .png file.** """
    if file.content_type == 'image/png':
        raise HTTPException(status_code=400, detail='File is already a .png file')
    if isImageSupported(file) == False:
        raise HTTPException(status_code=415, detail=f'File is a {file.content_type} file, which is not supported')
    
    try:
        (NewImageFile, image_name) = await imageToPng(file)
        background_tasks.add_task(delFile, NewImageFile) #create a background task to remove the temporary file
        return FileResponse(NewImageFile, media_type='image/png', filename=image_name, background=background_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post('/cropPng')
async def cropPng(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    p1x: int = Query(0, description="X coordinate of the first point"), 
    p1y: int = Query(0, description="Y coordinate of the first point"), 
    p2x: int = Query(16, description="X coordinate of the second point"), 
    p2y: int = Query(16, description="Y coordinate of the second point")
):
    """
    **Crops a PNG**

    p1x is left side of image, p1y is top side of image, combined they are top left corner

    p2x is right side of image, p2y is bottom side of image, combined they are bottom right corner
    """
    #failsafe checks
    if file.content_type != 'image/png':
        raise HTTPException(status_code=415, detail='File is not a .png file')
    
    try:
        (NewImageFile, image_name) = await cropApng(file, p1x, p1y, p2x, p2y)
        background_tasks.add_task(delFile, NewImageFile)
        return FileResponse(NewImageFile, media_type='image/png', filename=image_name, background=background_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 