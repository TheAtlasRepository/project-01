""" Main file for the Img2Map API, this file contains the main FastAPI application and the routers for the API. 
"""
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from img2mapAPI.routers import *
from dotenv import load_dotenv, get_key
import os

ENVIRONMENT = 'development'
origins = [
    "http://localhost", #for local testing
    "http://localhost:8080", # for vue dev server
    "http://localhost:3000", # for react dev server
]

#getting the environment variables for the application
if load_dotenv('./.env'):
    print("Environment variables loaded")
    try:
        origins = get_key('./.env',key_to_get='CORS_ORIGINS')
        origins = origins.split(',')
        if 'CORS_ORIGINS' in os.environ:
            osenvirons = os.environ['CORS_ORIGINS'].split(',')
            for origin in osenvirons:
                if origin not in origins:
                    origins.append(origin)
        print(f"Origins: {origins}")
    except:
        print("Error getting CORS_ORIGINS from environment variables")
        pass
    try:
        ENVIRONMENT = get_key('./.env',key_to_get='ENVIRONMENT')
    except:
        print("failed to get from environment variables from .env file, trying os.environ")
        try:
            ENVIRONMENT = os.environ['ENVIRONMENT']
        except:
            print("Error getting environment from environment variables")
            pass
        pass

else:
    if 'ENVIRONMENT' in os.environ:
        ENVIRONMENT = os.environ['ENVIRONMENT']
        print("Environment variables not loaded")
        try:
            origins = os.environ['CORS_ORIGINS'].split(',')
            print(f"Origins: {origins}")
        except:
            print("Error getting CORS_ORIGINS from environment variables, using default value")
            pass
    else:
        print("Error getting environment from environment variables, using default value")

swagger_url = "/docs"
doc_url = "/redoc"

if ENVIRONMENT == 'production':
    print("App running in production mode")
    swagger_url = None
    doc_url = None
else:
    print("App running in development mode")
    

app = FastAPI(
    title="Img2Map API",
    description="API for converting and georeferencing images",
    docs_url=swagger_url,
    redoc_url=doc_url,
)

router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Default route
@router.get("/")
async def root():
    if ENVIRONMENT == 'production':
        return {"message": "Welcome to the georeferencing API, currently this is only intended for use by the img2map application."}
    else:
        return {"message": "Welcome to the georeferencing API. Please refer to the documentation for more information. at /docs or /redoc"}

#adding the routers to the app
app.router.include_router(converters.router, prefix="/converter", tags=["File Converting & Editing"])
app.router.include_router(server.router, prefix="/serverInfo", tags=["Server Info"])
app.router.include_router(georefProject.router)
