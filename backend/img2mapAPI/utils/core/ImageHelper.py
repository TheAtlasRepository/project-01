from fastapi import UploadFile
from typing import List
from pdf2image import convert_from_path
from PIL import Image
from .FileHelper import getUniqeFileName, removeFile
from typing import Tuple
import tempfile

#function to convert a .pdf page to .png
async def pdf2png(file: UploadFile, page_number) -> Tuple[str, str]:
    #local setup
    tempPdf = getUniqeFileName('pdf') 
    tempImage = getUniqeFileName('png') 
    image_name = file.filename[:-4] +'p'+ str(page_number) + '.png'
    #save the .pdf file
    with open(tempPdf, 'w+b') as pdf:
        pdf.write(await file.read())
    #convert the .pdf to .png
    img = open(tempImage, 'w+b')
    images: List[Image.Image] = convert_from_path(tempPdf)
    images[page_number-1].save(img, 'PNG')
    images[page_number-1].close()
    img.close()
    removeFile(tempPdf)
    return tempImage, image_name

#function to convert an image to .png
async def image2png(file: UploadFile) -> Tuple[str, str]:
    #local setup
    inputImage = getUniqeFileName('png')
    image_name = file.filename.rpartition('.')[0] + '.png'
    #save the image
    with open(inputImage, 'w+b') as img:
        img.write(await file.read())
    
    image = Image.open(inputImage)
    png_image = image.convert('RGB')
    image.close()
    tempImage = getUniqeFileName('png')
    with open(tempImage, 'w+b') as img:
        png_image.save(img, 'PNG')
    
    removeFile(inputImage)
    return tempImage, image_name

#function to check if a file is an image and is not a .png file or a file that PIL can't convert to .png
def isImageSupported(file: UploadFile) -> bool:
    #file types that PIL can't convert to png, but have image headers
    unsupported_types = ['image/svg+xml', 'image/ERF', 'image/NRW', 'image/ORF', 'image/PEF', 'image/RAF', 'image/RW2']
    if not file.content_type.startswith('image/'):
        return False
    if file.content_type in unsupported_types:
        return False
    return True

#function to crop a .png image
async def cropPng(file: UploadFile, p1x: int, p1y: int, p2x: int, p2y: int) -> Tuple[str, str]:
    inputImage = getUniqeFileName('png')
    #save the image
    with open(inputImage, 'w+b') as img:
        img.write(await file.read())

    tempImage = getUniqeFileName('png')
    # Open the image file
    image = Image.open(inputImage)
    # Crop image and save it to a new temporary file
    cropped = image.crop((p1x, p1y, p2x, p2y))
    with open(tempImage, 'w+b') as img:
        cropped.save(img, 'PNG')
        image.close()

    newfileName = file.filename[:-4] + 'cropped.png'
    removeFile(inputImage)
    return tempImage, newfileName

#Functions documentation
def pdf2png(file: UploadFile, page_number) -> Tuple[str, str]:
    """Converts a .pdf file to a .png file.

    Args:
        file (UploadFile): _description_
        page_number (_type_): page number to convert

    Returns:
        Tuple[str, str]: Tuple of the path to the .png file and the name of the .png file
    """
def image2png(file: UploadFile) -> Tuple[str, str]:
    """Converts an image file to a .png file.

    Args:
        file (UploadFile): image file to convert

    Returns:
        Tuple[str, str]: Tuple of the path to the .png file and the name of the .png file
    """
def isImageSupported(file: UploadFile) -> bool:
    """Checks if a file is an image and is not a file that PIL can't convert to .png.

    Args:
        file (UploadFile): file to check

    Returns:
        bool: True if the file is an image and is not a .png file or a file that PIL can't convert to .png, False otherwise
    """
def cropPng(file: UploadFile, p1x: int, p1y: int, p2x: int, p2y: int) -> Tuple[str, str]:
    """Crops a .png image.

    Args:
        file (UploadFile): .png image to crop
        p1x (int): X coordinate of the first point
        p1y (int): Y coordinate of the first point
        p2x (int): X coordinate of the second point
        p2y (int): Y coordinate of the second point

    Returns:
        Tuple[str, str]: cropped .png image and the name of the cropped .png image
    """
  