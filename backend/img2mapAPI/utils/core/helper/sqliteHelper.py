""" This module is used to create a database folder and create a new database file in the folder. SQLite is used as the database engine.

The module contains the following attributes:
- DatabaseFolderPath: The path to the database folder.
- defaultDBfolder: The default name of the database folder.

The module contains the following functions:
- setDatabaseFolder(folder: str): Sets the folder where the database files are stored.
- createDBfolder(folder: str = defaultDBfolder): Creates the database folder if it does not exist.
- createNewDatabase(DBName: str): Creates a new database file in the database folder.
"""

import sqlite3
import os

_root_path: str = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
DatabaseFolderPath: str = ''
defaultDBfolder: str = 'database'

def setDatabaseFolder(folder: str):
    """Sets the folder where the database files are stored.

    Args:
        folder (str): The folder path
    """  

    global DatabaseFolderPath
    createDBfolder(folder)
    DatabaseFolderPath = folder

def createDBfolder(folder: str = defaultDBfolder):
    """Creates the database folder if it does not exist.

    Args:
        folder (str, optional): Spesify the name of the directory. Defaults to the value of defaultDBfolder Attribute.
    """

    global DatabaseFolderPath
    DatabaseFolderPath = os.path.join(_root_path, folder)
    os.makedirs(DatabaseFolderPath, exist_ok=True)

def createNewDatabase(DBName: str):
    """Creates a new database file in the database folder.

    Args:
        DBName (str): The name of the database file

    Returns:
        str: The path to the database file
    """

    createDBfolder()
    db = os.path.join(DatabaseFolderPath, DBName)
    if not os.path.isfile(db):
        conn = sqlite3.connect(db)
        conn.close()
        return db
    else:
        return db
    
