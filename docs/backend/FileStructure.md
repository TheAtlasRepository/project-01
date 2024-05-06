# Back-End File Structure

[Back to README](../README.md)

---
The intention of this file is to give a general overview of the back-end file structure, and explaining our thought-process on the responsibility and purpose of some of the files.

## Current structure (with tree cmd)

Command: `PS <path> tree /f /a`

```cmd
c://backend
|   .dockerignore
|   .env.example
|   main.py
|   pyproject.toml
|   requirements.txt
|
+---docker
|       dev.Dockerfile
|       docker-compose.backend.yml
|       prod.Dockerfile
|
\---img2mapAPI
    |   Img2mapAPI.py
    |   __init__.py
    |
    +---routers
    |       converters.py
    |       georefProject.py
    |       server.py
    |       __init__.py
    |
    \---utils
        |   projectHandler.py
        |   __init__.py
        |
        +---core
        |   |   FileHelper.py
        |   |   georefHelper.py
        |   |   ImageHelper.py
        |   |   
        |   \---helper
        |           postgresSqlHelper.py
        |           sqliteHelper.py
        |           __init__.py
        |
        +---models
        |       point.py
        |       pointList.py
        |       project.py
        |       __init__.py
        |
        \---storage
            |   __init__.py
            |
            +---data
            |       postgresSqlHandler.py
            |       sqliteLocalStorage.py
            |       storageHandler.py
            |       __init__.py
            |
            \---files
                    fileStorage.py
                    localFileStorage.py
                    s3FileStorage.py
                    __init__.py

```

## Root level files

* `.dockerignore` : Tells Docker-Daemon what files to ignore when building.

* `.env.example` : Example file showcasing Environment Variables

* `main.py` : The entrypoint script for the application. [More Info](ScriptsBuildCMD)

* `pyproject.toml`: Project package configuration and setup.

* `requirements.txt`: Local project package configuration, used in the script that starts both the front- and back-end for local development

## Directories

Showing only the directories:

```shell
+---docker
\---img2mapAPI
    +---routers
    \---utils
        +---core
        |   \---helper
        +---models
        \---storage
            +---data
            \---files
```

`docker`: Contains the Docker build-files and the docker-compose file specifically for the backend.

### Img2mapApi (top package dir)

This is the top package directory, and it contains the module that holds the FastAPI app and Setup `Img2mapAPI.py`. It also includes the following directories.

#### Routers

> Contains the API routers.

#### Utils
Contains various folders to hold different types of utilities:

1. `core` : Contains the core modules for georeferencing functions (`georefHelper.py`), image managment functions (`imageHelper.py`), general temporary file management helper functions(`FileHelper.py`), as well as containing the sub-directory below. 

    * `helper` : Contains additional helper modules

2. `models` : Contains the model classes used by the application.

3. `storage` : Contains two sub-directories, and contains the collection of classes and functions that iterate over file- and data-storage.

    * `data` : Contains the abstract class for handling data and other classes that inherit from this base class. The sub-classes implement specific handlers for various database systems, such as SQLite and PostgreSQL.
    * `files` : Contains the abstract class for handling data and other classes that inherit from this base class. The sub-classes implement specific handlers for various storage systems, such as local storage and Amazon S3 buckets.

## Major files

This section is intended to further describe important files beyond what's been explained earlier. 

> **Note:** `__init__.py` files are for module structure and importing.

1. `projectHandler.py`

    This module is part of the core and is responsible for pre-processing, preparing models, and calling needed functions and classes. It handles all things related to projects, including the projects themselves, points, and images related to the project.

2. `converters.py` & `georefProject.py`

    These files contain the routing endpoint logic. Converters calls various file editing tools such as image cropping, PDF to PNG, and image to PNG, while georefProject handles endpoint logic and mostly calls `projecthandler`, which is described above.

    georefProject does some dependency injection to give `projectHandler` the dependencies it needs to store files and data (see `storage` description).

3. `storageHandler.py` & `fileStorage.py`

    These are modules containing abstract classes with abstract functions, mimicing an interface. They are base types for dependecy injection, and implementers to inherit.

    `storageHandler` is for data storage, and manages the connection to, and interaction with, a database.

    `fileStorage` is for file storage, and manages file saving, reading, deleting, etc. Example implementiation is the class connecting to an Amazon S3 bucket to iterate over files there rather than the default local.
