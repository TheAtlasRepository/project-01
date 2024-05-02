# Scripts, Builds & CMD

[Back to README](../README.md)

---
The purpose of this document is to give insight into the methodes of running the backend FastAPI application and it's nuances.

## Main.py

Entrypoint Script
Main command `python main.py`
> Optional flags:
>
> * `-p` or `--port` : Defines the port on which the server runs. Default `8000`
> * `-M` or `--mode` : Defines if the server should run in development or production mode. Accepted Values: `dev` or `prod`, default `dev`. Running in devlopment will auto reload/restart the server if changes are made to the code.
>

The Main.py when run as a script, produces a uvicorn server configured by the script, when default arguments are provided it will be hosted at `0.0.0.0:8000/` or `localhost:8000/`.

**Note:** If a .env file is present in the backend directory it will attempt to retrive `HOST_PORT` if no port argument is given.

## Other related notes

At some point in the development lifetime it was possible to run the application directly in the console with uvicorn, but with the new structure and needed imports this is currently not possible without some rework.

If changing the work with uvicorn the workes option is not properly supported by the application if no external storage is spesified for files or Data. Another challange with workers is the distribution of task is not done by the application.
