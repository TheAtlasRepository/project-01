""" This file contains helper functions for file operations in the API server for temporary files
"""
import os
import shutil

#This file contains helper functions for file operations in the API server for temporary files


#checking if /tmp folder exists
def getTmpFolderPath():
    """Returns the path to the temp folder
    """
    
    if not os.path.exists('./temp'):
        os.makedirs('./temp')
    return './temp'

def clearTmpFolder():
    """Clears the temp folder
    """

    print("Clearing the temp folder") #TODO: Log this properly
    temp_folder = os.path.join('.', 'temp')
    if not os.path.exists(temp_folder):
        print("Temp folder does not exist")
        return
    
    items = os.listdir(temp_folder)

    for itemname in items:
        item_path = os.path.join(temp_folder, itemname)
        try:
            if os.path.isfile(item_path):
                print(f"Deleting file {item_path}")
                os.unlink(item_path)
            elif os.path.isdir(item_path):
                print(f"Deleting directory {item_path}")
                shutil.rmtree(item_path)
        except Exception as e:
            print(f"Error deleting item {item_path}: {e}")

def getUniqeFileName(suffix : str, length=8):
    """Creates a unique file name in the temp folder

    Args:
        suffix (str): The suffix of the file name
        length (int, optional): Lenght of filename. Defaults to 8.

    Raises:
        Exception: Could not create a unique file name

    Returns:
        str: The unique file name, including the path to the temp folder
    """

    import random
    import string
    if not os.path.exists('./temp'):
        getTmpFolderPath()
    if suffix[0] == '.':
        suffix = suffix[1:]
    suffix = suffix.lower()
    i = 0
    while True:
        randomName = ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
        if not os.path.isfile(f"./temp/{randomName}.{suffix}"):
            return f"./temp/{randomName}.{suffix}"
        if i == 100:
            raise Exception("Could not create a unique file name")
        i += 1

def removeFile(filePath):
    """Removes a file if it exists

    Args:
        filePath (str): The path to the file
    """

    #remove the file if it exists
    if os.path.isfile(filePath):
        os.remove(filePath)

def createEmptyFile(suffix):
    """Creates an empty file in the temp folder

    Args:
        suffix (str): The suffix of the file name

    Returns:
        str: The path to the empty file
    """

    #create a temporary file
    with open(getUniqeFileName(suffix), "w") as file:
        file.write("")
    return file.name
