""" This package is used to store the file storage classes. 

Modules:
    - fileStorage: Contains the abstract base class for file storage
    - localFileStorage: Contains the local file storage implementation
"""

from . import fileStorage
from . import localFileStorage

__All__ = ["fileStorage", "localFileStorage"]
