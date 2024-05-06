# Scripts, Builds & CMD

[Back to README](../README.md)

---
The purpose of this document is to give insight into the methods of running the backend FastAPI application and its nuances.

## Main.py

Entrypoint Script
Main command `python main.py`
> Optional flags:
>
> * `-p` or `--port` : Defines the port on which the server runs. Default is `8000`
> * `-M` or `--mode` : Defines whether the server should run in development or production mode. Accepted values: `dev` or `prod`, default `dev`. Running in development mode will enable the backend documentation (Swagger and Redoc) and auto reload/restart the server if changes are made to the code.
>

When main.py is ran as a script, it creates a Uvicorn server configured by the script. When the default arguments are provided it will be hosted at `0.0.0.0:8000/` or `localhost:8000/`.

**Note:** If a .env file is present in the backend directory it will attempt to retrieve `HOST_PORT` if no port argument is given.

## Other related notes

At some point in the development lifetime it was possible to run the application directly in the console with Uvicorn, but with the new structure and needed imports this is currently not possible without some rework.

If you're not using external storage, uvicorn's workers option might not function properly. Additionally, the application doesn't handle task distribution among workers, posing another challenge.
