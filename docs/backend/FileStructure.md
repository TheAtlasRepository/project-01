# Filestructure

[Back to README](../README.md)

---
The intention of this file is to give a general overview of the filestruckture, and explaining our thought process on the responsibility and purpose of/for a file.

## Current structur (with tree cmd)

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

* `.dockerignore` : Tells Docker-Deamon what files to ignore when building.

* `.env.example` : Evironment varibles example file

* `main.py` : The entrypoint script for the application. [More Info](ScriptsBuildCMD)

* `pyproject.toml`: Project package configuration and setup.

* `requirements.txt`: Local requirments file for running

## Directories

Showing only the Dirs:

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

`docker`: Contains the Docker build files and docker-compose file spesificly for the backend.

### Img2mapApi (top package dir)

This is the top package directory, it contains the module which holds the FastAPI app and Setup `Img2mapAPI.py`, and below these directories.

#### Routers

> Contain two api routers.

#### Utils

1. `core` : Conatins the sub dir below, and the core modules for georef function (`georefHelper.py`), Image managment functions(`imageHelper.py`) & general temp file managment help functions(`FileHelper.py`).

    * `helper` : Contains additional helper modules, (aka other functions)

2. `models` : Contains the model classes used by the application.

3. `storage` : Contains two sub dirs, collection for classes and functions dealing with storage of files or data.

    * `data` : Contains the abstract class for datahandling and other classe who inherith from this base class and implement spesifik handlers for database interaction.
    * `files` : Same principel as above, just handeling file storage instead.

## Major files

This is mainly to cover more on files (Modules) that need more description then what is given by the previous section.

> **Note:** `__init__.py` files is for module structure and importing.

1. `projectHandler.py`

    This module is part of the core and is resposible for pre-prossesing, preparing models, calling needed functions and classes. It handels all things related to projects, this includes projects, points & images related to the project.

2. `converters.py` & `georefProject.py`

    They contain the routing endpoint logic, converters is image cropping, pdf to image and image to image and georefProject handels endpoint logic and mostly call `projecthandler`.

    georefProject does some dependency injection to give `projectHandeler` the deps it need to store files and data (see `storage` description).

3. `storageHandler.py` & `fileStorage.py`

    They are modules conatining abstract classes with abstract functions, mimicing a interface. They are bases to be used as types for dependecy injection, and implementers to inherit.

    `storageHandler` is for Data storage, commonly manage connection to a database.

    `fileStorage` is for file storage, example implementiation is a class connecting to Amazone S3, saving, deleting, fecthing etc.
