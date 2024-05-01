# Filestruck

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

## Modules
