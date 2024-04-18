""" This package contains all storage implementations for the API.

Modules:
    - files: Contains the file storage implementations
    - data: Contains the data storage implementations
"""

from . import files
from . import data

__ALL__ = ["filestorage", "storageHandler"]